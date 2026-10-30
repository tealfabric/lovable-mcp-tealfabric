# Changelog

All notable changes to the Tealfabric MCP Server are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - Released

Full narrative: [docs/RELEASE_NOTES_0.2.0.md](docs/RELEASE_NOTES_0.2.0.md). Migration checklist: [docs/MIGRATING.md](docs/MIGRATING.md).

Parity release with Cursor/Claude MCP 0.2.0 — aligned with backend-next REST contracts.

### Breaking

- **Publish webapp** — `tealfabric_publish_webapp` now requires `version`.
- **Create webapp** — `tealfabric_create_webapp` requires `type`, `page_content`, and `webapp_user_id` (in addition to `name`).
- **List webapps** — replaced ignored `limit` with `page` / `items_per_page`.
- **Test connector** — replaced opaque `payload` with `connector_id` + optional `configuration`.
- **Process create/update** — removed non-persisted fields (`version`, `tags`, `estimated_duration`, `template_id`).
- **Document download** — uses `GET /api/v1/documents/download` (retired `?action=download`).

### Added

- Webapp companions: unpublish, create version, delete.
- Integration companions: execute, delete.
- Process companions: delete, retire, delete step.
- Document companions: tree, read-text, write-text.
- Integration/process write fields: `configuration` / `connector_configuration`, `executable_by_ai_agents`, step `language` / `execution_timeout`.
- Docs: release notes, migration guide, webapp/process/document skills.

### Fixed

- Client paths and schemas aligned with current backend-next REST controllers.

## [Unreleased]

### Added

- **Lovable Desktop documentation** — Added [docs/LOVABLE.md](docs/LOVABLE.md) for local MCP install; [docs/FUTURE-HTTP.md](docs/FUTURE-HTTP.md) for optional HTTP transport.
- **CI workflow** — GitHub Actions runs `npm ci` and `npm run check` on push/PR.
- **Example stdio MCP JSON** — Added [examples/mcp-stdio.example.json](examples/mcp-stdio.example.json); [`.gitignore`](.gitignore) ignores `mcp.local.json` and `node_modules/`.
- **Lovable-ready transport mode** — Added Streamable HTTP runtime (`MCP_TRANSPORT=http`) for future remote MCP hosting.
- **Request-scoped auth support** — Added `TEALFABRIC_AUTH_SOURCE` (`auto`/`env`/`request`) to support per-request credentials from MCP clients.
- **Runtime validation/config** — Added centralized runtime config parsing with explicit defaults.
- **Basic automated tests** — Added Node test suite for config/auth resolution behavior.

### Changed

- **Documentation focus** — README and developer docs center on **Lovable Desktop** local MCP; optional HTTP documented separately.
- **Cursor-free docs and paths** — Removed Cursor-specific setup and links; added [examples/mcp-stdio.example.json](examples/mcp-stdio.example.json). Renamed `plugins/tealfabric-mcp/.cursor-plugin/` to `plugin-manifest/`; marketplace validator expects `plugin-marketplace/marketplace.json` at repo root (see [scripts/validate-template.mjs](scripts/validate-template.mjs)).
- **Resilient API client** — Added timeout + retry behavior for transient Tealfabric API failures.
- **Upload hardening** — Local file upload is now disabled by default and gated by `TEALFABRIC_ALLOW_LOCAL_FILE_UPLOAD=true`.
- **Version consistency** — Server version now reads from runtime config (`MCP_SERVER_VERSION` / package version fallback).
- **Tool module layout** — MCP tools are split into `src/tools/` by domain (`connectors`, `integrations`, `webapps`, `processes`, `documents`) with shared `registerTealfabricTools` and response helpers.

## [0.1.4] - Released

### Fixed

- **Process execution payload mapping** — Updated `POST /api/v1/processflow?action=execute-process` request body to send `input_data` (instead of `input`) so MCP input reaches Tealfabric ProcessFlow correctly.

## [0.1.3] - Released

### Fixed

- **API endpoint prefixing** — Updated connector and integration API calls to use `/api/v1/...` routes to avoid frontend-auth redirects and ensure MCP calls hit API endpoints.

## [0.1.2] - Released

### Added

- **Marketplace packaging** — Added plugin manifests, scaffolding, and plugin-level MCP config
- **Skills** — Added low-token MCP usage skills for efficient integration create/update and schema-safe tool calling
- **Validation and CI** — Added marketplace validation script and GitHub Actions workflow for build/validation checks
- **Plugin docs** — Added plugin README with setup and quick verification steps

## [0.1.1] - Released

### Added

- **Connectors** — Added MCP tools to list connectors, test connector configuration, and check OAuth2 requirements
- **Integrations** — Added MCP tools to list integrations with filters/actions and to create/update integrations
- **API coverage** — Extended client and MCP tool registration to support Tealfabric `/connectors` and `/integrations` endpoints
- **Documentation** — Updated `README.md` and developer docs with new connectors/integrations tools and API mapping

## [0.1.0] - Released

### Added

- **Webapps** — List, get, create, update, and publish Tealfabric webapps
- **Processes** — List processes, get process, list process steps, get process step, execute process
- **Documents** — List, get metadata, upload, move, and delete documents (package files for delivery)
- MCP server with stdio transport for local MCP clients
- API key authentication via `X-API-Key` header
- Configurable base URL via `TEALFABRIC_API_URL` environment variable
