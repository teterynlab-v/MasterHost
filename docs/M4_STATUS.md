# M4 Status — accepted with deferred playtest gate (2026-09-21)

**Milestone status: accepted by explicit product-owner waiver.** M4.0 through M4.2 source and automated acceptance are implemented for both bundled Packs. On 2026-09-21 the product owner explicitly directed development to skip the real 120-minute playtest for now and continue. This records a waiver, not fabricated playtest evidence.

## Source

### M4.0 — GM console

- The live console covers party initialization, Pack NPCs and World links, actor state, loot, progression, single-actor movement, whole-party travel, Checks and visibility, Pack Actions, Encounters, turns, narrative events and the event log.
- Narrative notes persist as `NarrativeEventRecorded`. Whole-party travel persists one `ActorMoved` event per Actor in the same version-checked transaction.
- A live playtest evidence card reports wall-clock duration, event total and coverage for Checks, Actions, Encounters, travel, reconnects and narrative notes.

### M4.1 — player view

- The player view shows Campaign, World and Pack context; the Pack-defined Character sheet; Resources, Effects, Inventory, progression and named Location; pending Checks and dice result; Encounter/turn state; party and recent activity.
- Pack labels replace internal Item and progression IDs.
- Responsive layout, touch-sized controls and connection status support phone-sized physical-table use.

### M4.2 — reconnect and recovery

- The browser WebSocket reconnects with bounded exponential backoff and displays connecting, recovering, offline and live state.
- Every message carries the latest persisted event sequence. Reconnect supplies a bounded missed-event summary plus an authoritative Session/party/Actor/Encounter snapshot.
- Authenticated reconnects persist `SessionReconnected` evidence. Full refresh and actual server-process restart restore the same live state.

## Automated and live evidence

- TypeScript, Vitest and web production build pass.
- Fantasy regression smoke covers context, Character read, party travel, narrative log, missed-event catchup and playtest evidence authorization.
- `scripts/m4-acceptance.mjs` passed Classic Fantasy and Cyberpunk on a clean temporary PostgreSQL database. Each Pack completed Session activity, WebSocket catchup, an actual server restart, recovered Actor/Encounter state and clean finish.
- Cyberpunk browser proof used separate GM and player tabs. It showed the full GM control surface and evidence card, the expanded player sheet and named Location, travel and narrative activity, visible reconnecting state while the server was stopped, then automatic connected state and missed-event catchup after restart.

## Deferred evidence

The human playtest protocol remains in `M4_PLAYTEST.md` and should be run before a production-readiness claim. No 120-minute human Session has been executed or recorded.
