#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadRuntimeConfig } from "./config.js";
import { startHttpServer } from "./http.js";
import { createScopedClient } from "./runtime.js";
import { jsonContent, resultContent } from "./tools/content.js";
import { registerTealfabricTools } from "./tools/register.js";
function buildServer(config) {
    const server = new McpServer({ name: config.serverName, version: config.serverVersion }, { capabilities: { tools: {} } });
    const run = async (extra, execute) => {
        try {
            const client = createScopedClient(extra, config);
            const out = await execute(client);
            return { content: resultContent(out) };
        }
        catch (error) {
            return {
                content: jsonContent(`Error: ${error instanceof Error ? error.message : String(error)}`),
            };
        }
    };
    registerTealfabricTools(server, run);
    return server;
}
async function main() {
    const config = loadRuntimeConfig();
    if (config.transport === "http") {
        await startHttpServer(config, () => buildServer(config));
        return;
    }
    const server = buildServer(config);
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
