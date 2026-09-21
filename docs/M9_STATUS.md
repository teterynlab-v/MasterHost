# M9 Advanced Ecosystem Status

**Status:** canonical local M9 gate passed on 2026-09-21.

## Delivered source

- Generic persisted exploration boards derive their nodes from materialized World locations. GM mutations move Actor tokens and reveal or hide polygonal fog regions with optimistic board revisions and authoritative game events.
- Random spectator grants are stored as hashes. Spectators can read redacted board state, replay and recap, while runtime mutation endpoints remain GM-only.
- Replay reads the ordered authoritative `game_events` stream. Campaign recap is deterministic and factual; the AI provider contract reports a disabled optional decoration capability and the core path has no AI dependency.
- Realm canon facts are versioned, retain source Campaign and Session provenance, and are visible to other Campaigns in the same Realm.
- Creator collaboration applies validated World Pack documents to the real draft Pack project, records author/summary history and rejects stale revisions with `409`.
- Community discovery searches public published Packs across Realms by name, description, Pack ID, Realm, tag and license.
- The game UI exposes exploration, spectator access, replay, recap and canon. Realm Console exposes community discovery and collaborative draft revisions.

## Tests

- `tests/m9-advanced-ecosystem.test.ts` covers player/spectator fog redaction, order-independent deterministic recap and stable community filtering.
- Full Vitest suite: **95 passing tests across 26 files**.
- TypeScript project check: pass.
- Production Vite build: pass.

## Runtime proof

- `scripts/m9-gate.sh` reproducibly passed TypeScript, the full test suite, production build, clean PostgreSQL 17 setup, live acceptance, server restart/readback and headless Chrome acceptance. It invokes `scripts/m9-acceptance.mjs` for the two runtime phases and `scripts/m9-browser-acceptance.mjs` for the browser phase, then removes its temporary processes, files and container.
- Two creator identities wrote successive valid Pack revisions; a stale edit returned `409`; the resulting published Pack was discovered from a second Realm.
- One live Session persisted a location board, revealed fog, an Actor token and a read-only spectator grant. The spectator saw no hidden polygon geometry and could not mutate the board.
- Replay and deterministic recap contained the expected authoritative events. A fact promoted by Campaign A was read from Campaign B in the same Realm.
- After an actual server process restart, the board, spectator authorization, redacted replay/recap and Realm canon readback all passed again.
- Automated browser acceptance executed cross-Realm community search, displayed the Creator collaboration workspace, reconnected a Pack-defined Character into a live Session, and displayed the M9 player panel with shared canon, authoritative replay and deterministic/AI-disabled status. The preceding manual browser pass also completed the four-step Pack-defined Character flow.

## Limits

- Marketplace payments and economics are excluded because the canonical plan marks them `if ever desired`; they require a separate product, legal and payment-provider decision.
- The AI extension point is intentionally disabled and no external provider was configured.
- Fog editing uses polygon data and location nodes but the current browser panel is a compact control surface rather than a drag-and-drop canvas.
- Spectator grants are bearer credentials and currently have manual revocation without expiry or account-backed identity.
- Community moderation, ratings, signed publisher trust and abuse controls remain production platform work.
