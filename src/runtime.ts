import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type { ServerNotification, ServerRequest } from "@modelcontextprotocol/sdk/types.js";
import { createTealfabricClient, type TealfabricClient } from "./client.js";
import type { RuntimeConfig } from "./config.js";

export type ToolExtra = RequestHandlerExtra<ServerRequest, ServerNotification>;

export function resolveTealfabricApiKey(extra: ToolExtra, config: RuntimeConfig): string {
  const requestToken = extra.authInfo?.token;

  switch (config.tealfabricAuthSource) {
    case "env":
      if (!config.tealfabricApiKey) {
        throw new Error("TEALFABRIC_API_KEY is required when TEALFABRIC_AUTH_SOURCE=env");
      }
      return config.tealfabricApiKey;
    case "request":
      if (!requestToken) {
        throw new Error(
          "Tealfabric API key is missing in request auth context. Provide Bearer token or x-api-key."
        );
      }
      return requestToken;
    case "auto":
    default:
      if (requestToken) return requestToken;
      if (config.tealfabricApiKey) return config.tealfabricApiKey;
      throw new Error(
        "No Tealfabric API key available. Set TEALFABRIC_API_KEY or provide Bearer token/x-api-key."
      );
  }
}

export function createScopedClient(extra: ToolExtra, config: RuntimeConfig): TealfabricClient {
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
