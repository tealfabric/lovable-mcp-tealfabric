import test from "node:test";
import assert from "node:assert/strict";

const ENV_KEYS = [
  "MCP_TRANSPORT",
  "MCP_SERVER_NAME",
  "MCP_SERVER_VERSION",
  "TEALFABRIC_API_URL",
  "TEALFABRIC_API_KEY",
  "TEALFABRIC_AUTH_SOURCE",
  "TEALFABRIC_REQUEST_TIMEOUT_MS",
  "TEALFABRIC_RETRY_COUNT",
  "TEALFABRIC_RETRY_BASE_DELAY_MS",
  "TEALFABRIC_ALLOW_LOCAL_FILE_UPLOAD",
  "MCP_HTTP_HOST",
  "MCP_HTTP_PORT",
  "MCP_SERVER_API_KEY",
];

function withCleanEnv(fn) {
  const snapshot = {};
  for (const key of ENV_KEYS) {
    snapshot[key] = process.env[key];
    delete process.env[key];
  }
  try {
    fn();
  } finally {
    for (const key of ENV_KEYS) {
      if (snapshot[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = snapshot[key];
      }
    }
  }
}

test("loadRuntimeConfig applies secure defaults", async () => {
  const { loadRuntimeConfig } = await import("../dist/config.js");
  withCleanEnv(() => {
    const config = loadRuntimeConfig();
    assert.equal(config.transport, "stdio");
    assert.equal(config.tealfabricApiUrl, "https://tealfabric.io");
    assert.equal(config.allowLocalFileUpload, false);
    assert.equal(config.tealfabricAuthSource, "auto");
    assert.equal(config.httpHost, "127.0.0.1");
    assert.equal(config.httpPort, 3000);
  });
});
