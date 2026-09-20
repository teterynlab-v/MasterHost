# M2 Status — generic runtime baseline (2026-09-20)

M2.2 declarative actions, M2.3 target policies, M2.4 Encounter ordering/turns, and M2.5 effect ticking/expiry are implemented in `packages/game-runtime` and verified with tests plus a live PostgreSQL smoke. New runtime mutations use one transaction for events and materialized state. See `PROJECT_STATUS.md` and `ACTION_RUNTIME_DECISION.md` for limits.

## Implemented

### Dice / Checks
- Generic Dice parser and auditable server roll.
- Pack-defined Checks.
- CheckRequested → DiceRolled → CheckResolved.
- Character modifiers.
- Persistent game events.

### Generic Action layer
- `ActionDefinition` with kinds: check/resource/effect/custom.
- Generic Resources.
- Generic Effects.
- ActiveEffect duration model.
- Effect modifiers applied to Checks.
- Resource min/max clamping.
- Runtime Actor state persisted per Session/Participant.

### Pack examples

Classic Fantasy:
- Health, Mana.
- Poisoned, Inspired.
- Damage, Heal, Poison.

Cyberpunk:
- Health, Humanity, Ammo.
- Jammed, Boosted.
- Spend Ammo, Damage, Jam.

Same runtime engine handles both settings.

### UI
- GM can initialize party runtime state.
- GM sees Resources/Effects.
- GM can request Checks.
- GM can apply generic Actions.
- Player can see own Resources/Effects and roll Checks.
- Game log records runtime events.

## Next architecture step

1. Add authenticated participant commands and private reads.
2. Add concurrency control and event replay from snapshots.
3. Complete Encounter and multiple-target UI for GM and Player.
4. Move the older Check request/roll path into the same transaction boundary.
5. Expand Pack validation and cross-setting runtime conformance.
