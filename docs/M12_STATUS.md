# M12 Quick Game Builder Status

**Accepted locally:** 2026-09-21

## Delivered source

- The primary **Build game** action now opens a 12-stage guided workflow: identity, setting, world template, locations, cast, items/clues/rewards, rules, Character Builder, adventure/scenes/encounters, visual style, Pack decisions and complete review.
- Each content stage shows only published assets compatible with the active base Pack. The GM explicitly chooses one exact `id@version` asset for every required category.
- The existing searchable asset and fragment builder remains available as **Advanced mode** and still produces the same game Descriptor.
- `reviewQuickGameSelection` is a pure registry-level contract that rejects missing categories, duplicate categories, unknown versions, incompatible Packs and missing exact dependencies. It emits deterministic dependency order, aggregate content counts and a complete license inventory.
- `POST /api/game-assets/quick-review` requires a Realm creator, binds review to the active exact Pack and accepts at most 64 validated exact identities.
- Every selected asset exposes its typed string, number and boolean parameters inside its guided stage. Defaults are initialized, required and bounded values gate navigation, edits invalidate prior review, and the selected values flow into the ordinary Descriptor.
- The final browser review shows all selected asset IDs and versions, exact dependencies, chosen parameters, content depth, Pack decisions and every license/source. Creation remains disabled until both readiness review and Descriptor preview pass.
- A successful final action creates the ordinary persisted M10 Descriptor project, compiles through the generic compiler and opens the existing materialized World UI.

## Automated tests

- TypeScript workspace check: pass.
- Ordinary Vitest suite: 134 passed; one PostgreSQL test is environment gated in the ordinary run.
- Live PostgreSQL Descriptor repository contract: pass.
- M12 selection tests cover complete readiness, deterministic reverse-input ordering, aggregates, license inventory, missing category, unknown version, incompatible Pack, duplicate category, missing dependency and parameterized content composition.
- Production Vite build: pass.

## Runtime proof

`./scripts/m12-gate.sh` starts PostgreSQL 17 from an empty disposable database and proves:

1. unauthenticated quick review is rejected;
2. a requested base Pack different from the Realm's active exact Pack is rejected;
3. incomplete selections return named category and dependency diagnostics;
4. the nine assets supplied in reverse order produce a deterministic dependency order and the expected content totals;
5. the reviewed selection previews and creates a valid Descriptor and materializes a World containing 10 Voidwake locations, 20 cast entities and 12 scenes;
6. the server restarts and reads back the review, Descriptor project and World from PostgreSQL.

Headless Chrome then enters an otherwise empty browser Realm and uses all 12 visible stages. It names the game, selects all nine categories, changes the exposed world-template premise and Pack-defined decisions, verifies exact identities and dependencies in the review, creates and compiles the World, and reloads the materialized World. The browser never opens JSON, YAML or a source editor. Browser exceptions, console errors and failed HTTP responses fail the gate.

The M10 dynamic Descriptor and M11 asset-library gates also pass after the new primary route and preserved Advanced mode.

## Acceptance

The canonical M12 gate is passed locally. A new GM can move from an empty Realm with an installed Pack to a reviewed playable one-shot through the supported browser UI without editing JSON, YAML or source code.

## Remaining limits

- Quick v1 requires exactly one published asset per canonical category. Combining or editing multiple assets in one category belongs to M13 Advanced and Full Custom Builder.
- An unsaved wizard resets on page refresh. Created projects and Worlds use the existing durable persistence path.
- M12 proves assembly and compilation, not a full table rehearsal. Portable `.mhgame` is M14, table experience acceptance is M15 and the real three-to-four-hour release game is M16.
