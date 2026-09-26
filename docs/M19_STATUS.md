# M19 Deep Space Opera

**State:** complete engineering gate and independent review corrections verified on 2026-09-27.

## Source

- Immutable `masterhost.space-opera@1.0.0` retained alongside `2.0.0`.
- Three distinct patterns and three complete six-scene Campaign Kits: rescue and corridor ownership, contested medical quarantine and treaty disclosure, predictive gate and personal memory recovery.
- 151 authored entries satisfy Deep Universe Standard counts and valid references. Scenes supply objectives, alternatives and visible consequences. Nine published assets materialize selected pattern content through the generic fragment compiler in Quick and Advanced modes.
- Six original schematic SVGs and portable media. No setting branch added to runtime.
- Generic game hub and Session table now prioritize the selected Kit's opening scene; legacy location-only Worlds retain a fallback. GM entry prepares missing table/map state immediately. The complete scene drawer no longer loses a scene when the active scene changes.

## Automated evidence

`./scripts/m19-gate.sh` passed workspace TypeScript, production web and server builds, 197 tests (4 environment-gated skips), and two empty PostgreSQL 17 installations. Installation A verified exact legacy/deep activation, nine-asset review, Advanced composition and `.mhgame` export. Installation B imported the self-contained artifact with exact World/Pack/assets, completed Character → Campaign → Session actions/checks/encounter/reward/progression/reconnect rehearsal, checked private-data redaction, and retained finished Session/table/map/replay after restart.

Final web changes were also checked with installed pinned TypeScript/Vitest/Vite binaries. The local pnpm wrapper fails its ignored-esbuild dependency preflight; this is separate from the passing checks.

## Browser evidence

Against a separate PostgreSQL demo at API 8241/web 8242:

- Catalog shows Space Opera ready with three actual patterns; Play Today activates the exact Pack.
- Quick Builder selects all nine Space assets, reviews truthful counts, compiles the World and opens Game Hub with `Signal in the Wreckage` as the chosen Kit's opening.
- GM enters the live table with no players waiting, sees six scenes and Pack map, writes a private note, switches to `The Fuel Bargain`, and rolls the visual die.
- A separate player joins the already-live Session by PIN, creates Iona through the four-step Pack builder, receives resources and starting inventory, sees the shared scene/map, and uses `Recover Integrity`; persisted integrity changes 18 → 21. Reload restores the same Character and live connection. The GM-only note is absent from the player table.
- Desktop screenshots recorded at `/tmp/masterhost-m19-gm.png` and `/tmp/masterhost-m19-player.png`. A narrow viewport was inspected, but this is not a full accessibility acceptance.

## Independent review corrections

The final reviewer found false locale coverage and narrative-only Character options. Both were corrected and independently rechecked (13 focused tests passed). Eight Crew roles and six Progression paths are now selectable Pack fields with conditional starting traits and actual progression tracks. All 48 combinations validate; a clean PostgreSQL fixture advances the selected path to 1. Browser creation of Memory Archivist/Gate Custodian succeeds, and the player sheet displays Pack choice labels instead of raw IDs.

## Remaining limits

Only the source-English catalog contains names. Five non-source locales declare explicit fallback, expose 151 missing translations in coverage and produce nonblocking translation-pending diagnostics; they are **not counted as translations**. M30 owns editorial translation and collection-wide locale acceptance. Media are schematics rather than finished illustrations. Old base root content coexists with selected deep fragments; it is not removed from immutable Worlds. GM convenience dice are local visual rolls; authoritative Pack Checks are server-backed and verified separately by the runtime gate. Human editorial approval, accessibility review and a complete friends-at-table playtest remain open and are not claimed by this engineering gate.
