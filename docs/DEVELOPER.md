# Tealfabric MCP Server — Developer Documentation

This document is for developers who want to use, configure, or extend the **Tealfabric MCP Server** for the Tealfabric platform. End-user setup for **Lovable Desktop** is in **[LOVABLE.md](LOVABLE.md)**.

**Tealfabric platform documentation:** [https://tealfabric.io/docs](https://tealfabric.io/docs) — use this as the reference for WebApps, ProcessFlow, APIs, and platform concepts.

---

## Table of contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Installation and build](#3-installation-and-build)
4. [Client configuration](#4-client-configuration)
5. [Tools reference](#5-tools-reference)
6. [Tealfabric API mapping](#6-tealfabric-api-mapping)
7. [Environment variables](#7-environment-variables)
8. [Security and API keys](#8-security-and-api-keys)
9. [Project structure](#9-project-structure)
10. [Extending the server](#10-extending-the-server)
11. [Troubleshooting](#11-troubleshooting)
12. [References](#12-references)

---

## 1. Overview

The Tealfabric MCP Server is an **MCP (Model Context Protocol) server** that runs locally (stdio) and talks to the Tealfabric REST API. The documented client for this repository is **Lovable Desktop** (local MCP). Other MCP clients that spawn a stdio process can use the same binary.

It lets the AI assistant:

- **List** connectors and check connector OAuth2 requirements
- **List, create, and update** integrations
- **List** webapps and ProcessFlow processes/steps
- **Read** webapp and process details
- **Create** and **update** webapps (e.g. `page_content`, name)
- **Publish** webapps
- **Execute** ProcessFlow processes (with optional input)
- **Create** and **update** processes (process flows)
- **Create** and **update** process steps
- **List, upload, move, delete** documents (package files for delivery)

The server is **standalone**: it only depends on Node.js, npm packages (`@modelcontextprotocol/sdk`, `zod`), and the Tealfabric API. It does not depend on the Tealfabric codebase.

- **Transports:** **stdio** (default; Lovable Desktop local MCP) and optional **Streamable HTTP** (`/mcp`) for self-hosted remote use — see [FUTURE-HTTP.md](FUTURE-HTTP.md).
- **Authentication:** `TEALFABRIC_API_KEY` for typical local use; request-scoped token and/or env key when `TEALFABRIC_AUTH_SOURCE` is set — see environment table below.

---

## 2. Prerequisites

- **Node.js 18+**
- **Tealfabric account** and an **API key**
  - Create keys in the Tealfabric UI (e.g. User settings → API Keys) or via `POST /api/v1/api-keys` when logged in.
- For **Lovable Desktop**: macOS and the [Lovable Desktop app](https://docs.lovable.dev/integrations/desktop-app) (local MCP).

---

## 3. Installation and build

```bash
cd lovable-mcp-tealfabric
npm install
npm run build
```

- **Output:** `dist/index.js` (and `dist/client.js`). Lovable Desktop or the shell runs `node dist/index.js` over stdio.
- **Scripts:**
  - `npm run build` — compile TypeScript
  - `npm run start` — run `node dist/index.js` (for manual testing)
  - `npm run start:http` — run Streamable HTTP server (`MCP_TRANSPORT=http`)
  - `npm run dev` — build then run

---

## 4. Client configuration

### Lovable Desktop (local MCP)

Use **stdio** (default). Build the project, then register a **local MCP server** with `command` + `args` pointing at `dist/index.js`, and set `TEALFABRIC_API_KEY` in the MCP server environment.

Full steps: **[LOVABLE.md](LOVABLE.md)**. Official reference: [Lovable Desktop — MCP servers](https://docs.lovable.dev/integrations/desktop-app).

### Other MCP hosts (stdio + JSON config)

If your tool uses a JSON file to register stdio servers, use **[examples/mcp-stdio.example.json](../examples/mcp-stdio.example.json)** as a template: set `command`, `args` (absolute path to `dist/index.js`), and `env` for `TEALFABRIC_API_KEY` / `TEALFABRIC_API_URL`. See **[examples/README.md](../examples/README.md)**.

### Optional: HTTP transport (future / self-hosted)

See **[FUTURE-HTTP.md](FUTURE-HTTP.md)**. Not used for Lovable Desktop local MCP.

---

## 5. Tools reference

All tools return JSON (or error text) in MCP content. Parameters are validated with Zod schemas.

| Tool | Description | Parameters |
|------|-------------|------------|
| `tealfabric_list_connectors` | List connectors, get connector details, or get connector parameters | `action` (optional: `get`, `parameters`), `connector_id` (optional) |
| `tealfabric_test_connector` | Test connector configuration | `payload` (object) |
| `tealfabric_get_connector_oauth2_required` | Check if a connector requires OAuth2 | `connector_id` |
| `tealfabric_list_integrations` | List integrations or query by action/filter | optional: `action`, `integration_id`, `execution_id`, `limit`, `search`, `type`, `status`, `is_active`, `page`, `items_per_page`, `sort_by`, `sort_direction` |
| `tealfabric_create_integration` | Create a new integration | `name`, `type`, optional: `description`, `connector_id`, `status`, `is_active` |
| `tealfabric_update_integration` | Update an existing integration | `integration_id`, optional: `name`, `type`, `description`, `connector_id`, `status`, `is_active` |
| `tealfabric_list_webapps` | List webapps for the authenticated tenant | `search` (optional), `limit` (optional) |
| `tealfabric_get_webapp` | Get one webapp by ID | `webapp_id`, `version` (optional) |
| `tealfabric_create_webapp` | Create a new webapp | `name`, optional: `description`, `page_content`, `page_header`, `page_footer`, `custom_css`, `custom_js`, `process_id` |
| `tealfabric_update_webapp` | Update an existing webapp | `webapp_id`, optional: `name`, `description`, `page_content`, `page_header`, `page_footer`, `custom_css`, `custom_js`, `process_id` |
| `tealfabric_publish_webapp` | Publish a webapp (make current version live) | `webapp_id` |
| `tealfabric_list_processes` | List ProcessFlow processes | (none) |
| `tealfabric_get_process` | Get one process by ID | `process_id` |
| `tealfabric_list_process_steps` | List steps of a process | `process_id` |
| `tealfabric_get_process_step` | Get one process step by step_id | `step_id` |
| `tealfabric_execute_process` | Execute a process | `process_id`, `input` (optional object) |
| `tealfabric_create_process` | Create a new process (process flow) | `name`, optional: `description`, `type`, `status`, `version`, `category`, `tags`, etc. |
| `tealfabric_update_process` | Update an existing process | `process_id`, optional: `name`, `description`, `status`, etc. |
| `tealfabric_create_process_step` | Create a new step in a process flow | `process_id`, `step_name`, optional: `step_type`, `description`, `code_snippet`, etc. |
| `tealfabric_update_process_step` | Update an existing process step | `step_id`, optional: `step_name`, `description`, `code_snippet`, etc. |
| `tealfabric_list_documents` | List documents in a directory | `path` (optional), `tenant_id` (optional) |
| `tealfabric_get_document_metadata` | Get file metadata | `file_path`, `tenant_id` (optional) |
| `tealfabric_upload_document` | Upload a file (e.g. built package) | `destination_path`, `file_path`, `tenant_id` (optional) |
| `tealfabric_move_document` | Move or rename file/directory | `old_path`, `new_path`, `tenant_id` (optional) |
| `tealfabric_delete_document` | Delete file or directory | `path`, `tenant_id` (optional) |

For WebApp and ProcessFlow concepts (what a webapp, process, or step is), see [https://tealfabric.io/docs](https://tealfabric.io/docs) (e.g. Process Automation, WebApps).

---

## 6. Tealfabric API mapping

The connector calls the Tealfabric REST API under the hood. All requests use the base URL from `TEALFABRIC_API_URL` and send `X-API-Key: <TEALFABRIC_API_KEY>`.

| Tool | HTTP | Tealfabric endpoint |
|------|------|---------------------|
| `tealfabric_list_connectors` | GET | `/connectors` (+ optional `?action=&connector_id=`) |
| `tealfabric_test_connector` | POST | `/connectors?action=test` (JSON body: connector config payload) |
| `tealfabric_get_connector_oauth2_required` | GET | `/connectors/{connectorId}/oauth2-required` |
| `tealfabric_list_integrations` | GET | `/integrations` (+ optional query filters/actions) |
| `tealfabric_create_integration` | POST | `/integrations?action=create` (JSON body) |
| `tealfabric_update_integration` | PUT | `/integrations?action=update` (body includes `integration_id`) |
| `tealfabric_list_webapps` | GET | `/api/v1/webapps` (+ optional `?search=&limit=`) |
| `tealfabric_get_webapp` | GET | `/api/v1/webapps/{id}` (+ optional `?version=`) |
| `tealfabric_create_webapp` | POST | `/api/v1/webapps` (JSON body) |
| `tealfabric_update_webapp` | PUT | `/api/v1/webapps/{id}` (JSON body) |
| `tealfabric_publish_webapp` | POST | `/api/v1/webapps/{id}/publish` |
| `tealfabric_list_processes` | GET | `/api/v1/processflow?action=processes` |
| `tealfabric_get_process` | GET | `/api/v1/processflow?action=process&process_id={id}` |
| `tealfabric_list_process_steps` | GET | `/api/v1/processflow?action=steps&process_id={id}` |
| `tealfabric_get_process_step` | GET | `/api/v1/processflow?action=step&step_id={id}` |
| `tealfabric_execute_process` | POST | `/api/v1/processflow?action=execute-process` (body: `process_id`, `input`) |
| `tealfabric_create_process` | POST | `/api/v1/processes?action=create` (JSON body) |
| `tealfabric_update_process` | PUT | `/api/v1/processes?action=update` (body: `process_id`, …) |
| `tealfabric_create_process_step` | POST | `/api/v1/processes?action=create-step` (body: `process_id`, `step_name`, …) |
| `tealfabric_update_process_step` | PUT | `/api/v1/processes?action=update-step` (body: `step_id`, …) |
| `tealfabric_list_documents` | GET | `/api/v1/documents?action=list` (+ optional `path`, `tenant_id`) |
| `tealfabric_get_document_metadata` | GET | `/api/v1/documents?action=metadata&file_path={path}` |
| `tealfabric_upload_document` | POST | `/api/v1/documents?action=upload` (multipart: `destination_path`, `file`) |
| `tealfabric_move_document` | PUT | `/api/v1/documents?action=move` (body: `old_path`, `new_path`) |
| `tealfabric_delete_document` | DELETE | `/api/v1/documents?action=delete&path={path}` |

Full API and platform behaviour are documented at [https://tealfabric.io/docs](https://tealfabric.io/docs) (ProcessFlow API, WebApps, Documents, etc.).

---

## 7. Environment variables

| Variable | Required | Default | Description |
|---------|----------|---------|-------------|
| `TEALFABRIC_API_KEY` | Conditionally | — | Fallback key for Tealfabric API (`env` mode or fallback in `auto`). |
| `TEALFABRIC_API_URL` | No | `https://tealfabric.io` | Base URL of the Tealfabric API (no trailing slash). |
| `TEALFABRIC_AUTH_SOURCE` | No | `auto` | `auto`, `env`, or `request`. |
| `TEALFABRIC_REQUEST_TIMEOUT_MS` | No | `15000` | Timeout per API request in milliseconds. |
| `TEALFABRIC_RETRY_COUNT` | No | `2` | Retries for retryable network/HTTP failures. |
| `TEALFABRIC_RETRY_BASE_DELAY_MS` | No | `250` | Base retry backoff in milliseconds. |
| `TEALFABRIC_ALLOW_LOCAL_FILE_UPLOAD` | No | `false` | Enables local file access in upload tool. |
| `MCP_TRANSPORT` | No | `stdio` | `stdio` or `http`. |
| `MCP_HTTP_HOST` | No | `127.0.0.1` | Host bind for HTTP transport. |
| `MCP_HTTP_PORT` | No | `3000` | Port for HTTP transport. |
| `MCP_SERVER_API_KEY` | No | — | Optional API key required by incoming HTTP requests. |

Set these in **Lovable Desktop** local MCP server settings, your optional JSON config `env` block, or in the shell when running `node dist/index.js` manually.

---

## 8. Security and API keys

- **Do not commit** real API keys. Prefer Lovable Desktop connector settings or a local gitignored file (for example `mcp.local.json`; see repo `.gitignore`).
- API keys are **tenant- and user-scoped** in Tealfabric; restrict scopes as the platform supports them.
- The connector only uses **HTTPS** and does not log the key; it sends it only in the `X-API-Key` header to `TEALFABRIC_API_URL`.

---

## 9. Project structure

```
lovable-mcp-tealfabric/
├── package.json
├── tsconfig.json
├── README.md
├── docs/
│   ├── LOVABLE.md            # Lovable Desktop local MCP (users)
│   ├── FUTURE-HTTP.md        # Optional remote HTTP transport
│   └── DEVELOPER.md          # This file
├── examples/
│   ├── README.md             # Optional stdio JSON config notes
│   └── mcp-stdio.example.json
├── src/
│   ├── index.ts              # Entry: load config, build server, stdio or HTTP transport
│   ├── config.ts             # Runtime env parsing
│   ├── runtime.ts            # Per-request Tealfabric API key + scoped client
│   ├── http.ts               # Streamable HTTP MCP transport (optional; see FUTURE-HTTP.md)
│   ├── client.ts             # createTealfabricClient (Tealfabric REST)
│   └── tools/
│       ├── register.ts       # registerTealfabricTools(server, run)
│       ├── content.ts        # JSON/text MCP result helpers
│       ├── connectors.ts     # Connector MCP tools
│       ├── integrations.ts   # Integration MCP tools
│       ├── webapps.ts        # Webapp MCP tools
│       ├── processes.ts      # Process / ProcessFlow MCP tools
│       └── documents.ts      # Documents MCP tools
└── dist/                      # Built output (after npm run build)
```

- **`src/index.ts`** — Builds `McpServer`, defines the shared `run` wrapper, calls `registerTealfabricTools`, then connects stdio or starts HTTP.
- **`src/client.ts`** — `createTealfabricClient(options)` for Tealfabric REST calls (timeouts, retries, optional local upload).
- **`src/tools/*.ts`** — Zod schemas and `registerTool` calls grouped by domain; add new tools in the file that matches the API area.

---

## 10. Extending the server

To add a new tool:

1. **Add a method** on the object returned by `createTealfabricClient` in `src/client.ts` (reuse the existing request pattern).
2. **Register the tool** in the matching `src/tools/<domain>.ts` file via `server.registerTool(...)` and use the injected `run` helper so calls go through a scoped client.
3. **Rebuild:** `npm run build`.

For new Tealfabric endpoints or capabilities, use [https://tealfabric.io/docs](https://tealfabric.io/docs) and your environment’s API base (e.g. Swagger at `{TEALFABRIC_API_URL}/api-docs/` if available).

---

## 11. Troubleshooting

| Issue | What to check |
|-------|-------------------------------|
| No Tealfabric API key / auth errors | Set `TEALFABRIC_API_KEY`, or use `TEALFABRIC_AUTH_SOURCE` + request Bearer/`x-api-key` as documented in `README.md`. |
| 401 from Tealfabric | Key invalid or revoked. Create a new key in Tealfabric (User → API Keys). |
| Tools not visible in Lovable | Ensure `args` points to `dist/index.js`, env includes `TEALFABRIC_API_KEY`, and restart the app. Approve the local connector in Lovable Desktop if prompted. |
| "Cannot find module" at runtime | Run `npm run build` and point the MCP `args` entry to `dist/index.js`, not `src/index.ts`. |
| Wrong tenant or no data | API key is tied to a Tealfabric user/tenant; use a key for the correct account. |

---

## 12. References

- **Lovable Desktop (local MCP):** [docs/LOVABLE.md](LOVABLE.md), [Lovable desktop app](https://docs.lovable.dev/integrations/desktop-app)
- **Lovable MCP / connectors:** [Personal connectors](https://docs.lovable.dev/integrations/mcp-servers)
- **Optional HTTP transport:** [docs/FUTURE-HTTP.md](FUTURE-HTTP.md)
- **Tealfabric platform documentation:** [https://tealfabric.io/docs](https://tealfabric.io/docs) — quickstart, ProcessFlow, WebApps, integrations, connectors.
- **MCP (Model Context Protocol):** [https://modelcontextprotocol.io](https://modelcontextprotocol.io) — protocol and concepts.
