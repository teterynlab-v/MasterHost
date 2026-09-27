# Illustrated universe demo content

## Delivered source and integration

The requested scope is **1,812 individual generated illustrations: 151 objects in each of all twelve existing universes**. Every selected source has a distinct checksum. Each collection covers 8 factions, 12 locations, 24 NPCs, 18 adversaries, 24 items, 30 events, 18 scenes, 8 archetypes, 6 progression paths and 3 visual themes.

- `manifest.json`: object identity, authored description, exact generation prompt, selected source, dimensions, checksum and conservative visual review status.
- `generated/<universe>/`: original PNG outputs from the built-in image generator, retained locally and ignored by Git/release packaging. No collage counts as an object illustration.
- `game-assets/library/media/<universe>/illustrated-<version>/`: portable WebP product assets, committed with their nine versioned asset definitions.
- `*-integration.json`: assembly evidence. Classic Fantasy uses 1.4.0, Dark Fantasy 1.2.0, the other ten universes 1.1.0. Existing published asset versions and immutable Worlds remain available.
- `generation-overrides.json` and `source-revisions.json`: exact revision prompts and checksum-bound selections, preserving original files. Urban Fantasy replaces its first 48 period-looking sources with modern siblings; Age of Sail corrects an unwanted synthetic signature.
- `visual-review.json`: limited thumbnail/individual inspections with exact source checksums. Generation, inspection and acceptance are distinct.

The World Pack → Descriptor → Compiler → materialized World architecture remains generic. Each complete collection supplies all three campaign Kits and eight illustrated portrait choices within the original character builder steps. Entity images resolve through Pack families/tags. GM scene previews remain hidden from players. The shared exploration map is interactive; routes painted into its illustration are decorative.

## Verification

`runtime-evidence.json` records live PostgreSQL and HTTP media checks for all twelve collections: 151 images each, linked NPCs, shared exploration maps, scene changes and player visibility. Browser evidence covers the twelve catalogue images, representative GM/player tables, portrait selection and reload/reconnect. The 375px catalogue header/first-card check is not a full mobile or accessibility acceptance.

**Final clean installation gate: passed (2026-09-28).** All 260 tests across 72 files passed with no skips, including real PostgreSQL cases; TypeScript and production build passed. The extracted release verified 3,278 files and 197 third-party license entries. `evidence/verification-summary.json`, `evidence/clean-portability.json` and `evidence/clean-runtime.json` retain the resulting proof. `scripts/illustrated-gate.sh` checks exact image coverage, TypeScript, the full suite, production build and extracted release, then compiles 36 Kit Worlds on an empty PostgreSQL installation, transfers twelve self-contained `.mhgame` archives to another empty installation, checks every image checksum, exercises live sessions and repeats readback after restart. Disposable databases share an isolated Docker network; temporary credentials never overwrite retained preview credentials.

Independent source review resolved a Play Today selection issue. The menu now checks exact dependencies, capabilities and the selected base Pack before selecting a complete illustrated bundle; five focused regression tests and an independent mismatched-dependency reproduction pass.

## Local demo

- Collection: http://127.0.0.1:8246/?realm=default&lang=ru#universes
- Generated-source review gallery: http://127.0.0.1:8247/
- New illustrated Urban Fantasy campaign: code **792245**, created through the three-step Quick Builder, six scene previews and an illustrated map verified in the retained GM table after reload.

The retained API/web images were updated while preserving PostgreSQL, existing worlds/sessions, environment, port bindings, network aliases and restart policy. Docker must be running. `scripts/resume-demo.sh` resumes the retained containers without recreating the database.

## Reproduction tools

- `artwork-inventory.mjs`: reconstruct selected-source coverage from PNG headers and checksums while preserving review records.
- `build-illustrated-assets.mjs <universe>`: refuse partial collections, encode WebP delivery copies with local `cwebp`, create new immutable asset versions.
- `select-illustrated-source-revisions.mjs <queue.json>`: validate and record sibling selections without deleting originals.
- `verify-illustrated-runtime.mjs [universe]`: authenticated local runtime/media checks; credentials stay in restricted temporary files.
- `illustrated-portability.mjs`: export/import/restart phases for all twelve games and 36 Kits.
- `watch-illustrated-assets.mjs` and `watch-illustrated-runtime.mjs`: resumable generation-era orchestration; both finished for this task.

## Remaining acceptance limits

All 1,812 sources have not received full-resolution human art review. Thumbnail checks found recurring facial similarities in some NPC collections, including the modern Urban replacements. Documents/books may contain decorative unreadable glyphs; authored readable text remains in the UI. Source descriptions and content still use declared English fallback where native editorial review is missing. Existing Worlds retain their previous immutable media versions; compose a new game to use the illustrated collection. M30 native editorial/accessibility review and a complete game with friends remain open. This artwork delivery does not claim product acceptance.

The full imported media check exposed repeated loading of every published Pack in the Realm for one image. `PackProjectRepository.findPublished` now uses the existing exact Realm/Pack/version/published index for exact runtime, Realm-context and Descriptor lookups. Two real PostgreSQL regression tests confirm payload preservation and reject other Realms, wrong versions and drafts; independent source review found no issue. Review also verified preservation of published-before-official precedence and authorization in the Realm and Descriptor call sites. Media checks use bounded four-request batches and retain every checksum/status/size assertion.
