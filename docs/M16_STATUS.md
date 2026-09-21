# M16 — Open Source Product Release

**Milestone gate: in progress. Product UX and localization slice verified locally on 2026-09-21.** The approved product journey is implemented and running in the local demo. The full M16 release gate remains open until clean-machine installation, release and operations material, accessibility review, and a real three-to-four-hour game with one GM and two to five players are accepted.

## Delivered source

- The default route is now a product home with three explicit choices: run a prepared game, join with a code, or create a game from the asset library. Existing games appear as cards; Pack Creator, content library, Realm settings and the low-level World editor remain available under advanced tools.
- Campaign setup, invitation and lobby now show the preparation sequence, a copyable invite link, the connected-player count, the reason Start is unavailable, and a persistent Start Session action.
- The live GM surface opens on a task-oriented table with Table, Checks & Actions, Encounter, Party and Journal workspaces. Scene, pacing, notes and map controls are in the primary workspace; history, recap and canon remain available; rehearsal and spectator diagnostics are collapsed under developer tools.
- The player surface prioritizes a pending roll/action, keeps Character state and Pack-defined actions together, and provides phone navigation for Character, abilities, map, party and journal.
- Application chrome is available in English, Russian, Spanish, Japanese, Simplified Chinese and Korean. Locale selection persists in the browser and can be overridden with `?lang=`. Stable Pack identifiers and Pack-authored game content are preserved in their source language.
- The HTML shell includes a responsive viewport, and the accepted 375 px layout has no horizontal document overflow.

## Automated tests

- TypeScript workspace check: pass.
- Ordinary Vitest suite: **153 passed**, with **4 environment-gated tests skipped**.
- Localization tests: all six catalogs have key parity; language detection and parameter interpolation pass.
- GM workspace tests: Table is the default and the approved five-workspace order is stable.
- Web production build: pass, **47 modules transformed**.
- Existing M15 live-browser regression: pass after the navigation and localization changes.

## Runtime proof

The persistent local PostgreSQL demo at `http://localhost:8202/?realm=default&lang=ru` loads the new product home and its saved game. `scripts/m16-browser-acceptance.mjs` used a separate headless Chrome profile against that live server and verified:

1. Russian product home and the three primary choices;
2. no Descriptor or revision terminology on the primary home;
3. switching to Japanese and persisted document locale;
4. invite-link PIN resolution, including precedence over stale saved-session state;
5. direct restoration of an existing live GM Session;
6. the task-oriented workspace navigation and rendered exploration map;
7. collapsed M15/developer evidence on initial entry;
8. no page overflow at 375 × 844;
9. no browser exception or failed HTTP response.

The M15 browser gate was also repeated against the same live API and passed, retaining the previous privacy and gameplay regression coverage.

## Remaining limits

- The full M16 acceptance gate is open: a real three-to-four-hour game with one GM and two to five people has not been conducted.
- Clean-machine installation, backup/restore operator guidance, migration and diagnostic guidance, license inventory, distributable release archives and rollback evidence remain to be completed.
- The six locale packs cover the home, campaign setup, lobby, Character creation shell, GM table, player navigation and core player actions. The Quick Game Builder and detailed GM Checks, Encounter, Party and Journal forms still use English; Pack-authored names, field labels and narrative content intentionally retain the Pack language.
- A complete keyboard, screen-reader, contrast and human localization review remains open.
- Production identity, abuse controls and public hosting infrastructure remain outside this local product gate.
