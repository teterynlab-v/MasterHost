# Action runtime decision — 2026-09-20

## Problem

M2.1 executed Resource and Effect through separate HTTP branches. That prevented a Pack from composing Check, Dice, Resource and Effect into one action, and it left target validation outside the runtime model.

## Decision

`packages/game-runtime` executes declarative steps and returns new actor states plus versioned event payloads. The server validates the live Session and GM campaign key, loads actors from that Session, invokes the package, and commits new events, actor states and Encounter state in one PostgreSQL transaction. Target policies are `none`, `self`, `single-actor`, and `multiple-actors`. The old `actor` spelling and single-kind Resource/Effect definitions are adapted for existing Packs.

Encounter ordering is Pack configuration. The generic lifecycle emits Encounter, Round, Turn, EffectTicked and EffectExpired events. A Pack with `orderingPolicy: none` has no turn progression. The first two test Packs use fixed and none policies, respectively.

## Alternatives considered

- Keep kind-specific route branches: simple for M2.1, but each new mechanic adds setting-adjacent server logic and cannot compose conditional steps.
- Add an Attack subsystem: rejected because the same step graph should support healing, hacking, stress and other Pack semantics.
- Execute arbitrary Pack scripts: rejected because Packs are untrusted declarative data.

## Compatibility and limits

Existing Resource/Effect actions still execute. Pack-defined composed actions use `steps` with Check/Roll/Resource/Effect, an optional previous outcome condition, and numeric references such as `damage.total` or `input.difficulty`. The current executor deliberately supports a small expression vocabulary; there is no `eval`. Existing Check request/roll endpoints remain separate and have not yet moved into the same transaction boundary. A session snapshot still comes through WebSocket; full event replay is future work.
