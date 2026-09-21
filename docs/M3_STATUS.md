# M3 Status — canonical game runtime complete locally (2026-09-21)

**Gate: passed for both bundled World Packs on a clean local PostgreSQL database.** A GM can request a Check, a player rolls through the server, both receive the result allowed by the Pack/GM visibility policy, and an active Encounter survives browser reconnect and an actual server process restart.

## Source delivered

### M3.0 — generic primitives

- `ActorRuntimeState` carries Pack-defined attributes, resources, effects, inventory, progression and location.
- Actions, Checks, Effects, Items, Encounters, Turns, Locations and Events have generic runtime representations. No runtime rule requires health, levels, classes, initiative or combat.
- Player Actors, Session NPCs and World-linked NPCs use the same runtime engine.

### M3.1 — dice and Checks

- Packs define bounded dice expressions, Character modifiers and raw-roll critical success/failure thresholds.
- GM requests persist `CheckRequested`; the server creates the roll and persists `DiceRolled` plus `CheckResolved`.
- `full`, `result-only`, `roll-only` and `hidden` policies redact the player HTTP and WebSocket representations while the GM event stream retains the authoritative record.
- Concurrent roll requests converge on the first persisted resolution.

### M3.2 — resources and Effects

- Pack resources have defaults and optional bounds. Actions add, subtract or set them.
- Effects can modify Check fields, block declared Actions, and expire by turn, round, Session or Pack-defined permanence.
- Pack loading rejects unknown numeric fields, resources, Actions, invalid duration definitions and unexecutable Action graphs.

### M3.3 — Encounters and Turns

- The Pack selects `none`, `fixed`, `rolled`, `attribute` or `custom` ordering. A no-order Pack does not emit turn events.
- Encounter start, roster changes, turn/round advance and end are event sourced and version checked.
- PostgreSQL permits one live Encounter per Session; reconnect and restart read the persisted live state.

### M3.4 — inventory, loot, progression and location

- Packs define Items and stack limits, progression tracks and bounds, and compatible materialized World kinds for Locations.
- Character/NPC starting state, GM loot grants, atomic Actor-to-Actor transfers, progression changes and movement are persisted with events and actor version checks.
- Pack validation rejects unknown, duplicate and over-limit starting Items, unknown or out-of-range progression, and incompatible Location kinds.

### M3.5 — event stream and recovery

- Inventory, progression and movement add `ItemGranted`, `ItemTransferred`, `ProgressionChanged` and `ActorMoved` to the existing Check, Action, Effect and Encounter stream.
- Runtime replay reconstructs the materialized Actor and Encounter state. Verified snapshots allow replay from a checkpoint.
- GM-only verification compares replay with one PostgreSQL snapshot. Existing offline repair remains limited to finished Sessions and records an audit entry.

## Test evidence

- TypeScript project check: pass.
- Vitest: 22 files, 65 tests passed.
- Web production build: pass.
- Fantasy runtime regression smoke: pass, including authorization, concurrent Check resolution, Actions, blocked Action, Encounter and Effect lifecycle.
- Cyberpunk runtime regression smoke: pass, including NPCs, multiple targets and no-turn Encounter behavior.

The final checks used the installed TypeScript, Vitest and Vite binaries directly. The local pnpm wrapper attempted an automatic install and rejected esbuild's ignored build script before any project command ran.

## Live runtime proof

- A clean temporary PostgreSQL database ran the generic two-phase M3 acceptance for Classic Fantasy and Cyberpunk.
- For each Pack, the create phase made two Character-backed Actors, granted and transferred Pack loot, changed Pack progression, moved an Actor to a compatible materialized World Location, resolved a redacted Check, proved an Effect blocked a Pack Action, started an Encounter and created a runtime snapshot.
- The server process was stopped and started again before each verify phase. Readback recovered inventory, progression, location, redacted Check data, event history and the live Encounter; `/runtime/verify` matched replay to materialized state.
- Browser proof used the Cyberpunk Pack in separate GM/player tabs. The player completed the Pack Character builder, joined the lobby and entered LIVE. The GM granted Ammo Pack, awarded Street Cred, moved the Actor to Nightshift Clinic and sent a result-only Check. The player saw the outcome and total without dice or DC. Both tabs were reloaded and still showed the active no-order Encounter and persisted Actor state; the Encounter and Session then ended cleanly.

## Limits beyond M3

- The evidence certifies the two bundled Packs, not arbitrary third-party Packs or custom Action executors.
- Realtime delivery is process-local; multi-node fan-out is still required for horizontally scaled hosting.
- Account-backed ownership, production authorization and hosted Realm administration remain later product work.
- The two-hour real playtest and full GM/player usability gate belong to M4.
