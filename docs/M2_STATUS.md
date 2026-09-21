# M2 Status — generic runtime baseline (2026-09-21)

M2.2 declarative actions, M2.3 target policies, M2.4 Encounter ordering/turns, and M2.5 effect ticking/expiry are implemented in `packages/game-runtime` and verified with tests plus a live PostgreSQL smoke. Runtime mutations use one transaction for events and materialized state, with actor and Encounter version checks. See `RUNTIME_CONCURRENCY_DECISION.md` for the conflict policy. See `PROJECT_STATUS.md` and `ACTION_RUNTIME_DECISION.md` for limits.

## Implemented

### Dice / Checks
- Generic Dice parser and auditable server roll.
- Pack-defined Checks.
- Pack loading validates executable dice syntax and bounded roll complexity (at most 100 dice across 20 terms, 256 expression characters, and a bounded modifier), and requires numeric Character fields for Check modifiers and attribute Encounter ordering.
- CheckRequested → DiceRolled → CheckResolved.
- Character modifiers.
- Persistent game events; Check request and resolution update their events in transactions. An optional Session-scoped idempotency key stores a Check request response with its event, so concurrent retries return one request. Eight concurrent roll requests return the same saved resolution in the live smoke.

### Generic Action layer
- `ActionDefinition` with kinds: check/resource/effect/custom.
- Generic Resources.
- Generic Effects.
- ActiveEffect duration model.
- Effect modifiers applied to Checks.
- Resource min/max clamping.
- Runtime Actor state persisted per Session and Actor, including NPCs.
- Pack loading rejects unexecutable legacy Actions, mixed/unknown declarative step fields, unknown numeric references or conditional outputs, missing target actors, out-of-range Resource defaults, incomplete Effect durations, and Effect modifiers without a numeric Character or Actor field. `custom` remains a domain kind but has no Pack executor and is rejected at load.
- Action and Encounter commands reject stale actor/Encounter versions with 409 and roll back their events.
- Pack-defined Encounter ordering; fixed, rolled, attribute, custom, and no-turn policies run through the same commands.
- PostgreSQL permits only one live Encounter per Session; concurrent starts leave one committed event sequence.
- Action, Encounter, NPC creation, Actor initialization and Check creation commands support an optional Session-scoped idempotency key, persisted atomically with their events and result.
- GM can instantiate a Session NPC from a Pack actor template. NPC resources and attributes are Pack-defined; NPCs use the same Action and Encounter engine as player actors.
- NPCs can optionally link to compatible entities of their Campaign's materialized World. A Session permits one Actor per linked entity; Fantasy and Cyberpunk materialize compatible actor entities through their Pack template graphs.
- GM can add initialized Actors to, or remove non-current Actors from, a live Encounter. The roster event and Encounter version update are atomic; late entrants append to the established order. See `WORLD_ACTOR_ENCOUNTER_DECISION.md`.
- GM-only runtime verification reconstructs Actor and Encounter state from version-1 events and compares it with persisted materialized state in one database snapshot.
- GM can create a checkpoint only after full replay matches materialized state. Checkpoint verification replays subsequent events. An offline command can repair divergent Actor/Encounter rows for a finished Session and records an audit row; see `RUNTIME_RECOVERY_DECISION.md`.
- Standalone pending and resolved Checks now have a separate event replay verifier and offline finished-Session repair with audit. The GM-only verification endpoint reports mismatches; Action-scoped rolls are excluded from this Check projection. See `CHECK_RECOVERY_DECISION.md`.

### Pack examples

Classic Fantasy:
- Health, Mana.
- Poisoned, Inspired.
- Damage, Heal, Poison.
- Rally applies Inspired to multiple actors.
- Goblin actor template with bounded starting resources and action attributes.

Cyberpunk:
- Health, Humanity, Ammo.
- Jammed, Boosted.
- Spend Ammo, Damage, Jam.
- Signal Boost applies Boosted to multiple actors.
- Security Drone actor template with its own resources and attributes.

Same runtime engine handles both settings.

Both Packs now declare optional numeric Character abilities for their Checks and actions. Existing saved Characters without these fields still resolve with a zero modifier; the new Character Builder step allows players to enter values. Cross-setting conformance tests execute each Pack's Check, composed Action and Encounter policy through the same runtime functions.

### UI
- GM can initialize party runtime state.
- GM sees Resources/Effects.
- GM can request Checks.
- GM can apply generic Actions.
- GM can select multiple Action targets, start/end Encounters, and advance turns when the Pack defines an order.
- GM can add NPCs, choose them as Action source or target, and include them in Encounters.
- GM can choose a materialized World entity when adding an NPC and adjust an active Encounter's roster.
- Player can see own Resources/Effects, roll Checks, and see Encounter/turn state.
- GM and player views restore live state after reload; both can move on after a finished Session.
- Game log records runtime events.

The Fantasy browser flow verified a two-target Rally, effect ticking on turn advance, current-player changes, Encounter restore after reload, and Session finish. The Cyberpunk browser flow verified an active no-turn Encounter on GM and player screens; the live API smoke verified two-target Signal Boost and absence of TurnStarted events.

A later Fantasy browser flow verified adding Goblin, an NPC-sourced action against a player, a player-to-NPC turn transition, and Session finish. A further browser flow linked Goblin to a generated World creature, added and removed it in a live Encounter without changing the current turn, then finished the Session. Both Pack API smokes verify linked NPCs and roster changes. NPCs still use Pack templates for mechanics and are not independently editable or removable as individual records.

On 2026-09-21, the Fantasy browser created a Character through the three-step Pack schema, entered Perception 2 and Athletics 3, and reached the Session lobby. The Fantasy and Cyberpunk PostgreSQL API smokes exercised numeric Check modifiers and Pack actions; both M0 persistence/ZIP smokes remained green. The full suite passed 52 tests, TypeScript passed, and the web production build passed. This verifies the two bundled Packs and local runtime; it is not acceptance of arbitrary third-party Packs.

The Check recovery slice passed 54 tests, TypeScript, the web build, both Pack API smokes with live PostgreSQL Check verification, and an isolated PostgreSQL corruption/repair smoke. No browser UI changed in this slice. Database Check timestamps are outside comparison; see the decision record.

## Next architecture step

1. Add multi-node realtime delivery. Check repair and Actor/Encounter repair remain separate stopped-server commands; checkpoints cover Actor/Encounter state only.
2. Add NPC editing/removal and explicit reconciliation if a linked World entity changes or disappears in a later revision.
3. Extend Pack validation for future capabilities when their execution semantics are defined; arbitrary third-party Packs and custom Action executors remain outside this verified slice.
