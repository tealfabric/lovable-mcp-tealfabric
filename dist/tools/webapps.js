import { z } from "zod";
export function registerWebappTools(server, run) {
    server.registerTool("tealfabric_list_webapps", {
        description: "List Tealfabric webapps for the authenticated tenant. Optionally filter by search or limit.",
        inputSchema: z.object({
            search: z.string().optional().describe("Search by name or description"),
            limit: z.number().optional().describe("Max results (default 50)"),
        }),
    }, async ({ search, limit }, extra) => run(extra, (client) => client.listWebapps({ search, limit })));
    server.registerTool("tealfabric_get_webapp", {
        description: "Get a single Tealfabric webapp by ID. Optionally request a specific version.",
        inputSchema: z.object({
            webapp_id: z.string().describe("Webapp UUID"),
            version: z.number().optional().describe("Version number (optional)"),
        }),
    }, async ({ webapp_id, version }, extra) => run(extra, (client) => client.getWebapp(webapp_id, version)));
    server.registerTool("tealfabric_create_webapp", {
        description: "Create a new Tealfabric webapp. Returns the new webapp_id.",
        inputSchema: z.object({
            name: z.string().describe("Webapp name"),
            description: z.string().optional(),
            page_content: z.string().optional(),
            page_header: z.string().optional(),
            page_footer: z.string().optional(),
            custom_css: z.string().optional(),
            custom_js: z.string().optional(),
            process_id: z.string().optional().describe("Link to a process ID"),
        }),
    }, async (args, extra) => run(extra, (client) => client.createWebapp(args)));
    server.registerTool("tealfabric_update_webapp", {
        description: "Update an existing Tealfabric webapp (e.g. page_content, name).",
        inputSchema: z.object({
            webapp_id: z.string().describe("Webapp UUID"),
            name: z.string().optional(),
            description: z.string().optional(),
            page_content: z.string().optional(),
            page_header: z.string().optional(),
            page_footer: z.string().optional(),
            custom_css: z.string().optional(),
            custom_js: z.string().optional(),
            process_id: z.string().nullable().optional(),
        }),
    }, async ({ webapp_id, ...body }, extra) => run(extra, (client) => client.updateWebapp(webapp_id, body)));
    server.registerTool("tealfabric_publish_webapp", {
        description: "Publish a Tealfabric webapp (make the current version live).",
        inputSchema: z.object({ webapp_id: z.string().describe("Webapp UUID") }),
    }, async ({ webapp_id }, extra) => run(extra, (client) => client.publishWebapp(webapp_id)));
}
