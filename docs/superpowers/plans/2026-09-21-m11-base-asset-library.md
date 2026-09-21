# M11 Base Asset Library v1 Implementation Plan

**Goal:** Deliver a validated, searchable and licensed asset library with enough bundled content and media to assemble one complete one-shot through the dynamic Descriptor.

**Architecture:** `@masterhost/descriptor` owns the pure asset contract and filesystem registry. Assets expose ordinary M10 fragments, so composition and the generic compiler remain authoritative. Fastify serves catalog metadata and immutable media. The existing Game Builder presents asset filters and previews. PostgreSQL stores only selected asset fragment identities in the existing game Descriptor project.

**Spec:** `docs/superpowers/specs/2026-09-21-m11-base-asset-library-design.md`

## Task 1 — Asset schema and registry

- Add strict asset, media, license, compatibility, dependency and lineage contracts.
- Validate checksums, safe paths, unique IDs, semantic versions, dependency closure/cycles and fragment identity.
- Provide deterministic search/filter catalog and media lookup.
- Add tests first for valid loading and all rejection paths.

## Task 2 — Bundled Voidwake one-shot collection

- Add eight reusable assets: setting, world, locations, cast, treasures, adventure, archetypes/rules and visuals.
- Meet or exceed 10 locations, 20 NPC/creature variants, 20 items/clues/rewards and 12 scenes/encounters.
- Add original SVG maps, portraits, tokens and backgrounds with CC-BY-4.0 provenance and exact checksums.
- Prove the complete selection composes and compiles deterministically through the existing compiler.

## Task 3 — API, media resolution and browser library

- Load asset fragments alongside M10 fragments.
- Add Realm-authorized search, filter, detail and immutable media routes.
- Resolve composed World Pack media by World, name and checksum after restart.
- Extend the Game Builder with type/tag filters, compatibility, content counts, dependencies, licensing and media previews.

## Task 4 — Clean acceptance and milestone evidence

- Add API/restart and headless Chrome acceptance scripts plus one reproducible `scripts/m11-gate.sh`.
- Run TypeScript, all tests, production build, clean PostgreSQL, real server restart and browser acceptance.
- Request independent review, fix all Critical/Important findings, rerun the gate, update `M11_STATUS.md` and `PROJECT_STATUS.md`, and commit the complete milestone.
