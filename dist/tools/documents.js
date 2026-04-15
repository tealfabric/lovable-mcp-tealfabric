import { z } from "zod";
export function registerDocumentTools(server, run) {
    server.registerTool("tealfabric_list_documents", {
        description: "List documents/files in a Tealfabric documents directory. Use for browsing package files.",
        inputSchema: z.object({
            path: z.string().optional().describe("Directory path (e.g. packages/, or root if omitted)"),
            tenant_id: z.string().optional().describe("Tenant ID (defaults to authenticated tenant)"),
        }),
    }, async ({ path, tenant_id }, extra) => run(extra, (client) => client.listDocuments({ path, tenant_id })));
    server.registerTool("tealfabric_get_document_metadata", {
        description: "Get metadata for a document/file in Tealfabric documents storage.",
        inputSchema: z.object({
            file_path: z.string().describe("Full path to the file (e.g. packages/report-v1.zip)"),
            tenant_id: z.string().optional().describe("Tenant ID (defaults to authenticated tenant)"),
        }),
    }, async ({ file_path, tenant_id }, extra) => run(extra, (client) => client.getDocumentMetadata({ file_path, tenant_id })));
    server.registerTool("tealfabric_upload_document", {
        description: "Upload a file to Tealfabric documents storage. Use to publish built package files for delivery. The file is stored in destination_path using the uploaded file's name.",
        inputSchema: z.object({
            destination_path: z
                .string()
                .describe("Directory path on the server (without filename). File keeps its original name (e.g. packages/ or packages/reports/)"),
            file_path: z
                .string()
                .describe("Local filesystem path to the file to upload (e.g. ./dist/package.zip)"),
            tenant_id: z.string().optional().describe("Tenant ID (defaults to authenticated tenant)"),
        }),
    }, async ({ destination_path, file_path, tenant_id }, extra) => run(extra, (client) => client.uploadDocument({ destination_path, file_path, tenant_id })));
    server.registerTool("tealfabric_move_document", {
        description: "Move or rename a file/directory in Tealfabric documents storage. Use to update package paths or reorganize.",
        inputSchema: z.object({
            old_path: z.string().describe("Current path of the file or directory"),
            new_path: z.string().describe("Destination path"),
            tenant_id: z.string().optional().describe("Tenant ID (defaults to authenticated tenant)"),
        }),
    }, async ({ old_path, new_path, tenant_id }, extra) => run(extra, (client) => client.moveDocument({ old_path, new_path, tenant_id })));
    server.registerTool("tealfabric_delete_document", {
        description: "Delete a file or directory from Tealfabric documents storage.",
        inputSchema: z.object({
            path: z.string().describe("Path to the file or directory to delete"),
            tenant_id: z.string().optional().describe("Tenant ID (defaults to authenticated tenant)"),
        }),
    }, async ({ path, tenant_id }, extra) => run(extra, (client) => client.deleteDocument({ path, tenant_id })));
}
