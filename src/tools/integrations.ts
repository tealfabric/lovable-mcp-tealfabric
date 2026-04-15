import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolRunner } from "./types.js";

export function registerIntegrationTools(server: McpServer, run: ToolRunner): void {
  server.registerTool(
    "tealfabric_list_integrations",
    {
      description:
        "List integrations or query integration details/status/statistics/execution history via action filters.",
      inputSchema: z.object({
        action: z
          .enum(["get", "statistics", "test", "status", "execution-history"])
          .optional()
          .describe("Optional action; omit to list all integrations"),
        integration_id: z.string().optional().describe("Integration ID (for get/test/execution-history)"),
        execution_id: z.string().optional().describe("Execution ID (for status action)"),
        limit: z.number().int().optional().describe("Limit for execution-history action"),
        search: z.string().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
        is_active: z.union([z.literal(0), z.literal(1)]).optional().describe("1=enabled, 0=disabled"),
        page: z.number().int().min(1).optional(),
        items_per_page: z.union([z.literal(10), z.literal(25), z.literal(50), z.literal(100)]).optional(),
        sort_by: z.enum(["name", "type", "status", "is_active", "created_at", "updated_at"]).optional(),
        sort_direction: z.enum(["ASC", "DESC"]).optional(),
      }),
    },
    async (args, extra) => run(extra, (client) => client.listIntegrations(args))
  );

  server.registerTool(
    "tealfabric_create_integration",
    {
      description: "Create a new integration.",
      inputSchema: z.object({
        name: z.string().describe("Integration name"),
        type: z.string().describe("Integration type"),
        description: z.string().optional(),
        connector_id: z.string().optional(),
        status: z.string().optional(),
        is_active: z.boolean().optional().describe("Whether integration is enabled"),
      }),
    },
    async (args, extra) => run(extra, (client) => client.createIntegration(args))
  );

  server.registerTool(
    "tealfabric_update_integration",
    {
      description: "Update an existing integration.",
      inputSchema: z.object({
        integration_id: z.string().describe("Integration ID"),
        name: z.string().optional(),
        type: z.string().optional(),
        description: z.string().optional(),
        connector_id: z.string().optional(),
        status: z.string().optional(),
        is_active: z.boolean().optional(),
      }),
    },
    async ({ integration_id, ...body }, extra) =>
      run(extra, (client) => client.updateIntegration(integration_id, body))
  );
}
