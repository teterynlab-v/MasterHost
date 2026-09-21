# M11 Base Asset Library v1 Status

**Accepted locally:** 2026-09-21
**Gate:** `./scripts/m11-gate.sh`

## Delivered source

- A strict, versioned asset manifest validates identity, type, tags, preview metadata, base-Pack compatibility, capabilities, explicit dependencies, license, attribution, source, declared content counts and immutable publication state.
- The registry rejects unsafe media paths, missing or corrupt bytes, checksum/size mismatches, undeclared dependencies, capability mismatches, duplicate identities and dependency cycles. Registry media become ordinary Descriptor asset patches, so composition and runtime remain Pack driven.
- The original CC-BY-4.0 **Voidwake Archipelago** collection contains nine composable assets: setting, world frame, 10 locations, 20 NPC/creature variants, 20 items/clues/rewards, a 15-definition rule module, 6 Character archetypes, 12 scenes/encounters and one visual kit.
- The visual kit contains eight original SVG assets covering backgrounds, maps, portraits and tokens. Every file has an exact SHA-256 digest and declared size.
- Creator APIs expose filtered catalogs, individual manifests and immutable media. A composed World resolves its exact revision's media through the World route, including after process restart.
- The Dynamic Game Builder searches and filters assets by type and tag, renders previews, provenance, license, dependency, count and checksum information, and expands required dependencies when the GM selects an asset.

## Automated tests

- TypeScript workspace check: pass.
- Vitest: 130 passed; the environment-gated M10 repository contract is skipped in the ordinary unit run.
- M11 registry tests: valid catalog/search/media resolution, five invalid-manifest paths, deterministic complete collection composition and 42 expected materialized scenario entities.
- Production Vite build: pass.

## Runtime proof

The gate starts PostgreSQL 17 in a clean disposable container and a server using the official Space Opera base Pack. Through authenticated creator APIs it:

1. installs the base Pack in an isolated Realm;
2. validates all nine asset manifests, their dependencies, open license metadata and content checksums;
3. reads and rehashes all eight media files through the HTTP media API;
4. selects all nine assets and previews a valid composed Descriptor;
5. compiles twice and compares deterministic materialization;
6. verifies 10 location, 20 actor and 12 scene entities in the World;
7. restarts the server and reads the saved Descriptor and World from PostgreSQL;
8. reads and rehashes all eight media files through the composed World's exact Pack revision.

Headless Chrome then uses the normal GM UI to search and filter the catalog, inspect open-license metadata and loaded previews, select the complete collection, preview a valid Descriptor, create the game, compile the World, reload it, and reopen the nine-selection game project. Browser exceptions, console errors and failed HTTP responses are gate failures.

The gate also verifies that the server, browser and PostgreSQL container are stopped and removed.

## Acceptance

The canonical M11 gate is passed locally. A GM can assemble a complete one-shot using only bundled assets; selected asset dependencies, licenses and checksums validate; the composed World is deterministic; and every referenced bundled media file resolves with its original checksum after restart.

## Remaining limits

- The collection is one coherent English-language setting. Human editorial, accessibility and localization review remain open.
- The UI exposes an asset menu and dependency expansion; the guided end-to-end beginner flow belongs to M12.
- Asset forking and visual full-custom editing belong to M13, and portable embedded `.mhgame` transfer belongs to M14.
- The acceptance proves engineering completeness for M11. It does not replace the real table rehearsal in M15 or the three-to-four-hour release game in M16.
