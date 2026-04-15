# Tealfabric MCP — Lovable Desktop (local install)

This guide is the **recommended setup** for using the Tealfabric MCP server with **[Lovable Desktop](https://docs.lovable.dev/integrations/desktop-app)**. The server runs **on your Mac** as a local Node.js process and talks to the Tealfabric API using your API key.

For Lovable’s general MCP and connector model, see [Personal connectors (MCP servers)](https://docs.lovable.dev/integrations/mcp-servers). **Local MCP servers** (command + args) are documented under the [Lovable desktop app](https://docs.lovable.dev/integrations/desktop-app) page.

---

## Requirements

- **macOS** (Lovable Desktop; Windows support for the desktop app is described in Lovable’s docs).
- **Node.js 18+** (`node -v`).
- **Lovable Desktop** installed and signed in.
- A **Tealfabric API key** (Tealfabric → User settings → API Keys, or your team’s documented process).

---

## 1. Install and build this repository

From the folder where you cloned this repo:

```bash
npm install
npm run build
```

Confirm the entrypoint exists:

```bash
test -f dist/index.js && echo "dist/index.js OK"
```

The server uses **stdio** by default (`MCP_TRANSPORT` unset or `stdio`). You do **not** need HTTP for Lovable Desktop local MCP.

---

## 2. Add the local MCP server in Lovable Desktop

1. Open **Lovable Desktop**.
2. Go to **Settings** → **Connectors** → **Local MCP servers** (wording may match [Lovable’s desktop docs](https://docs.lovable.dev/integrations/desktop-app)).
3. Click **Add server** (or equivalent).
4. Fill in the connection using a **command** and **arguments** (no public URL required).

Suggested values:

| Field | Value |
|--------|--------|
| **Name** | `Tealfabric` (or any label you prefer) |
| **Command** | `node` |
| **Arguments** | Absolute path to `dist/index.js` in this repo |

**Example arguments** (replace with your real path):

```text
/Users/you/src/lovable-mcp-tealfabric/dist/index.js
```

5. **Environment variables** — Set these in the same Add-server UI if your client supports per-server env, or use your OS/shell to export them before launch if the UI only accepts command/args (see troubleshooting).

Required for typical local use:

| Variable | Example | Description |
|----------|---------|-------------|
| `TEALFABRIC_API_KEY` | `tf_live_…` | Your Tealfabric API key |
| `TEALFABRIC_API_URL` | `https://tealfabric.io` | Tealfabric API base (omit if default) |

Optional:

| Variable | Default | Description |
|----------|---------|-------------|
| `TEALFABRIC_AUTH_SOURCE` | `auto` | Use `env` to force only `TEALFABRIC_API_KEY` from the environment. |
| `TEALFABRIC_ALLOW_LOCAL_FILE_UPLOAD` | `false` | Set to `true` only if you need `tealfabric_upload_document` to read files from disk. |

6. **Save** and **approve** the connection when Lovable prompts you (first-time local server access).

---

## 3. Smoke test

In a Lovable project chat, try a **read-only** tool first, for example:

```text
Use the Tealfabric connector to list my webapps.
```

Or explicitly:

```text
Call tealfabric_list_webapps with an empty object or reasonable limit.
```

If tools are missing, see [Troubleshooting](#troubleshooting).

---

## 4. Security notes

- **Do not** paste API keys into public repos or screenshots.
- Keep `TEALFABRIC_API_KEY` in Lovable’s local connector settings or your user environment, not in committed files.
- Local MCP runs on your machine; treat it like any local dev tool with network access to Tealfabric.

---

## 5. Troubleshooting

| Issue | What to try |
|--------|-------------|
| Server does not start | Run `npm run build` and ensure `dist/index.js` exists. Use the **absolute** path in `args`. |
| “TEALFABRIC_API_KEY” / auth errors | Set `TEALFABRIC_API_KEY` in the MCP server env in Lovable, or export it in the shell that launches Lovable if env is inherited. |
| No tools in the agent | Restart Lovable Desktop after changing the server. Confirm the local server was **approved** in Settings → Connectors. |
| Upload tool fails | Enable `TEALFABRIC_ALLOW_LOCAL_FILE_UPLOAD=true` only if you need local file uploads; see [README environment table](../README.md#environment-variables). |
| Wrong tenant / empty data | API keys are scoped to your Tealfabric user/tenant; use the correct key. |

---

## 6. Related docs

- **This repo:** [README.md](../README.md), [DEVELOPER.md](DEVELOPER.md)
- **Future remote HTTP transport (not required for Desktop):** [FUTURE-HTTP.md](FUTURE-HTTP.md)
- **Lovable:** [Desktop app & local MCP](https://docs.lovable.dev/integrations/desktop-app), [MCP / personal connectors](https://docs.lovable.dev/integrations/mcp-servers)
