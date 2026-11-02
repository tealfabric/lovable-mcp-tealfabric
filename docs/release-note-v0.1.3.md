## Tealfabric MCP for Lovable — **v0.1.3**

First **Lovable Desktop**–oriented release of the Tealfabric MCP plugin: connect the app to [Tealfabric](https://tealfabric.io) for webapps, ProcessFlow, documents, connectors, and integrations from your local MCP server.

### Highlights

- **Local MCP (stdio)** — Recommended path: add the server in Lovable Desktop under **Settings → Connectors → Local MCP servers** (see [docs/LOVABLE.md](LOVABLE.md)).
- **Tealfabric tools** — Same MCP surface as the Cursor/Claude siblings: webapps, processes, documents, connectors, integrations (see README tool table).
- **Safer defaults** — Local file upload for `tealfabric_upload_document` is off unless `TEALFABRIC_ALLOW_LOCAL_FILE_UPLOAD=true`; optional request-scoped auth via `TEALFABRIC_AUTH_SOURCE`.

### Requirements

- Node.js **18+**
- A Tealfabric **API key** (`TEALFABRIC_API_KEY`)

### Install (from source)

```bash
npm install
npm run build
```

Point Lovable at `dist/index.js` and set env vars as in [docs/LOVABLE.md](LOVABLE.md).

### Also available

- [Cursor](https://github.com/tealfabric/cursor-mcp-tealfabric) · [Claude](https://github.com/tealfabric/claude-mcp-tealfabric)

---

**Full history:** [CHANGELOG.md](../CHANGELOG.md).
