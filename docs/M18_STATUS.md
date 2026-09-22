# M18 Deep Classic Fantasy Status

**State:** complete; automated milestone gate and independent review corrections verified on 2026-09-22.
**Plan:** `docs/superpowers/plans/2026-09-22-m18-deep-classic-fantasy.md`

## Delivered source

- `masterhost.classic-fantasy@1.0.0` remains installed by exact identity alongside the official `2.0.0` Deep Universe Pack. Optional `universe.yaml` metadata travels through the filesystem loader and portable Pack document without adding setting logic to the runtime.
- Three patterns are present: Border Kingdoms, War of Heirs, and Ruins of the Ancient Empire.
- Three compatible Campaign Kits contain exact openings, scenes, cast, locations, rewards, ready Characters, duration, player range, and GM guidance.
- The profile contains 151 distinct content entries: 8 factions, 12 locations, 24 NPCs, 18 adversaries, 24 items, 30 events, 18 scenes, 8 archetypes, 6 progression paths, and 3 visual themes.
- Every entry has pattern ownership, varied type-specific final copy, a distributed valid cross-entry relationship, and a media role/reference. Stable catalogs contain all 151 display-name keys in English, Russian, Spanish, Japanese, Simplified Chinese and Korean with no blanks or locale-prefix placeholders. These translations are machine-authored; native-speaker editorial review remains required before a polished public release.
- Six original Pack SVGs cover map, background, portrait, token, item, and location presentation.
- Nine published Classic Fantasy assets cover every Quick Builder category with explicit capabilities, dependencies, truthful content counts, license evidence, and six portable media files. Their fragments materialize pattern-specific factions, locations, cast, items, scenes, progression options, rules, Campaign Kit and visual theme through the generic compiler; the same fragments also compose through Advanced mode.
- Play Today activates the exact installed official Pack before entering Quick Builder, keeps the M17 handoff visible, and persists the selected pattern, Campaign Kit and visual theme as Descriptor decisions that survive `.mhgame` transfer.

## Automated proof

`./scripts/m18-gate.sh` passed:

- TypeScript workspace check.
- Vitest: **185 passed**, **4 environment-gated tests skipped**.
- Vite production build: **49 modules transformed**.
- Production server image build and startup.
- SDK contract: parallel exact 1.0.0/2.0.0 filesystem versions, portable document conversion, passing Deep Universe assessment, and ready catalog resolution.
- Asset contract: nine Quick categories, dependency ordering, truthful aggregate counts, valid Advanced composition, and three different materialized pattern graphs with their exact Descriptor decisions. Generic preview/compiler validation rejects pattern, Campaign Kit and visual theme mismatches.

## Runtime and browser proof

The gate used two empty PostgreSQL 17 installations.

Installation A proved:

1. Classic Fantasy alone was ready in the twelve-universe catalog.
2. The server first activated and served exact `masterhost.classic-fantasy@1.0.0`, then Play Today activated exact `2.0.0`; the primary catalog continued to expose one latest card.
3. Headless Chrome completed catalog preview, all twelve Quick Builder stages, final review, and World creation.
4. API acceptance repeated the nine-asset review, composed through the generic Descriptor path, persisted exact pattern/Kit/theme decisions, materialized the selected Campaign Kit with six scenes and substantial cast/items, and exported a self-contained `.mhgame`.

Installation B proved:

1. `.mhgame` import retained the canonical Descriptor, materialized entities, runtime Pack, nine asset records, media, attribution, and evidence without the source installation.
2. A fresh Character, Campaign, Session, participant and NPC completed exploration, social play, a player Action, server Check and roll, Encounter, item reward, progression, realtime reconnect, private GM notes, spectator redaction, and Session completion.
3. Headless Chrome exercised the GM map/notebook and player Character/Action/map surfaces.
4. A real server restart retained the imported game, active runtime Pack, finished Session, table, exploration board, events, redaction, and accepted rehearsal report.

The gate removed both databases, server/web processes, image, archive, state files, and Chrome profiles.

## Remaining evidence

- Automated checks prove structural completeness and executable paths. Human editorial review, native-language translation review, accessibility review, illustration review, and an actual friends-at-table game are not claimed.
- Only Classic Fantasy is ready in a clean installation. M19 delivers Deep Space Opera; M20–M29 follow the approved order.

## Post-review table correction

After milestone acceptance, live use exposed a product-level gap between runtime completeness and a usable GM surface. The follow-up correction keeps the generic table APIs and replaces the initial setup/lobby-first presentation with the approved map-first cockpit. It also fixes per-game Pack resolution, direct GM entry, participant removal and reconnect behavior. TypeScript, 190 ordinary tests and the production build pass; a PostgreSQL-backed two-window browser flow verified GM/player recovery, scene persistence, visual dice and the real Check workspace. This correction does not upgrade the schematic bundled SVG artwork or satisfy the deferred human playtest.
