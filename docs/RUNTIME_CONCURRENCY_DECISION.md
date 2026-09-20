# Runtime concurrency decision — 2026-09-21

## Problem

Action and Encounter commands read actor or encounter state before writing. A transaction around only the writes could accept two commands computed from the same old state: both events would persist, while the second write would overwrite the first state change. Duplicate turn advances could emit two TurnEnded events.

## Decision

Actor and Encounter rows carry monotonically increasing database versions. The server loads those versions with the states it gives to the generic runtime. `RuntimeMutationRepository.commit` locks the read actor rows, compares the complete actor snapshot, updates changed rows only at their expected versions, and checks the expected Encounter version. It writes state and events in the same transaction. A stale command rolls back completely and returns HTTP 409, telling the caller to reload and retry. Actor initialization uses the same transaction and inserts only once.

A partial unique index now permits at most one live Encounter per Session. Competing starts return one success and one 409, with no events from the rejected start. An ended Encounter releases the slot. Migration checks for pre-existing duplicates and stops with an explicit error instead of choosing an Encounter to end without an event.

The pure Action and Encounter functions remain in `packages/game-runtime`; the concurrency rule lives in persistence. This works across server processes sharing PostgreSQL and does not require an in-memory mutex.

## Alternatives considered

- Last-writer-wins upserts: lose valid changes while retaining misleading events.
- Process-local mutex: does not protect multiple server processes.
- Rerun a stale command automatically: unsafe for random rolls and commands whose intent may change after another action.

## Compatibility and limits

Existing rows receive version 1 during migration. The state JSON and HTTP response shapes are unchanged. A client may now receive 409 for overlapping commands and should refresh before retrying; the server does not silently reroll. Standalone Check resolution has its own row lock and transaction. Full event replay, command idempotency keys, and concurrency with unrelated World authoring remain separate work.
