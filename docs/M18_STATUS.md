# M18 Deep Classic Fantasy Status

**State:** automated milestone gate passed on 2026-09-22; independent final review pending.  
**Plan:** `docs/superpowers/plans/2026-09-22-m18-deep-classic-fantasy.md`

## Delivered source

- `masterhost.classic-fantasy@2.0.0` is an installed official Deep Universe Pack. Optional `universe.yaml` metadata now travels through the filesystem loader and portable Pack document without adding setting logic to the runtime.
- Three patterns are present: Border Kingdoms, War of Heirs, and Ruins of the Ancient Empire.
- Three compatible Campaign Kits contain exact openings, scenes, cast, locations, rewards, ready Characters, duration, player range, and GM guidance.
- The profile contains 151 distinct content entries: 8 factions, 12 locations, 24 NPCs, 18 adversaries, 24 items, 30 events, 18 scenes, 8 archetypes, 6 progression paths, and 3 visual themes.
- Every entry has pattern ownership, a valid cross-entry relationship, final copy, a locale key, media role/reference, and text for English, Russian, Spanish, Japanese, Simplified Chinese, and Korean. Human translation review remains separate.
- Six original Pack SVGs cover map, background, portrait, token, item, and location presentation.
- Nine published Classic Fantasy assets cover every Quick Builder category with explicit capabilities, dependencies, content counts, license evidence, and six portable media files. The same fragments compose through Advanced mode.
- Play Today activates the exact installed official Pack before entering Quick Builder and keeps the M17 handoff visible.

## Automated proof

`./scripts/m18-gate.sh` passed:

- TypeScript workspace check.
- Vitest: **182 passed**, **4 environment-gated tests skipped**.
- Vite production build: **49 modules transformed**.
- Production server image build and startup.
- SDK contract: filesystem profile load, portable document conversion, passing Deep Universe assessment, and ready catalog resolution.
- Asset contract: nine Quick categories, dependency ordering, aggregate counts, and valid Advanced composition.

## Runtime and browser proof

The gate used two empty PostgreSQL 17 installations.

Installation A proved:

1. Classic Fantasy alone was ready in the twelve-universe catalog.
2. Play Today activated exact `masterhost.classic-fantasy@2.0.0`.
3. Headless Chrome completed catalog preview, all twelve Quick Builder stages, final review, and World creation.
4. API acceptance repeated the nine-asset review, composed through the generic Descriptor path, compiled a 20+ entity World, and exported a self-contained `.mhgame`.

Installation B proved:

1. `.mhgame` import retained the canonical Descriptor, materialized entities, runtime Pack, nine asset records, media, attribution, and evidence without the source installation.
2. A fresh Character, Campaign, Session, participant and NPC completed exploration, social play, a player Action, server Check and roll, Encounter, item reward, progression, realtime reconnect, private GM notes, spectator redaction, and Session completion.
3. Headless Chrome exercised the GM map/notebook and player Character/Action/map surfaces.
4. A real server restart retained the imported game, active runtime Pack, finished Session, table, exploration board, events, redaction, and accepted rehearsal report.

The gate removed both databases, server/web processes, image, archive, state files, and Chrome profiles.

## Remaining evidence

- Automated checks prove structural completeness and executable paths. Human editorial review, native-language translation review, accessibility review, illustration review, and an actual friends-at-table game are not claimed.
- Only Classic Fantasy is ready in a clean installation. M19 delivers Deep Space Opera; M20–M29 follow the approved order.
