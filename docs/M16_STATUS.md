# M16 — Open Source Product Release

**Milestone gate: in progress. Product UX, localization and local release engineering slices verified on 2026-09-21.** The approved product journey is implemented and running in the local demo. A clean isolated Compose installation, backup/restore, diagnostics, release archive and automated accessibility baseline now pass. Full M16 acceptance remains open until a real three-to-four-hour game with one GM and two to five players, human accessibility/localization review and an explicitly authorized public release are accepted.

## Delivered source

- The default route is now a product home with three explicit choices: run a prepared game, join with a code, or create a game from the asset library. Existing games appear as cards; Pack Creator, content library, Realm settings and the low-level World editor remain available under advanced tools.
- Campaign setup, invitation and lobby now show the preparation sequence, a copyable invite link, the connected-player count, the reason Start is unavailable, and a persistent Start Session action.
- The live GM surface opens on a task-oriented table with Table, Checks & Actions, Encounter, Party and Journal workspaces. Scene, pacing, notes and map controls are in the primary workspace; history, recap and canon remain available; rehearsal and spectator diagnostics are collapsed under developer tools.
- The player surface prioritizes a pending roll/action, keeps Character state and Pack-defined actions together, and provides phone navigation for Character, abilities, map, party and journal.
- Application chrome is available in English, Russian, Spanish, Japanese, Simplified Chinese and Korean. Locale selection persists in the browser and can be overridden with `?lang=`. Stable Pack identifiers and Pack-authored game content are preserved in their source language.
- The HTML shell includes a responsive viewport, and the accepted 375 px layout has no horizontal document overflow.
- Product Compose starts PostgreSQL, the API and Nginx-hosted web client with health checks and one public origin. PostgreSQL and API ports remain private; WebSocket and API requests are proxied by Nginx. The stack requires explicit database and Realm-admin secrets.
- `backup.sh` writes a PostgreSQL custom-format dump through a partial file. `restore.sh` validates the archive, stops API writes, replaces the database, restores with `--exit-on-error`, restarts the API and waits for health. `diagnose.sh` checks containers, PostgreSQL, internal API, public proxy and browser without printing secrets.
- `build-release.mjs` produces a versioned source archive with `VERSION`, `SHA256SUMS`, a sidecar archive checksum and a generated dependency-license inventory. Backups, database dumps and logs are excluded even when present as untracked files. `verify-release.mjs` rejects unsafe/excluded paths, verifies exact archive-to-manifest coverage, every file checksum, required install/operator files and complete declared license records, then builds both Compose images from the extracted archive.
- The README plus install, game, operations and licensing guides describe first start, play flow, upgrades, migration policy, diagnosis, backup, destructive restore and rollback.

## Automated tests

- TypeScript workspace check: pass.
- Ordinary Vitest suite: **157 passed**, with **4 environment-gated tests skipped**.
- Localization tests: all six catalogs have key parity; language detection and parameter interpolation pass.
- GM workspace tests: Table is the default and the approved five-workspace order is stable.
- Web production build: pass, **47 modules transformed**.
- Existing M15 live-browser regression: pass after the navigation and localization changes.
- Release engineering tests cover archive exclusions, deterministic file checksums and deduplicated dependency-license collection.

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

`scripts/m16-release-gate.sh` then created a separate named Compose project and volume from the current source. It built both product images, reached healthy PostgreSQL/API/public browser endpoints and ran the complete M15 rehearsal plus M15 and M16 Chrome routes through Nginx. The rehearsal authenticated a real Session WebSocket on that same public origin. The gate backed up the resulting playable World and Session, created a second World, destructively restored the backup, proved that the original game remained while the post-backup World disappeared, then repeated the M15 restart readback. It removed its isolated containers and volume on exit.

The same gate passed the automated accessibility baseline for one main landmark, one page heading, accessible names/labels, image alternatives, keyboard traversal of all three primary choices, keyboard activation of Join, visible focus and no horizontal overflow at 375 × 844. It built and independently verified a release archive containing **376 checksummed files** and **197 dependency-license records**, including the installation environment template but no local `.env`, backup, database dump, log, Git data, dependencies or generated build directories. Both product images were then rebuilt from the extracted archive itself.

## Remaining limits

- The full M16 acceptance gate is open: a real three-to-four-hour game with one GM and two to five people has not been conducted.
- The Compose gate starts from clean containers and a clean database volume on the development host. Installation from the built archive on a physically separate machine has not yet been independently witnessed.
- The six locale packs cover the home, campaign setup, lobby, Character creation shell, GM table, player navigation and core player actions. The Quick Game Builder and detailed GM Checks, Encounter, Party and Journal forms still use English; Pack-authored names, field labels and narrative content intentionally retain the Pack language.
- Automated structural, keyboard-focus and responsive checks pass. A complete human keyboard, screen-reader, contrast and localization review remains open.
- The verified archive remains local; no public release has been published because publication requires explicit authorization.
- Production identity, abuse controls and public hosting infrastructure remain outside this local product gate.
