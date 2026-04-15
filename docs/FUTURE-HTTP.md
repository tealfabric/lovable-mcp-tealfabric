# Future feature: Streamable HTTP transport

The codebase includes an optional **Streamable HTTP** transport (`MCP_TRANSPORT=http`) for **self-hosted** remote MCP endpoints. This is **not** required for **[Lovable Desktop local MCP](LOVABLE.md)** (stdio + `node dist/index.js`).

Use this path only if you plan to host the server behind HTTPS and connect a client that speaks MCP over HTTP (for example, future “custom MCP server URL” flows in hosted products).

---

## When to use

- You operate a **long-running Node process** reachable at a stable URL (often behind a reverse proxy).
- You want to **gate** inbound requests with `MCP_SERVER_API_KEY` (Bearer or `x-api-key`).

---

## How to run (development)

```bash
npm run build
MCP_TRANSPORT=http MCP_HTTP_HOST=0.0.0.0 MCP_HTTP_PORT=3000 node dist/index.js
```

The MCP endpoint path is **`/mcp`** (see `src/http.ts`).

---

## Environment variables (HTTP-specific)

| Variable | Description |
|----------|-------------|
| `MCP_TRANSPORT` | Must be `http`. |
| `MCP_HTTP_HOST` | Bind address (default `127.0.0.1`). |
| `MCP_HTTP_PORT` | Port (default `3000`). |
| `MCP_SERVER_API_KEY` | Optional. If set, clients must send this value as `Authorization: Bearer <key>` or `x-api-key`. |

Tealfabric API authentication still uses `TEALFABRIC_API_KEY` / `TEALFABRIC_AUTH_SOURCE` as documented in the main README.

---

## Production notes

- Terminate TLS at your reverse proxy; do not expose plain HTTP on the public internet.
- Plan for **process restarts**, **logging**, and **rate limiting** like any internal API.
- This mode is **experimental** from a product perspective; the **supported** path for Lovable in this repo is **local Desktop MCP** per [LOVABLE.md](LOVABLE.md).

---

## References

- MCP Streamable HTTP is implemented via `@modelcontextprotocol/sdk` (`StreamableHTTPServerTransport`).
- Lovable’s web app “custom MCP server URL” flows are described in [Personal connectors](https://docs.lovable.dev/integrations/mcp-servers) (paid plans); validate against your own deployment before relying on it.
