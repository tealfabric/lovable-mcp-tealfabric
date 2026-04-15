import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerConnectorTools } from "./connectors.js";
import { registerDocumentTools } from "./documents.js";
import { registerIntegrationTools } from "./integrations.js";
import { registerProcessTools } from "./processes.js";
import type { ToolRunner } from "./types.js";
import { registerWebappTools } from "./webapps.js";

export function registerTealfabricTools(server: McpServer, run: ToolRunner): void {
  registerConnectorTools(server, run);
  registerIntegrationTools(server, run);
  registerWebappTools(server, run);
  registerProcessTools(server, run);
  registerDocumentTools(server, run);
}
