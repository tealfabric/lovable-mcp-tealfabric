---
title: Release Readiness Agent
description: Verify build, docs, and plugin metadata before publishing.
---

# Release Readiness Agent

Before marketplace publication:

1. Run `npm run build`.
2. Run `npm run test` (or `npm run check`).
3. Run `npm run validate:marketplace`.
4. Confirm `CHANGELOG.md` has the target version section.
5. Confirm `docs/RELEASE_NOTES_X.Y.Z.md` exists for the release (and is linked from README / CHANGELOG).
6. Confirm `docs/MIGRATING.md` covers any breaking changes.
7. Confirm plugin version matches the release in:
   - `package.json`
   - `plugins/tealfabric-mcp/plugin-manifest/plugin.json`
   - `plugin-marketplace/marketplace.json`
8. Confirm skills/agents under `plugins/tealfabric-mcp/` have YAML frontmatter.
9. Confirm no secrets are committed.
