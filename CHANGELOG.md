# Changelog

All notable changes to the Tealfabric MCP Server are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Lovable Desktop documentation** — Added [docs/LOVABLE.md](docs/LOVABLE.md) for local MCP install; [docs/FUTURE-HTTP.md](docs/FUTURE-HTTP.md) for optional HTTP transport.
- **CI workflow** — GitHub Actions runs `npm ci` and `npm run check` on push/PR.
- **Cursor config example** — Added [.cursor/mcp.json.example](.cursor/mcp.json.example) for optional Cursor users; [`.gitignore`](.gitignore) ignores `.cursor/mcp.json` and `node_modules/`.
- **Lovable-ready transport mode** — Added Streamable HTTP runtime (`MCP_TRANSPORT=http`) for future remote MCP hosting.
- **Request-scoped auth support** — Added `TEALFABRIC_AUTH_SOURCE` (`auto`/`env`/`request`) to support per-request credentials from MCP clients.
- **Runtime validation/config** — Added centralized runtime config parsing with explicit defaults.
- **Basic automated tests** — Added Node test suite for config/auth resolution behavior.

### Changed

- **Documentation focus** — README and developer docs center on **Lovable Desktop** local MCP; Cursor and HTTP are secondary/future.
- **Resilient API client** — Added timeout + retry behavior for transient Tealfabric API failures.
- **Upload hardening** — Local file upload is now disabled by default and gated by `TEALFABRIC_ALLOW_LOCAL_FILE_UPLOAD=true`.
- **Version consistency** — Server version now reads from runtime config (`MCP_SERVER_VERSION` / package version fallback).
- **Tool module layout** — MCP tools are split into `src/tools/` by domain (`connectors`, `integrations`, `webapps`, `processes`, `documents`) with shared `registerTealfabricTools` and response helpers.

## [0.1.3] - Released

### Fixed

- **API endpoint prefixing** — Updated connector and integration API calls to use `/api/v1/...` routes to avoid frontend-auth redirects and ensure MCP calls hit API endpoints.

## [0.1.2] - Released

### Added

- **Marketplace packaging** — Added Cursor marketplace manifests, plugin scaffolding, and plugin-level MCP config
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
- MCP server with stdio transport for Cursor IDE
- API key authentication via `X-API-Key` header
- Configurable base URL via `TEALFABRIC_API_URL` environment variable
