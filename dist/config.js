import { z } from "zod";
const runtimeConfigSchema = z.object({
    transport: z.enum(["stdio", "http"]).default("stdio"),
    serverName: z.string().default("tealfabric"),
    serverVersion: z.string().default("0.0.0"),
    tealfabricApiUrl: z.string().url().default("https://tealfabric.io"),
    tealfabricApiKey: z.string().optional(),
    tealfabricAuthSource: z.enum(["auto", "env", "request"]).default("auto"),
    tealfabricRequestTimeoutMs: z.number().int().positive().default(15000),
    tealfabricRetryCount: z.number().int().min(0).max(5).default(2),
    tealfabricRetryBaseDelayMs: z.number().int().min(50).max(5000).default(250),
    allowLocalFileUpload: z.boolean().default(false),
    httpHost: z.string().default("127.0.0.1"),
    httpPort: z.number().int().positive().default(3000),
    mcpServerApiKey: z.string().optional(),
});
const parseBoolean = (value, fallback) => {
    if (value === undefined)
        return fallback;
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};
const parseNumber = (value, fallback) => {
    if (!value)
        return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
export function loadRuntimeConfig() {
    const parsed = runtimeConfigSchema.safeParse({
        transport: process.env.MCP_TRANSPORT ?? "stdio",
        serverName: process.env.MCP_SERVER_NAME ?? "tealfabric",
        serverVersion: process.env.MCP_SERVER_VERSION ?? process.env.npm_package_version ?? "0.0.0",
        tealfabricApiUrl: process.env.TEALFABRIC_API_URL ?? "https://tealfabric.io",
        tealfabricApiKey: process.env.TEALFABRIC_API_KEY,
        tealfabricAuthSource: process.env.TEALFABRIC_AUTH_SOURCE ?? "auto",
        tealfabricRequestTimeoutMs: parseNumber(process.env.TEALFABRIC_REQUEST_TIMEOUT_MS, 15000),
        tealfabricRetryCount: parseNumber(process.env.TEALFABRIC_RETRY_COUNT, 2),
        tealfabricRetryBaseDelayMs: parseNumber(process.env.TEALFABRIC_RETRY_BASE_DELAY_MS, 250),
        allowLocalFileUpload: parseBoolean(process.env.TEALFABRIC_ALLOW_LOCAL_FILE_UPLOAD, false),
        httpHost: process.env.MCP_HTTP_HOST ?? "127.0.0.1",
        httpPort: parseNumber(process.env.MCP_HTTP_PORT, 3000),
        mcpServerApiKey: process.env.MCP_SERVER_API_KEY,
    });
    if (!parsed.success) {
        throw new Error(`Invalid runtime configuration: ${parsed.error.message}`);
    }
    return parsed.data;
}
