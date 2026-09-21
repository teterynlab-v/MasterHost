# M5 Status — Advanced World Builder accepted locally (2026-09-21)

**Milestone gate: passed for both bundled Packs.** A Creator can edit and extend a materialized World through the browser without YAML or code. The evidence covers sustained revisioned authoring, destructive-impact protection, server restart and portable export/import.

## Source

### M5.0 — universal entity editor

- One editor works over materialized entities from either Pack and exposes AUTO, CUSTOM, LOCK/UNLOCK, RESET TO PACK and REGENERATE.
- Custom properties, tags, traits and parent structure are editable. Every successful mutation creates a World revision and reloads authoritative state.
- Scoped regeneration shows changed/created/removed/preserved/locked counts and creates a named snapshot before committing.

### M5.1 — World structure editors

- The Pack template catalog supplies supported kinds. Creators can search/filter, add, move and remove geography, settlement, faction, culture, creature, NPC, item, location, encounter, event or rule structures when the Pack exposes those kinds.
- Parent changes reject cycles. Custom entities retain stable IDs and materialization paths.

### M5.2 — dependencies and impact

- The editor derives parent and value-reference edges from the authoritative World and shows edges focused on the selected entity.
- Removal impact includes the full descendant scope and inbound references. Referenced scopes return 409 instead of deleting data.

### M5.3 — Media Library

- PNG, JPEG and WebP bytes are validated and stored by checksum. Creators can upload, tag, browse, reuse, replace with explicit confirmation, define variants and delete unused media.
- Replacing assigned bytes updates entity checksums atomically. Assigned or Art Set referenced media cannot be silently deleted.

### M5.4 — Art Set editor

- Pack Art Sets load from declarative Pack files and their standard assets are served read-only.
- World Art Sets persist name, description and role mappings. The browser creates, edits and activates them and previews entity, type, family and Art Set fallback resolution.
- World Art Sets and media metadata are included in checksum-validated `.mhworld` transport.

## Acceptance evidence

- TypeScript check: pass.
- Vitest: 23 files, 69 tests: pass.
- Vite production build: pass.
- `scripts/m5-acceptance.mjs`: Classic Fantasy and Cyberpunk each produced 37 durable World revisions on a clean temporary PostgreSQL database, then passed readback after an actual server-process restart.
- Each Pack acceptance covered long edit sequences, all Pack-supported structure kinds, value modes, custom structures, dependency-blocked removal, scoped regeneration with snapshot, media metadata/variants/replacement, custom Art Set activation, Pack asset delivery and `.mhworld` round trip.
- Cyberpunk browser proof rendered the entity editor with inherited/assigned previews, Media Library, dependency edges and impact controls, and the active `M5 Studio` Art Set editor.

## Limits outside M5

- Realm-grade creator authorization and untrusted hosted multi-tenancy remain later platform work.
- Simultaneous collaborative editing is protected by revision conflicts but has no merge UI.
- Media remains PostgreSQL-backed with the local 20-image and 2 MB per-image limits; external object storage and garbage collection remain future work.
- Acceptance certifies the two bundled Packs, not arbitrary third-party Packs.
