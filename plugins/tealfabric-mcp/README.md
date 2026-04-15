# Tealfabric MCP — plugin bundle

This folder contains assets for **Cursor** marketplace-style distribution (`mcp.json`, skills, rules). The **primary** documented install path for this repository is **Lovable Desktop** local MCP — see the repo root **[README.md](../../README.md)** and **[docs/LOVABLE.md](../../docs/LOVABLE.md)**.

## What it provides

- Webapp operations (list/get/create/update/publish)
- Process and process-step operations (list/get/create/update/execute)
- Document operations (list/metadata/upload/move/delete)
- Connector operations (list/test/oauth2-required)
- Integration operations (list/create/update)

## Lovable Desktop (recommended)

1. Clone the repo, then `npm install` and `npm run build`.
2. In **Lovable Desktop** → **Settings** → **Connectors** → **Local MCP servers**, add a server:
   - **Command:** `node`
   - **Args:** absolute path to `dist/index.js` in the cloned repo
   - **Env:** `TEALFABRIC_API_KEY`, optional `TEALFABRIC_API_URL`
3. Approve the connection when prompted.

Details: **[docs/LOVABLE.md](../../docs/LOVABLE.md)**.

## Cursor (optional)

Use **`mcp.json`** in this folder as a template with `${workspaceFolder}` or an absolute path to `dist/index.js`, and set `TEALFABRIC_API_KEY` when prompted or via `env`.

## Required environment

- `TEALFABRIC_API_KEY`
- `TEALFABRIC_API_URL` (defaults to `https://tealfabric.io` if unset)

## Quick checks

- `npm run build`
- `npm run check` (build + tests)
- `npm run validate:marketplace` (only if maintaining Cursor marketplace metadata at repo root)

## Future: HTTP transport

Optional remote Streamable HTTP is documented in **[docs/FUTURE-HTTP.md](../../docs/FUTURE-HTTP.md)** — not required for Lovable Desktop or Cursor stdio.
