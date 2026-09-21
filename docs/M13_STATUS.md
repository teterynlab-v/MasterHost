# M13 Advanced and Full Custom Builder Status

**Status:** canonical local M13 gate passed on 2026-09-21.

## Delivered source

- The bundled Space Opera asset library now has 27 open-license assets: three independent choices in each of the nine Quick Game categories. Voidwake, Sunforge and Nightglass expose compatible capability contracts while retaining distinct content, names, media and visual identity.
- Protected Pack and materialized World images load through authenticated binary requests and object URLs. Browser image requests no longer bypass Realm authorization.
- A saved exact Descriptor revision can be forked into a Realm-owned draft Pack. The fork records Descriptor project/revision lineage, copies the complete composed document and preserves every referenced media byte. The source Descriptor and published assets remain immutable.
- Full Custom Builder controls cover identity, terminology, theme, Art Set mappings, questions, generators and weighted tables, templates, fixed/generated values, components, scenes, traits, relations, dependency nodes, constraints, Character steps/fields/options/conditions/calculations/starting state/portability, checks and dice, resources, effects, actions and steps, items, progression, actor templates, locations, encounter ordering, fixtures and image assets.
- Collection removal performs reference analysis before mutation and returns named inbound document paths when deletion would break the Pack.

## Tests

- `tests/m13-asset-breadth.test.ts` proves three choices per category and two distinct valid compositions.
- `tests/m13-pack-fork.test.ts` proves deep-copy identity, media and exact Descriptor lineage.
- `tests/m13-pack-editor.test.ts` proves named inbound references, blocked unsafe removal, immutable helper behavior and visual map parsing.
- `./scripts/m13-gate.sh` passed TypeScript, 139 ordinary tests with one environment-gated repository test skipped in the ordinary phase, the production Vite build and the live PostgreSQL repository contracts.
- `./scripts/m12-gate.sh` passed after the library expansion, including its complete 12-stage browser flow.

## Runtime proof

The M13 gate used a disposable PostgreSQL 17 database and actual server restarts. It proved:

1. all 27 assets are discoverable as three choices in every canonical category;
2. Sunforge and Nightglass selections produce different valid composed Packs and materialized Worlds;
3. a Descriptor fork retains exact lineage and every media byte without changing its source;
4. browser controls edit Pack media mappings, a referenced template value, a Character step, dice, an Action, a new generator, scene, relation and effect without JSON or YAML editing;
5. deleting a referenced template is rejected with its inbound component path;
6. the edited draft saves, validates, publishes immutably and compiles an original World;
7. every rendered Quick and Pack image completes with a non-zero natural size;
8. a scoped entity regeneration preserves a CUSTOM and LOCKED value;
9. the published Pack, lineage, media and World state read back after a real server restart;
10. gate cleanup leaves no server, web or PostgreSQL process behind.

## Remaining product limits

- A composed game is still spread across server-side Descriptor, Pack and World records. Self-contained `.mhgame` export/import belongs to M14.
- M13 proves authoring and compilation. Complete at-table UX and a human rehearsal belong to M15.
- Public installation, contributor workflow, license inventory and the real multi-player release game belong to M16.
