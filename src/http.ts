import { randomUUID } from "crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Request, Response } from "express";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type { RuntimeConfig } from "./config.js";

type RequestWithAuth = IncomingMessage & { auth?: AuthInfo };

function getRequestToken(req: IncomingMessage): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }
  const apiKeyHeader = req.headers["x-api-key"];
  if (typeof apiKeyHeader === "string" && apiKeyHeader.length > 0) {
    return apiKeyHeader;
  }
  return undefined;
}

function attachRequestAuth(req: RequestWithAuth, config: RuntimeConfig): string | undefined {
  const token = getRequestToken(req);

  if (config.mcpServerApiKey) {
    if (!token || token !== config.mcpServerApiKey) {
      return undefined;
    }
  }

  if (token) {
    req.auth = {
      token,
      clientId: "external-client",
      scopes: [],
    };
  }

  return token;
}

type SessionState = {
  transport: StreamableHTTPServerTransport;
  server: McpServer;
};

export async function startHttpServer(
  config: RuntimeConfig,
  createServer: () => McpServer
): Promise<void> {
  const app = createMcpExpressApp({ host: config.httpHost });
  const sessions: Record<string, SessionState> = {};

  app.post("/mcp", async (req: Request, res: Response) => {
    const token = attachRequestAuth(req as RequestWithAuth, config);
    if (config.mcpServerApiKey && !token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let session = sessionId ? sessions[sessionId] : undefined;

    if (!session) {
      if (!isInitializeRequest(req.body)) {
        res.status(400).json({
          error: "Bad Request: no valid session ID provided and this is not an initialize request",
        });
        return;
      }

      const server = createServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          sessions[id] = { transport, server };
        },
      });
      transport.onclose = async () => {
        if (transport.sessionId) {
          delete sessions[transport.sessionId];
        }
        await server.close();
      };

      await server.connect(transport);
      session = { transport, server };
    }

    await session.transport.handleRequest(
      req as RequestWithAuth,
      res as unknown as ServerResponse,
      req.body
    );
  });

  app.get("/mcp", async (req: Request, res: Response) => {
    const token = attachRequestAuth(req as RequestWithAuth, config);
    if (config.mcpServerApiKey && !token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions[sessionId]) {
      res.status(400).json({ error: "Invalid or missing session ID" });
      return;
    }

    await sessions[sessionId].transport.handleRequest(
      req as RequestWithAuth,
      res as unknown as ServerResponse
    );
  });

  app.delete("/mcp", async (req: Request, res: Response) => {
    const token = attachRequestAuth(req as RequestWithAuth, config);
    if (config.mcpServerApiKey && !token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions[sessionId]) {
      res.status(400).json({ error: "Invalid or missing session ID" });
      return;
    }

    await sessions[sessionId].transport.handleRequest(
      req as RequestWithAuth,
      res as unknown as ServerResponse
    );
  });

  await new Promise<void>((resolve, reject) => {
    app.listen(config.httpPort, config.httpHost, (error?: Error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  console.error(`Tealfabric MCP Streamable HTTP listening on http://${config.httpHost}:${config.httpPort}/mcp`);
}
