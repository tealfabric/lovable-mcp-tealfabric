# Tealfabric MCP Server (Lovable Desktop — local)

[MCP](https://modelcontextprotocol.io) server that connects **[Lovable Desktop](https://docs.lovable.dev/integrations/desktop-app)** to the **[Tealfabric](https://tealfabric.io)** platform: webapps, ProcessFlow, documents, connectors, and integrations.

**Recommended setup:** run locally with **stdio** (default) and add the server under **Settings → Connectors → Local MCP servers** in Lovable Desktop. See **[docs/LOVABLE.md](docs/LOVABLE.md)** for step-by-step instructions.

Streamable **HTTP** mode exists for optional self-hosted deployments and is documented as a **[future feature](docs/FUTURE-HTTP.md)** — not required for Lovable Desktop.

---

## Prerequisites

- **Node.js 18+**
- **Tealfabric API key** (Tealfabric → User settings → API Keys, or your team’s process)

---

## Install

```bash
git clone <this-repo-url>
cd lovable-mcp-tealfabric
npm install
npm run build
```

---

## Lovable Desktop

Follow **[docs/LOVABLE.md](docs/LOVABLE.md)** for:

- Adding a **local MCP server** with `command` + `args` pointing at `dist/index.js`
- Setting `TEALFABRIC_API_KEY` (and optional `TEALFABRIC_API_URL`)
- Smoke testing and troubleshooting

Official Lovable references: [Desktop app](https://docs.lovable.dev/integrations/desktop-app), [MCP / personal connectors](https://docs.lovable.dev/integrations/mcp-servers).

---

## Optional: JSON config for other MCP hosts

If your environment uses a JSON file to register stdio MCP servers, see **[examples/mcp-stdio.example.json](examples/mcp-stdio.example.json)** and **[examples/README.md](examples/README.md)**. Lovable Desktop’s primary path remains the in-app **Local MCP servers** UI.

---

## Tools

| Tool | Description |
|------|-------------|
| `tealfabric_list_connectors` | List connectors (optional action: get, parameters) |
| `tealfabric_test_connector` | Test connector configuration |
| `tealfabric_get_connector_oauth2_required` | Check whether connector requires OAuth2 |
| `tealfabric_list_integrations` | List integrations or query by action/filter |
| `tealfabric_create_integration` | Create a new integration |
| `tealfabric_update_integration` | Update an existing integration |
| `tealfabric_list_webapps` | List webapps (optional: search, limit) |
| `tealfabric_get_webapp` | Get one webapp by ID (optional version) |
| `tealfabric_create_webapp` | Create a new webapp |
| `tealfabric_update_webapp` | Update webapp (e.g. page_content, name) |
| `tealfabric_publish_webapp` | Publish a webapp |
| `tealfabric_list_processes` | List ProcessFlow processes |
| `tealfabric_get_process` | Get one process by ID |
| `tealfabric_list_process_steps` | List steps of a process |
| `tealfabric_get_process_step` | Get one process step by step_id |
| `tealfabric_execute_process` | Execute a process (optional input) |
| `tealfabric_create_process` | Create a new process (process flow) |
| `tealfabric_update_process` | Update an existing process |
| `tealfabric_create_process_step` | Create a new step in a process flow |
| `tealfabric_update_process_step` | Update an existing process step |
| `tealfabric_list_documents` | List documents in a directory |
| `tealfabric_get_document_metadata` | Get file metadata |
| `tealfabric_upload_document` | Upload a file (e.g. built package); requires `TEALFABRIC_ALLOW_LOCAL_FILE_UPLOAD=true` |
| `tealfabric_move_document` | Move or rename file/directory |
| `tealfabric_delete_document` | Delete file or directory |

---

## Environment variables

### Local MCP (Lovable Desktop, stdio)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TEALFABRIC_API_KEY` | Yes* | — | Tealfabric API key (`X-API-Key`). *With `TEALFABRIC_AUTH_SOURCE=auto`, request-based auth can apply in advanced clients. |
| `TEALFABRIC_API_URL` | No | `https://tealfabric.io` | Tealfabric base URL |
| `TEALFABRIC_AUTH_SOURCE` | No | `auto` | `auto`, `env`, or `request` — see [DEVELOPER.md](docs/DEVELOPER.md) |
| `TEALFABRIC_REQUEST_TIMEOUT_MS` | No | `15000` | API request timeout (ms) |
| `TEALFABRIC_RETRY_COUNT` | No | `2` | Retries for transient failures |
| `TEALFABRIC_RETRY_BASE_DELAY_MS` | No | `250` | Retry backoff base (ms) |
| `TEALFABRIC_ALLOW_LOCAL_FILE_UPLOAD` | No | `false` | Set `true` to enable `tealfabric_upload_document` reading local paths |
| `MCP_TRANSPORT` | No | `stdio` | Keep default for local install |

### Future: HTTP transport only

| Variable | Description |
|----------|-------------|
| `MCP_TRANSPORT` | Set to `http` for Streamable HTTP (see [docs/FUTURE-HTTP.md](docs/FUTURE-HTTP.md)) |
| `MCP_HTTP_HOST` | Bind host (default `127.0.0.1`) |
| `MCP_HTTP_PORT` | Port (default `3000`) |
| `MCP_SERVER_API_KEY` | Optional gate for inbound MCP HTTP requests |

---

## Future feature: remote HTTP

Optional self-hosted **Streamable HTTP** (`MCP_TRANSPORT=http`) is documented in **[docs/FUTURE-HTTP.md](docs/FUTURE-HTTP.md)**. It is **not** part of the Lovable Desktop local install path.

---

## Security

- Do not commit real API keys. Keep secrets in Lovable’s connector settings, your shell profile, or a local file that is gitignored (for example `mcp.local.json` — see [.gitignore](.gitignore)).
- Tealfabric keys are scoped to your user/tenant; use least privilege where the platform allows.

---

## Documentation

| Doc | Purpose |
|-----|---------|
| **[docs/LOVABLE.md](docs/LOVABLE.md)** | Lovable Desktop local MCP (start here) |
| [docs/DEVELOPER.md](docs/DEVELOPER.md) | Developers: structure, API mapping, extending |
| [docs/FUTURE-HTTP.md](docs/FUTURE-HTTP.md) | Optional remote HTTP transport |
| [examples/](examples/) | Optional stdio JSON config reference |
| [Tealfabric platform](https://tealfabric.io/docs) | WebApps, ProcessFlow, APIs |

---

## Related projects

Tealfabric ships the same MCP surface in three client-focused repositories:

| Client | Repository |
|--------|------------|
| **Lovable** (this repo) | Lovable Desktop — you are here |
| **Cursor** | [tealfabric/cursor-mcp-tealfabric](https://github.com/tealfabric/cursor-mcp-tealfabric) |
| **Claude** | [tealfabric/claude-mcp-tealfabric](https://github.com/tealfabric/claude-mcp-tealfabric) |

---

## Scripts

| Script | Command |
|--------|---------|
| Build | `npm run build` |
| Run (stdio) | `npm start` |
| Tests | `npm test` |
| Build + test | `npm run check` |
| HTTP (future) | `npm run start:http` |
