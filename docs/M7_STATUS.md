# M7 — Publishing and Hosted Platform

**Status:** canonical M7 gate passed locally on 2026-09-21.

## Delivered source

- World and Pack publications support `private`, `unlisted`, and `public` visibility plus independent Campaign, fork, modify, and portable Character policies. Realm owner, creator, GM, and player credentials are hashed at rest and checked on both hosted routes and the existing generic routes.
- Each Realm has an independent slug/domain, active immutable Pack, name, logo, favicon, landing art, color theme, terminology, guest setting, and quotas. The browser resolves all Pack, World, Character, Campaign, Session, and asset requests through the selected Realm.
- PostgreSQL enforces Realm-scoped Pack and World persistence and globally unique active six-digit Session PINs. The global resolver returns the matching Realm brand without exposing administrative state and has a per-process abuse limit.
- Content-addressed brand objects expose immutable checksum URLs with ETag and cache headers. PostgreSQL telemetry tracks hosted lifecycle events. Realm configuration, publications, brand objects, Pack projects, and materialized Worlds can be checksummed, backed up, and transactionally restored.
- Realtime delivery uses PostgreSQL `LISTEN`/`NOTIFY` with durable message envelopes, allowing WebSocket clients connected to one server process to receive mutations handled by another.
- Realm Console manages credentials, branding/domain, active Pack, quotas, publication policies, usage, telemetry, and backup/restore without source editing.

## Automated and runtime evidence

- TypeScript check: pass.
- Vitest: 24 files and 72 tests pass.
- Vite production build: pass.
- `scripts/m7-acceptance.mjs` on a clean temporary PostgreSQL database: pass.
  - created `Ember Crown` and `Neon Circuit` with different brands, terminology, published Packs, Worlds, visibility, and policies;
  - rejected anonymous generation, cross-Realm reads, and policy bypasses through both hosted and generic routes;
  - resolved two distinct globally unique PINs to the correct branded Realm;
  - delivered `participant.joined` from server process A to a WebSocket on process B;
  - read the content-addressed image from process B with immutable cache headers;
  - enforced a World quota, aggregated Realm telemetry, verified a backup checksum, and restored changed brand state;
  - after stopping both server processes, a fresh process read both Realm identities, active Packs, Worlds, and active Sessions from PostgreSQL.

## Browser evidence

Two separate browser tabs loaded the same deployment with `?realm=ember-crown` and `?realm=neon-circuit`. They rendered different product names, Pack identities, terminology (`Dominion`/`Vanguard`/`Chronicler` and `Grid`/`Runner`/`Operator`), primary/background colors, logos, and public catalog counts. Realm Console rendered the same Realm branding and its access, brand/domain, Pack/quota, publication, telemetry, and backup controls.

## Gate result and limits

The canonical gate is satisfied locally: one deployment hosted two visually independent, Pack-driven RPG universes with isolated data and shared horizontally delivered realtime.

This is development hosting evidence. The object adapter and event bus use PostgreSQL; no external CDN, load balancer, managed object store, or production identity provider was deployed. The current Realm backup covers published configuration/content and materialized Worlds, not active runtime event history or membership credentials. The global PIN limiter is process-local. Production disaster recovery, centralized abuse controls, token rotation/recovery, audit retention, moderation, signed Pack trust, and load/chaos testing remain deployment-readiness work rather than evidence claimed by this gate.
