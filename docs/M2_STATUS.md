# M2 Status — generic runtime baseline (2026-09-21)

M2.2 declarative actions, M2.3 target policies, M2.4 Encounter ordering/turns, and M2.5 effect ticking/expiry are implemented in `packages/game-runtime` and verified with tests plus a live PostgreSQL smoke. Runtime mutations use one transaction for events and materialized state, with actor and Encounter version checks. See `RUNTIME_CONCURRENCY_DECISION.md` for the conflict policy. See `PROJECT_STATUS.md` and `ACTION_RUNTIME_DECISION.md` for limits.

## Implemented

### Dice / Checks
- Generic Dice parser and auditable server roll.
- Pack-defined Checks.
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
- Action and Encounter commands reject stale actor/Encounter versions with 409 and roll back their events.
- Pack-defined Encounter ordering; fixed, rolled, attribute, custom, and no-turn policies run through the same commands.
- PostgreSQL permits only one live Encounter per Session; concurrent starts leave one committed event sequence.
- Action, Encounter, NPC creation, Actor initialization and Check creation commands support an optional Session-scoped idempotency key, persisted atomically with their events and result.
- GM can instantiate a Session NPC from a Pack actor template. NPC resources and attributes are Pack-defined; NPCs use the same Action and Encounter engine as player actors.
- NPCs can optionally link to compatible entities of their Campaign's materialized World. A Session permits one Actor per linked entity; Fantasy and Cyberpunk materialize compatible actor entities through their Pack template graphs.
- GM can add initialized Actors to, or remove non-current Actors from, a live Encounter. The roster event and Encounter version update are atomic; late entrants append to the established order. See `WORLD_ACTOR_ENCOUNTER_DECISION.md`.
- GM-only runtime verification reconstructs Actor and Encounter state from version-1 events and compares it with persisted materialized state in one database snapshot.
- GM can create a checkpoint only after full replay matches materialized state. Checkpoint verification replays subsequent events. An offline command can repair divergent Actor/Encounter rows for a finished Session and records an audit row; see `RUNTIME_RECOVERY_DECISION.md`.

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

## Next architecture step

1. Expand Pack capability validation and cross-setting runtime conformance beyond the current actor-kind, resource and action reference checks.
2. Add multi-node realtime delivery and operational recovery for pending Checks. Current checkpoints cover Actor/Encounter state only; repair requires a finished Session and stopped servers.
3. Add NPC editing/removal and explicit reconciliation if a linked World entity changes or disappears in a later revision.
