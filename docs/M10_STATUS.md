# M10 Dynamic Game Descriptor Status

**Status:** canonical local M10 gate passed on 2026-09-21.

## Delivered source

- A pure Descriptor fragment composer applies validated `set`, `merge` and `append` patches to a complete base World Pack. It resolves typed parameters, required capabilities and conflicts, reports exact plus ancestor/descendant write overlaps, accepts only supported Pack roots and rejects unsafe JSON Pointer segments and nested payload keys before traversal.
- The built-in fragment registry validates bounded JSON documents and exposes preview metadata without patch bodies. M10 includes two small proof fragments: Observatory Location and Fortune Rules.
- PostgreSQL stores the current game Descriptor project and every immutable composed Pack revision. Optimistic revisions reject stale saves with `409`; a materialized World can still resolve the exact composed Pack version used to create it.
- Realm-scoped creator APIs list fragments and create, read, update, preview, compile and recompose projects. Prospective preview returns structured diagnostics without persisting invalid input. Compilation still follows World Pack → Descriptor → Compiler → materialized World, and recomposition preserves CUSTOM values and LOCK state by stable materialization path.
- Filesystem and official Packs are converted losslessly from their loaded runtime content and Art Sets, with checksummed asset metadata plus the active Realm terminology and theme. Database-published Packs retain their exact authoring document.
- The browser Game Builder exposes saved projects, explicit fragment selection, composition order, generated parameter controls, base Pack decisions and locks, grouped diagnostics, preview and World compilation. Composed Worlds remain reopenable after reload. It contains no natural-language composition path.

## Tests

- `tests/m10-descriptor-composition.test.ts`: **17 passing tests** for deterministic output, parameters, capabilities, conflicts, base-key collisions, exact and nested overlapping writes, hostile paths and hostile payload keys.
- `tests/m10-fragment-registry.test.ts`: **10 passing tests** for catalog loading, metadata, strict validation and lossless filesystem Pack adaptation.
- `tests/m10-game-descriptor-repository.test.ts`: **1 passing live PostgreSQL contract test** for Realm isolation, optimistic concurrency and immutable revision resolution.
- The environment-independent suite passed **122 tests across 28 files**; its PostgreSQL contract was skipped there and then passed against the gate database. The gate therefore exercised all **123 tests across 29 files**.
- TypeScript project check and production Vite build passed.

## Runtime proof

- `scripts/m10-gate.sh` reproducibly passed source checks, the test inventory, production build, clean PostgreSQL 17 startup, live API acceptance, an actual server restart, persistence readback, headless Chrome acceptance and process/container cleanup.
- Live acceptance created and published an exact base Pack, selected Observatory and Fortune fragments, rejected non-scalar API parameters, returned structured diagnostics for an invalid prospective preview, verified deterministic compilation and rejected a stale project write with `409`. A second Realm composed and compiled from the installed Space Opera Pack while retaining its full content, Art Sets, checksummed asset catalog and Realm presentation metadata.
- Updating Observatory danger produced immutable composed Pack versions `0.1.1` and `0.1.2`. Both resolved after restart, while recomposition retained the customized and locked Observatory name.
- Headless Chrome used creator authorization to create a game, select both fragments, preview an invalid danger value with its exact grouped diagnostic, set danger to `4`, preview a `VALID` Descriptor with both capabilities and Pack version `0.1.1`, compile and reload a World with its generation report, then restore the saved project and selections after reload. Runtime exceptions, console errors and failed HTTP responses were absent, and the Chrome process was confirmed exited.

## Limits

- The catalog has two proof fragments. M11 provides the broad reusable asset and content-block library needed for practical short game assembly.
- M12 provides curated quick-start menus and complete presets. M13 provides the advanced and full-custom editing surfaces.
- M14 provides the self-contained `.mhgame` export/import format; M10 projects remain server-persisted and are not yet portable as a single game file.
- M15 provides the complete table-running UX and M16 covers installation, contributor documentation, licensing validation and the real 3–4 hour one-shot acceptance with one GM and 2–5 players.
