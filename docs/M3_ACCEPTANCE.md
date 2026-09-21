# M3 Canonical Acceptance

Verified locally on 2026-09-21 for Classic Fantasy and Cyberpunk.

## Automated source and contract gate

- [x] Both Packs load through the same schema and runtime.
- [x] Pack-defined critical success/failure rules execute and invalid thresholds are rejected.
- [x] Effects modify Checks, expire, and can block Pack-declared Actions.
- [x] Item grants/transfers enforce positive quantities and stack limits.
- [x] Progression changes enforce Pack bounds.
- [x] Movement accepts only Pack-compatible materialized World Locations.
- [x] New state events replay to the same Actor state.
- [x] TypeScript passes.
- [x] 65 Vitest tests pass.
- [x] Web production build passes.

## Clean PostgreSQL restart gate

Run for each bundled Pack with `scripts/m3-acceptance.mjs`:

1. Create World, Campaign, Session, two participants and two valid Characters.
2. Start LIVE and initialize both Actors from persisted Character state.
3. Grant loot, transfer one Item, change progression and move an Actor.
4. Request a `result-only` Check and confirm the player cannot read the DC or dice.
5. Apply an Effect and confirm it blocks the Pack-declared Action.
6. Start an Encounter and create a verified runtime snapshot.
7. Stop the server process and start it again against the same database and Pack.
8. Confirm Actor state, redaction, required events and the live Encounter remain.
9. Confirm `/runtime/verify` reports a match.
10. End the Encounter and Session.

Result: pass for `masterhost.classic-fantasy-test` and `masterhost.cyberpunk-test`.

## Browser gate

- [x] Separate GM and player tabs completed PIN, Character, Ready and LIVE.
- [x] GM granted loot, awarded progression and moved the Actor; both views showed persisted state.
- [x] GM sent a result-only Check; player rolled and saw outcome/total without DC or dice.
- [x] GM and player saw the same active no-order Encounter.
- [x] Reloading both tabs restored the active Encounter and Actor state.
- [x] GM ended the Encounter and Session cleanly.

## Acceptance boundary

M3 is accepted locally for the bundled Packs. Multi-node realtime, arbitrary Pack certification, production identity/authorization and the M4 two-hour playtest are outside this gate.
