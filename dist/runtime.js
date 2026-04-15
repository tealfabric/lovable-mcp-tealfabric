import { createTealfabricClient } from "./client.js";
export function resolveTealfabricApiKey(extra, config) {
    const requestToken = extra.authInfo?.token;
    switch (config.tealfabricAuthSource) {
        case "env":
            if (!config.tealfabricApiKey) {
                throw new Error("TEALFABRIC_API_KEY is required when TEALFABRIC_AUTH_SOURCE=env");
            }
            return config.tealfabricApiKey;
        case "request":
            if (!requestToken) {
                throw new Error("Tealfabric API key is missing in request auth context. Provide Bearer token or x-api-key.");
            }
            return requestToken;
        case "auto":
        default:
            if (requestToken)
                return requestToken;
            if (config.tealfabricApiKey)
                return config.tealfabricApiKey;
            throw new Error("No Tealfabric API key available. Set TEALFABRIC_API_KEY or provide Bearer token/x-api-key.");
    }
}
export function createScopedClient(extra, config) {
    const apiKey = resolveTealfabricApiKey(extra, config);
    return createTealfabricClient({
        baseUrl: config.tealfabricApiUrl,
        apiKey,
        requestTimeoutMs: config.tealfabricRequestTimeoutMs,
        retryCount: config.tealfabricRetryCount,
        retryBaseDelayMs: config.tealfabricRetryBaseDelayMs,
        allowLocalFileUpload: config.allowLocalFileUpload,
    });
}
