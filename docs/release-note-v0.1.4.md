## Tealfabric MCP for Lovable — **v0.1.4**

Hotfix release for ProcessFlow execution input handling.

### Fixed

- **Process execution payload mapping** — Updated `tealfabric_execute_process` request body for `POST /api/v1/processflow?action=execute-process` to send `input_data` (instead of `input`).
- **ProcessFlow input propagation** — Ensures MCP client input reaches Tealfabric processes correctly, preventing runs from receiving empty/default input.

### Impact

- No configuration changes required.
- Existing MCP clients can continue sending `input`; the server now maps it to the backend contract field `input_data`.

