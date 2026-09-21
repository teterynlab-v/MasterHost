# M9 Advanced Ecosystem Design

**Approved:** 2026-09-21

## Goal

Complete the optional advanced ecosystem without changing the core World Pack -> Descriptor -> Compiler -> materialized World architecture. Advanced runtime state stays generic and refers to materialized World locations and runtime Actor IDs.

## Scope

- A persisted exploration board built from materialized World locations, with Actor tokens and GM-controlled fog regions.
- Read-only spectator access and an event replay timeline.
- Deterministic campaign recap generated from authoritative events. AI may decorate a recap only through an optional provider interface and is disabled by default.
- Versioned Realm canon facts that a GM can promote from one Campaign and another Campaign can read.
- Creator collaboration documents with membership, optimistic revisions, conflict responses and revision history.
- A cross-Realm community Pack catalog with text, tag and license filters.

Payments and marketplace economics remain outside M9 because the canonical plan marks them `if ever desired` and they require a separate product, legal and external-service decision.

## Data and authority

PostgreSQL stores exploration boards, spectator grants, Realm canon facts and collaboration documents. Existing `game_events` remains the authoritative replay source. Every exploration and canon mutation also writes a game event. GM credentials authorize runtime mutations. Spectator grants contain a random bearer token stored only as a hash and permit only the spectator snapshot, replay and recap routes.

Creator collaboration uses Realm roles and optimistic `expectedRevision`. Published Pack versions remain immutable; collaboration works on draft documents and records author and summary per revision.

## Acceptance gate

On clean PostgreSQL, two creators must update one draft and receive a conflict for a stale revision; a public Pack must be discoverable from another Realm; one live Session must persist a fogged exploration board, Actor token and spectator grant; the spectator must be unable to mutate; replay and recap must survive restart; and a canon fact promoted from Campaign A must be visible to Campaign B in the same Realm. The production web UI must expose the exploration, spectator, replay, recap, canon, collaboration and discovery controls.
