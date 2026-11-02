import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { authTransportEnum, pageSizeEnum, webappTypeEnum } from "./schemas.js";
import type { ToolRunner } from "./types.js";

export function registerWebappTools(server: McpServer, run: ToolRunner): void {
  server.registerTool(
    "tealfabric_list_webapps",
    {
      description: "List Tealfabric webapps for the authenticated tenant.",
      inputSchema: z.object({
        search: z.string().optional().describe("Search by name or description"),
        page: z.number().int().min(1).optional(),
        items_per_page: pageSizeEnum.optional(),
        type: z.string().optional(),
        published_only: z.boolean().optional(),
        process_id: z.string().optional(),
        sort_by: z.enum(["name", "type", "created_at", "updated_at", "version"]).optional(),
        sort_direction: z.enum(["ASC", "DESC"]).optional(),
      }),
    },
    async (args, extra) => run(extra, (client) => client.listWebapps(args))
  );

  server.registerTool(
    "tealfabric_get_webapp",
    {
      description: "Get a single Tealfabric webapp by ID. Optionally request a specific version.",
      inputSchema: z.object({
        webapp_id: z.string().describe("Webapp UUID"),
        version: z.number().optional().describe("Version number (optional)"),
      }),
    },
    async ({ webapp_id, version }, extra) => run(extra, (client) => client.getWebapp(webapp_id, version))
  );

  server.registerTool(
    "tealfabric_create_webapp",
    {
      description:
        "Create a new Tealfabric webapp (unpublished by default). Requires name, type, page_content, and webapp_user_id.",
      inputSchema: z.object({
        name: z.string().describe("Webapp name"),
        type: webappTypeEnum.describe("Webapp type"),
        page_content: z.string().describe("HTML page content"),
        webapp_user_id: z
          .string()
          .describe("Users.user_id with role webapp_user (required; never use tenant_admin)"),
        description: z.string().optional(),
        code_snippet: z.string().optional(),
        page_head: z.string().optional(),
        page_header: z.string().optional(),
        page_footer: z.string().optional(),
        custom_css: z.string().optional(),
        custom_js: z.string().optional(),
        process_id: z.string().optional().describe("Link to a process ID"),
        version: z.number().optional(),
        is_published: z.boolean().optional(),
        http_headers: z.unknown().optional(),
        custom_security_policy: z.string().optional(),
        custom_referrer_policy: z.string().optional(),
        auth_transport: authTransportEnum.optional(),
        auth_require: z.boolean().optional(),
        public_uri_host: z.string().optional(),
        public_uri_path: z.string().optional(),
        public_uris: z.unknown().optional(),
      }),
    },
    async (args, extra) => run(extra, (client) => client.createWebapp(args))
  );

  server.registerTool(
    "tealfabric_update_webapp",
    {
      description: "Update an existing Tealfabric webapp (content, auth, public URI, etc.).",
      inputSchema: z.object({
        webapp_id: z.string().describe("Webapp UUID"),
        name: z.string().optional(),
        description: z.string().optional(),
        webapp_user_id: z.string().optional(),
        process_id: z.string().nullable().optional(),
        page_content: z.string().optional(),
        code_snippet: z.string().optional(),
        page_head: z.string().optional(),
        page_header: z.string().optional(),
        page_footer: z.string().optional(),
        custom_css: z.string().optional(),
        custom_js: z.string().optional(),
        http_headers: z.unknown().optional(),
        custom_security_policy: z.string().optional(),
        custom_referrer_policy: z.string().optional(),
        auth_transport: authTransportEnum.optional(),
        auth_require: z.boolean().optional(),
        public_uri_host: z.string().optional(),
        public_uri_path: z.string().optional(),
        public_uris: z.unknown().optional(),
        version: z.number().optional().describe("Pin update to a numeric version when supported"),
        version_id: z.union([z.string(), z.number()]).optional(),
      }),
    },
    async ({ webapp_id, ...body }, extra) => run(extra, (client) => client.updateWebapp(webapp_id, body))
  );

  server.registerTool(
    "tealfabric_publish_webapp",
    {
      description: "Publish a Tealfabric webapp version (make that version live).",
      inputSchema: z.object({
        webapp_id: z.string().describe("Webapp UUID"),
        version: z.number().int().positive().describe("Version number to publish (required)"),
      }),
    },
    async ({ webapp_id, version }, extra) =>
      run(extra, (client) => client.publishWebapp(webapp_id, version))
  );

  server.registerTool(
    "tealfabric_unpublish_webapp",
    {
      description: "Unpublish a Tealfabric webapp (take it offline).",
      inputSchema: z.object({
        webapp_id: z.string().describe("Webapp UUID"),
      }),
    },
    async ({ webapp_id }, extra) => run(extra, (client) => client.unpublishWebapp(webapp_id))
  );

  server.registerTool(
    "tealfabric_create_webapp_version",
    {
      description: "Create a new unpublished version of a webapp (copies latest version).",
      inputSchema: z.object({
        webapp_id: z.string().describe("Webapp UUID"),
      }),
    },
    async ({ webapp_id }, extra) => run(extra, (client) => client.createWebappVersion(webapp_id))
  );

  server.registerTool(
    "tealfabric_delete_webapp",
    {
      description: "Delete a Tealfabric webapp by ID.",
      inputSchema: z.object({
        webapp_id: z.string().describe("Webapp UUID"),
      }),
    },
    async ({ webapp_id }, extra) => run(extra, (client) => client.deleteWebapp(webapp_id))
  );
}
