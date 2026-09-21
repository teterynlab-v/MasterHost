# M17 Deep Universe Foundation Status

**State:** automated acceptance complete on 2026-09-22.  
**Plan:** `docs/superpowers/plans/2026-09-22-m17-deep-universe-foundation.md`  
**Product design:** `docs/superpowers/specs/2026-09-22-deep-universe-collection-design.md`

## Delivered source

- `WorldPackDocument` accepts an optional, strictly versioned Deep Universe profile while legacy Packs remain valid without it.
- Deep Universe Standard v1 defines the approved minimums for patterns, Campaign Kits, factions, locations, NPCs, adversaries, items, events, scenes, archetypes, progression paths, and visual themes.
- The quality assessor reports stable severity, code, path, and message fields for minimums, final copy, references, connectivity, runtime rules, Character creation/progression, media, licensing, Play Today, and locale coverage.
- Campaign Kits declare exact patterns, capabilities, opening scene, scenes, cast, locations, rewards, ready Characters, duration, player range, and GM guidance.
- The declarative catalog contains all twelve approved universes and their three patterns, loops, tones, genres, complexity, player range, and exact target Pack versions.
- Catalog readiness is computed from an exact published Realm Pack plus a passing assessment. Static catalog data cannot make a universe playable.
- The product Create Game path now opens a responsive universe catalog with generic search/genre/tone/complexity filters and a non-mutating detail preview.
- Play Today transfers exact universe, Pack, pattern, Campaign Kit, and visual-theme identities once into the existing editable Quick Builder flow.
- Pack Creator includes a completeness dashboard with count progress, blocking diagnostic links, relationship summary, locale coverage, content filters, and Campaign Kit preview. Draft save remains available while validation blocks preview/publication.
- Universe catalog chrome is available in English, Russian, Spanish, Japanese, Simplified Chinese, and Korean.

## Automated proof

The final M17 gate is `./scripts/m17-gate.sh`. It ran:

- TypeScript workspace check: pass.
- Vitest: **172 passed**, **4 environment-gated tests skipped**.
- Web production build: pass, **49 modules transformed**.
- Deep-standard contract tests: complete profile pass plus minimum, dangling reference, unfinished copy, disconnected core, missing runtime rule, missing locale, and legacy Pack cases.
- Catalog contract tests: twelve unique entries, approved patterns/loops, duplicate rejection, exact-version and quality-gated readiness.
- Fastify injection: Realm isolation, list/detail/404, saved and unsaved draft assessment, and exact published Pack readiness.
- React static rendering: twelve cards, generic filters, preview detail, planned disablement, one-use exact handoff, count/diagnostic/graph/locale views, and Campaign Kit detail.

## Runtime proof

`./scripts/m17-gate.sh` created an isolated PostgreSQL 17 container and an empty `masterhost_m17` database, then started the real API and web application on temporary local ports.

The API flow proved:

1. all twelve entries began as `planned`;
2. an unknown universe returned 404;
3. a legacy starter Pack validated before deep metadata was added;
4. six checksum-validated image assets were uploaded;
5. an incomplete deep profile returned `deep-universe.minimum` and publication returned 409;
6. the repaired profile passed conformance and published as exact `masterhost.classic-fantasy@2.0.0`;
7. only then did Classic Fantasy become `ready` with exact Play Today identities;
8. the server restarted and retained the published Pack and ready catalog state.

Headless Chrome then proved through the real UI:

1. twelve universe cards rendered;
2. eleven planned cards had disabled launch actions;
3. Classic Fantasy preview displayed its loop, player range, and Border Kingdoms pattern;
4. Play Today opened Quick Builder with the exact Pack, pattern, Campaign Kit, and visual-theme IDs visible;
5. preview and handoff did not create a World;
6. the published Pack opened in Pack Creator and displayed a ready Deep Universe dashboard and Campaign Kit preview;
7. no browser exception or failed HTTP response occurred.

The gate removed its server, web process, PostgreSQL container, database data, Chrome profile, and temporary state files.

## Acceptance result

M17 is complete as the foundation milestone: schemas, Campaign Kit contract, automated quality gate, catalog, preview, Play Today handoff, and Pack Creator inspection are implemented and verified.

## Remaining limits

- The clean-gate Pack is generated acceptance data and is deleted with the temporary database. It is evidence for the framework, not the editorial delivery of Classic Fantasy.
- The repository’s twelve catalog entries remain `planned` in an ordinary clean installation until M18–M29 provide and publish their exact conforming Packs.
- M18 is the next milestone and must deliver the full Classic Fantasy content set, portable game, and playable browser flow.
- Pack Creator’s advanced technical labels remain English. Complete advanced-authoring localization is retained for the M30 collection gate.
- Automated checks establish structural completeness and executable contracts. Human editorial judgment, illustration quality, localization review, accessibility review, and real table play remain separate evidence.
