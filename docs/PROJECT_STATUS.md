# MasterHost Project Status

**Verified:** 2026-09-20 on the local macOS development machine. Source came from `MasterHost-m2.1-actions-resources-effects.zip`; the supplied folder contained archives and no Git checkout.

## Checks and real flows

- `./scripts/m0-check.sh`: pnpm 10.17.1 install, PostgreSQL Compose startup, full TypeScript check, 39 unit/conformance tests — pass. Corepack is unavailable locally; the script uses the pinned pnpm through npm as a fallback.
- `pnpm --filter @masterhost/web build` through pinned pnpm — pass.
- `node scripts/m0-runtime-smoke.mjs` — pass against PostgreSQL for Classic Fantasy and Cyberpunk: create/reload, provenance, CUSTOM/LOCK, impact preview, regeneration, snapshot, fork and ZIP import round trip.
- Browser: both packs render through the same Quick Builder and generate their respective world concepts. Classic Fantasy was also checked in separate GM and player browsers through PIN, guest join, character creation, Ready, LIVE, check and server roll; the returning player selected the saved character, and a player refresh returned to LIVE.
- `node scripts/runtime-smoke.mjs` — pass against PostgreSQL for Fantasy: GM authorization rejection without the campaign key, character validation/ownership, action events, target rejection, encounter turns, effect ticks/expiry, and PIN invalidation after FINISHED.

## M0 — World Engine

**Status: verified development baseline; full product acceptance remains open.** Both packs compile, persist and pass the authoring smoke. The web UI can create, explain, lock, preview, snapshot/regenerate, export and import `.mhworld`. The import API validates archive paths, sizes, checksums, schema, identities and parent references, then assigns independent IDs. Archives with custom assets are rejected until an asset store can preserve them. Remaining M0 work includes a complete browser restore/fork/import experience, deeper migration/rollback testing, and full manual checklist on a clean database. The UI edit prompt could not be completed through browser automation; CUSTOM/LOCK was verified through the live API and persistence readback.

## M1 — Realm, Campaign, Session and Character

**Status: playable local baseline, not production access control.** Two browser contexts completed the Fantasy lobby and Character flows. Session PIN is five digits, Realm scoped, expires at session end, and cannot authorize protected GM routes. A campaign GM key is generated separately, stored as a hash, and required for session creation and GM commands. Character values and exact pack compatibility are checked server side. The guest browser owner key is still a local bearer identity; participant commands, event reads, and world authoring need proper Realm authentication and rate limiting before untrusted hosting. Single active Pack configuration remains a deployment constraint.

## M2 — Generic game runtime

**Status: M2.2–M2.5 baseline implemented and locally verified.** Declarative Action steps compose Check, Roll, Resource and Effect; target policies cover none, self, one actor and multiple actors. The HTTP layer delegates execution to `packages/game-runtime`. New action and encounter mutations persist events and state together in one PostgreSQL transaction. Encounter ordering supports none, fixed, rolled, attribute and custom policies; Pack configuration selects the policy. Turns and rounds emit lifecycle events, and effects emit tick/expiry events. Fantasy and Cyberpunk contain declarative composed action examples.

Remaining runtime work: authenticated participant commands and private reads; concurrent command/version control; atomicity for the older standalone Check flow; NPC creation and encounter UI; richer Pack capability validation; recovery from snapshots plus later events; replay and multi-node realtime. These gaps prevent a production or full gameplay acceptance claim.
