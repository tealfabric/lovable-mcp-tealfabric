# Examples

## `mcp-stdio.example.json`

Reference **stdio MCP** configuration for clients that support a JSON manifest (command, args, env). **Lovable Desktop** is usually configured via **Settings → Connectors → Local MCP servers** in the UI; see **[docs/LOVABLE.md](../docs/LOVABLE.md)** first.

Copy this file to a **local path outside the repo** (for example `mcp.local.json` next to your home config) and adjust paths and secrets. Do not commit files containing real API keys. [`.gitignore`](../.gitignore) ignores `mcp.local.json`.
