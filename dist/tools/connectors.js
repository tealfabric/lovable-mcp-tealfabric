import { z } from "zod";
export function registerConnectorTools(server, run) {
    server.registerTool("tealfabric_list_connectors", {
        description: "List Tealfabric connectors, get a specific connector, or fetch connector parameters.",
        inputSchema: z.object({
            action: z.enum(["get", "parameters"]).optional().describe("Optional action; omit to list all"),
            connector_id: z.string().optional().describe("Connector ID (for action=get when supported)"),
        }),
    }, async ({ action, connector_id }, extra) => run(extra, (client) => client.listConnectors({ action, connector_id })));
    server.registerTool("tealfabric_test_connector", {
        description: "Test a connector configuration payload against the Tealfabric connectors test endpoint.",
        inputSchema: z.object({
            payload: z
                .record(z.unknown())
                .describe("Connector configuration payload expected by the selected connector"),
        }),
    }, async ({ payload }, extra) => run(extra, (client) => client.testConnector(payload)));
    server.registerTool("tealfabric_get_connector_oauth2_required", {
        description: "Check whether a connector requires OAuth2 authentication.",
        inputSchema: z.object({
            connector_id: z.string().describe("Connector ID"),
        }),
    }, async ({ connector_id }, extra) => run(extra, (client) => client.getConnectorOAuth2Required(connector_id)));
}
