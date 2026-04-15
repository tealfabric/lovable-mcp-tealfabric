import test from "node:test";
import assert from "node:assert/strict";

const baseConfig = {
  transport: "stdio",
  serverName: "tealfabric",
  serverVersion: "1.0.0",
  tealfabricApiUrl: "https://tealfabric.io",
  tealfabricApiKey: undefined,
  tealfabricAuthSource: "auto",
  tealfabricRequestTimeoutMs: 15000,
  tealfabricRetryCount: 2,
  tealfabricRetryBaseDelayMs: 250,
  allowLocalFileUpload: false,
  httpHost: "127.0.0.1",
  httpPort: 3000,
  mcpServerApiKey: undefined,
};

function makeExtra(token) {
  return {
    signal: new AbortController().signal,
    requestId: "1",
    sendNotification: async () => undefined,
    sendRequest: async () => undefined,
    authInfo: token ? { token, clientId: "test", scopes: [] } : undefined,
  };
}

test("resolveTealfabricApiKey uses request token in auto mode", async () => {
  const { resolveTealfabricApiKey } = await import("../dist/runtime.js");
  const config = { ...baseConfig, tealfabricAuthSource: "auto" };
  const key = resolveTealfabricApiKey(makeExtra("request-key"), config);
  assert.equal(key, "request-key");
});

test("resolveTealfabricApiKey falls back to env key in auto mode", async () => {
  const { resolveTealfabricApiKey } = await import("../dist/runtime.js");
  const config = { ...baseConfig, tealfabricAuthSource: "auto", tealfabricApiKey: "env-key" };
  const key = resolveTealfabricApiKey(makeExtra(undefined), config);
  assert.equal(key, "env-key");
});

test("resolveTealfabricApiKey requires request token in request mode", async () => {
  const { resolveTealfabricApiKey } = await import("../dist/runtime.js");
  const config = { ...baseConfig, tealfabricAuthSource: "request" };
  assert.throws(() => resolveTealfabricApiKey(makeExtra(undefined), config));
});
