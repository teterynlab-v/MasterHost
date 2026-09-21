# M14 Portable Game Package Status

**Status:** canonical local M14 gate passed on 2026-09-21.

## Delivered source

- `.mhgame` is a self-contained, checksum-locked ZIP containing the exact `.mhpack`, independently portable `.mhworld`, selected game-asset evidence, a dependency/media lock and complete attribution. The current format is `masterhost.game@0.1`; the importer migrates the legacy `0.0` `licenses.json` entry in memory.
- Archive inspection happens before persistence. It bounds compressed and expanded sizes and entry count, rejects encrypted, duplicate, raw or percent-encoded traversal and unexpected paths, verifies every outer checksum, reuses the nested Pack/World validators and rejects cross-document Pack, selection, lock, media and attribution mismatches.
- `GamePackageRepository.install` uses one PostgreSQL transaction to create an immutable runtime Pack, a separately identified editable Pack fork with `.mhgame` lineage, a remapped materialized World and revision, World media, durable import evidence and the Realm active-Pack switch. Published identity collisions and late media failures roll back every inserted row.
- Realm owner/creator/GM access can export; owner/creator access imports and reads import evidence. Export resolves exact published Pack projects or immutable Descriptor revisions and copies every required media byte. Runtime use of an imported game reads the embedded Pack and has no source asset-library dependency.
- The browser exposes **Install complete game (.mhgame)**, **Export complete .mhgame**, imported runtime identity and direct editing of the generated Pack fork. Existing `.mhworld` and `.mhpack` flows remain available.

## Tests

- `tests/m14-mhgame.test.ts` covers deterministic archive output, exact nested round trip, media/evidence preservation, `0.0` migration, unsupported versions, checksum tampering, raw and encoded traversal, compressed-size rejection, Pack identity mismatch, atomic install, collision rollback and late media-validation rollback.
- `./scripts/m14-gate.sh` passed TypeScript, 142 ordinary tests with two environment-gated tests skipped in that phase, the production Vite build, both live PostgreSQL repository tests, two-installation API acceptance, restart readback and headless Chrome acceptance.
- The complete `./scripts/m13-gate.sh` regression passed after the M14 changes: 142 ordinary tests, the live Descriptor repository test, clean PostgreSQL API/restart acceptance and the full-custom browser flow. Its catalog assertion now waits for the asynchronous cards it tests instead of racing the loading state.

## Runtime proof

The reproducible gate used disposable PostgreSQL 17 databases and real server processes:

1. installation A composed all nine Sunforge asset categories, forked the Descriptor into a custom Pack, added a custom template, Pack image and materialized-World image, published it, generated the World and exported one `.mhgame`;
2. installation A stopped before installation B started with an empty `GAME_ASSET_LIBRARY_PATH`;
3. B imported the file and matched the normalized Descriptor, seed, Pack identity, materialization paths, kinds, values, tags, traits, entity media references and World media metadata while intentionally receiving new World/entity IDs;
4. selected asset evidence and attribution counts, exact Pack image bytes and exact World image bytes read back from B;
5. the editable fork changed, validated, published and compiled a second World containing the custom structure, while the imported runtime Pack remained active and immutable;
6. B created a Pack-defined Character, Campaign and live lobby Session;
7. malformed and duplicate/collision imports returned errors with unchanged Pack and World counts;
8. after a real B restart, the imported World, active runtime Pack, import evidence, published fork, second World and a new editable version read back;
9. headless Chrome opened the imported World, found both portable-game controls, opened the `.mhgame` lineage fork and saved a visual edit;
10. gate cleanup left no server, web, Chrome or PostgreSQL child resource.

## Remaining product limits

- Active Campaign/Session history is excluded by design; `.mhgame` transfers a playable game definition and materialized starting World.
- M15 covers the complete table-running experience and human rehearsal.
- M16 covers public installation, contributor workflow, license inventory review and the real multi-player release game.
