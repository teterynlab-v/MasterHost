# Official universe content localization

**Engineering state (2026-09-28):** all twelve official universes have authored display dictionaries for Russian, Spanish, Japanese, Simplified Chinese and Korean. English remains the canonical source. The human language and full-game acceptance gates remain open.

## Source and behavior

`scripts/content-localization-inventory.mjs` inventories 7,427 unique source strings across the twelve current Packs, retained official manifests, universe profiles, Art Sets and compatible assets. Each target locale covers every inventoried string; the five dictionaries together contain 37,135 required translations. Shared UI terms and generated event captions live in `content-locales/_ui`. See `content-locales/README.md` for the authoring contract.

The browser projects the selected language onto the catalogue, previews, Quick and Advanced builders, official library, Character choices and sheet, Game Hub, World Builder, GM and player tables, scenes, Actors, map labels, Art Set metadata and generated recap captions. A generated game's Character schema carries its source universe identity, so its fields and options resolve against the correct official dictionary. The selected language follows the URL (`lang`) through realm, PIN and route changes. An authored Pack's own localization overrides bundled stock copy.

Projection changes display text only. Pack IDs, option values, formulas, event payloads, stored Worlds and licenses remain canonical. Player names, biographies, GM notes, explicit NPC renames and other custom text are kept verbatim. Server provenance marks generated and custom values so late-join views do not silently translate a player's text. Pre-existing Worlds are not migrated.

## Verification

- Coverage test checks every inventoried source string in all five target locales. Full TypeScript check and production Vite build pass.
- Fresh PostgreSQL 17 test database: **79 test files, 293 tests passed, zero skips**. Clean API and live Session probes verify source provenance, same-name custom NPC edits, immutable World data, generated map/scene labels and filtered recap captions. Sanitized outputs: `docs/evidence/localization/clean-api-metadata.json`, `clean-session-metadata.json`.
- Browser on the built local images: all 12 catalogue cards render localized headings in six languages; Russian Space Opera preview, selected assets, Quick Builder choices, created Game Hub, GM scenes, Character Builder and live player sheet were observed. The transient failure found during this browser pass was a generated game's Character schema losing its source universe scope; a regression test and live browser readback cover the repair. Evidence: `docs/evidence/localization/catalog-six-locales.json` and screenshots in that directory.
- The retained local demo on API `8245` and web `8246` was updated to the localization images. A pre-update database dump was saved outside the repository, and all **30 existing Worlds** matched exactly by ID, revision and data hash after the update. This is local demo evidence, not deployment or a human playtest.
- A checksum-verified release archive and 197-entry license inventory were built and checked. Its Docker Compose build gate is recorded in `docs/evidence/localization/release-verification.json`.

## Limits

Dictionary completeness is mechanical coverage, not native editorial certification. Names, register, accessibility and meaning across full adventures still need native speakers and actual GMs/players. The Realm administration console and technical/debug routes are outside this universe-content pass. User-authored English remains English until its author provides translations. The eagerly bundled locale corpus increases the Vite JavaScript bundle to roughly 4.7 MB before gzip; code splitting is a later performance task. M30's human games and editorial gate remain open.
