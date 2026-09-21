# M14 Portable Game Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver secure, self-contained `.mhgame` export/import that moves one complete playable and editable game between installations.

**Architecture:** Compose the already hardened `.mhpack` and `.mhworld` containers inside a checksum-locked outer ZIP. Parse and validate the complete archive before using a dedicated PostgreSQL repository to atomically persist an immutable runtime Pack, editable fork, independent World, import evidence and active-Pack switch.

**Tech Stack:** TypeScript, fflate, Zod, Fastify, postgres.js, React, Vitest, PostgreSQL 17, Chrome DevTools Protocol.

**Spec:** `docs/superpowers/specs/2026-09-21-m14-portable-game-package-design.md`

## Global constraints

- Preserve World Pack → Descriptor → Compiler → materialized World.
- Imported runtime behavior must not read the source asset library.
- Validate archive paths, sizes, schemas, checksums, dependencies and attribution before persistence.
- Import is one PostgreSQL transaction and leaves no partial records after failure.
- Runtime Session history is excluded.

## Review focus

- ZIP bombs and malformed central directories must fail before decompression.
- Encoded traversal, duplicate entries and unexpected files must fail.
- Nested archives that are individually valid but disagree on Pack identity must fail.
- Reimport and published Pack collisions must fail without partial persistence.
- Remapped entity IDs must preserve every parent and asset reference.

### Task 1: Archive contract and migrations

**Files:** create `packages/persistence/src/mhgame.ts`; modify `packages/persistence/src/index.ts`; create `tests/m14-mhgame.test.ts`.

- Write failing tests for exact archive layout, deterministic checksums, media round trip, `0.0` license migration, traversal, duplicate/checksum, size, unsupported version and Pack mismatch rejection.
- Implement `exportMhGame(input): Uint8Array`, `inspectMhGame(bytes, realmId): ImportedMhGame` and current portable types by composing `exportMhPack`, `importMhPack`, `exportMhWorldZip` and `importMhWorldZipWithAssets`.
- Prove selected asset definitions, dependency lock and attribution exactly match the payload and contain no executable content.
- Commit the transport slice.

### Task 2: Atomic import repository

**Files:** create `packages/persistence/src/game-package-repository.ts`; modify exports; create `tests/m14-game-package-repository.test.ts`.

- Add the `game_package_imports` persistence table and read model.
- Prepare remapped immutable runtime Pack, editable fork lineage and World before the transaction.
- Insert runtime Pack, draft fork, World, World revision, media blobs, import evidence and Realm active Pack in one transaction.
- Test success/readback and force failures at collision and late blob validation boundaries; assert zero partial rows.
- Commit the atomic persistence slice.

### Task 3: API export/import resolution

**Files:** create `apps/server/src/game-packages.ts`; modify `apps/server/src/index.ts`, `apps/server/src/hosted.ts` only where required; create focused API tests.

- Register `.mhgame` MIME parsing with a strict compressed body limit.
- Resolve exact Pack documents/media for published Pack projects and Descriptor-composed Worlds.
- Collect exact selected asset definitions, dependency locks and attribution.
- Add Realm-authorized export, import and import-evidence endpoints.
- Make `GAME_ASSET_LIBRARY_PATH` configurable so installation B acceptance can start with an empty directory.
- Commit the server slice.

### Task 4: Browser product flow

**Files:** modify `apps/web/src/main.tsx`, `apps/web/src/world-builder.tsx`, `apps/web/src/pack-creator.tsx`; add focused helpers/tests if needed.

- Add `.mhgame` export to World Builder.
- Add `.mhgame` import to the empty World flow and open the imported World.
- Show imported package identity and editable fork action; use authenticated media paths.
- Keep `.mhworld` and `.mhpack` flows unchanged.
- Commit the browser slice.

### Task 5: Two-installation acceptance

**Files:** create `scripts/m14-acceptance.mjs`, `scripts/m14-browser-acceptance.mjs`, `scripts/m14-gate.sh`.

- Start databases A and B, export from A, stop A, then run B with an empty asset library.
- Compare canonical Descriptor/World structures, media bytes, lock and attribution; restart B and repeat readback.
- Edit/publish the fork, compile a second World, create a Character/Campaign/Session.
- Exercise tampered, traversal, oversize, incompatible and collision imports and prove counts stay fixed.
- Exercise export/import/fork navigation and media rendering through headless Chrome.

### Task 6: Evidence and integration

**Files:** create `docs/M14_STATUS.md`; modify `docs/PROJECT_STATUS.md` and M14 spec status.

- Run the complete M14 gate and M13 regression.
- Review the complete diff for setting-specific runtime branches, incomplete archive validation and false acceptance claims.
- Record source, tests, runtime proof and limits separately.
- Commit, integrate into local `master`, rerun M14 from integrated HEAD and remove the worktree.
