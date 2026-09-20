# MasterHost Project Status

**Verified:** 2026-09-21 on the local macOS development machine. Source came from `MasterHost-m2.1-actions-resources-effects.zip`; the supplied folder contained archives and no Git checkout.

## Checks and real flows

- `./scripts/m0-check.sh`: pnpm 10.17.1 install, PostgreSQL Compose startup, full TypeScript check, 41 unit/conformance tests — pass. Corepack is unavailable locally; the script uses the pinned pnpm through npm as a fallback.
- `pnpm --filter @masterhost/web build` through pinned pnpm — pass.
- `node scripts/m0-runtime-smoke.mjs` — pass against PostgreSQL for Classic Fantasy and Cyberpunk: create/reload, provenance, CUSTOM/LOCK, impact preview, regeneration, snapshot, fork and ZIP import round trip.
- Browser: both packs render through the same Quick Builder and generate their respective world concepts. Classic Fantasy was also checked in separate GM and player browsers through PIN, guest join, character creation, Ready, LIVE, check and server roll; the returning player selected the saved character, and a player refresh returned to LIVE. On 2026-09-21, the updated token-based flow was repeated in two browser tabs through PIN, character creation, Ready, LIVE, Check and Roll; player reconnect returned to LIVE, and a new GM lobby restored after reload.
- `node scripts/runtime-smoke.mjs` — pass against PostgreSQL for Fantasy: PIN required at join; GM and participant tokens enforced for commands, reads and WebSocket; cross-player access rejected; eight concurrent roll requests produce one resolution and one event pair; action events, target rejection, encounter turns, effect ticks/expiry and PIN invalidation after FINISHED.

## M0 — World Engine

**Status: verified development baseline; full product acceptance remains open.** Both packs compile, persist and pass the authoring smoke. The web UI can create, explain, lock, preview, snapshot/regenerate, export and import `.mhworld`. The import API validates archive paths, sizes, checksums, schema, identities and parent references, then assigns independent IDs. Archives with custom assets are rejected until an asset store can preserve them. Remaining M0 work includes a complete browser restore/fork/import experience, deeper migration/rollback testing, and full manual checklist on a clean database. The UI edit prompt could not be completed through browser automation; CUSTOM/LOCK was verified through the live API and persistence readback.

## M1 — Realm, Campaign, Session and Character

**Status: playable local baseline, not production access control.** Two browser contexts completed the Fantasy lobby and Character flows. Session PIN is five digits, Realm scoped, expires at session end, and cannot authorize protected GM routes. A campaign GM key is generated separately, stored as a hash, and required for session creation and GM commands. Character values and exact pack compatibility are checked server side. Each guest receives a random participant token at join; only its hash is stored. Participant commands and private Check reads require this token. Session WebSocket authentication uses the first message, and Check notifications reach only the assigned player and GM. The guest browser owner key remains a local bearer identity. World authoring, Realm authentication, rate limiting, richer roles and token recovery remain open before untrusted hosting. Existing participants created before the token migration need to rejoin. Single active Pack configuration remains a deployment constraint.

## M2 — Generic game runtime

**Status: M2.2–M2.5 baseline implemented and locally verified.** Declarative Action steps compose Check, Roll, Resource and Effect; target policies cover none, self, one actor and multiple actors. The HTTP layer delegates execution to `packages/game-runtime`. Action and encounter mutations persist events and state together in one PostgreSQL transaction. Standalone Check creation and resolution now persist their events in transactions; concurrent roll requests return the first saved result. Encounter ordering supports none, fixed, rolled, attribute and custom policies; Pack configuration selects the policy. Turns and rounds emit lifecycle events, and effects emit tick/expiry events. Fantasy and Cyberpunk contain declarative composed action examples.

Remaining runtime work: concurrent command/version control for actions and encounters; NPC creation and encounter UI; richer Pack capability validation; recovery from snapshots plus later events; replay and multi-node realtime. These gaps prevent a production or full gameplay acceptance claim.
