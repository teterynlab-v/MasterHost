# M13 Advanced and Full Custom Builder Implementation Plan

> **Execution:** implement task by task with test-first changes, verified commits and one final independent review.

**Goal:** Deliver a choice-rich asset menu and a browser-only path from exact asset composition to a distinct fully custom, validated and compiled game.

**Architecture:** Keep immutable published assets and saved Descriptors as source evidence. Fork a composed Descriptor revision into the existing Realm-owned Pack project model, then use an expanded schema-aware visual Pack editor. Continue through the generic compiler and materialized World runtime.

**Spec:** `docs/superpowers/specs/2026-09-21-m13-advanced-full-custom-builder-design.md`

## Task 1: Authenticated media and choice-rich library

**Files:** `apps/web/src/authenticated-image.tsx`, `apps/web/src/world-builder.tsx`, `apps/web/src/pack-creator.tsx`, `game-assets/library/**`, asset tests and browser acceptance.

- Add a reusable authenticated image component backed by the existing binary request helper.
- Replace direct protected image URLs in World and Pack editors.
- Add two distinct alternatives for every canonical asset category and compatible generic capability contracts.
- Prove three choices per category, distinct composition results, valid checksums/licenses and visible browser images.
- Commit the complete library and media slice.

## Task 2: Descriptor-to-Full-Custom fork

**Files:** Pack project domain/repository/API, Descriptor API, Advanced builder and focused tests.

- Add immutable Descriptor lineage metadata to Pack projects.
- Fork an exact saved Descriptor revision into a draft Pack project with all composed media bytes.
- Reject stale, invalid or inaccessible source projects and preserve the source Descriptor unchanged.
- Add the visible Advanced builder transition and open the resulting Full Custom project.
- Prove persistence and restart readback; commit the fork slice.

## Task 3: Complete visual structure editors

**Files:** `apps/web/src/pack-creator.tsx`, supporting editor components/helpers, SDK authoring validation and tests.

- Add visual controls for every structure listed in the M13 design.
- Add dependency reference analysis and block unsafe removal with named inbound references.
- Keep all edits in the typed document and save through optimistic Pack revisions.
- Add focused unit tests for edit helpers and validation reference failures.
- Commit the complete editor slice.

## Task 4: Full browser and PostgreSQL acceptance

**Files:** `scripts/m13-acceptance.mjs`, `scripts/m13-browser-acceptance.mjs`, `scripts/m13-gate.sh`.

- Use a clean database to assemble two distinct Quick games.
- Fork a saved Descriptor and perform browser-only custom rule, Character, World and media edits.
- Exercise unsafe removal, successful validation, publishing, compilation, CUSTOM/LOCK and scoped regeneration.
- Restart and verify lineage, projects, media and World state.
- Fail on browser exceptions, failed HTTP responses or unloaded images.

## Task 5: Evidence, review and integration

**Files:** `docs/M13_STATUS.md`, `docs/PROJECT_STATUS.md`, canonical roadmap status.

- Run TypeScript, all tests, production build, live repository tests and the full M13 gate.
- Run M12 regression acceptance.
- Request independent review and resolve every Critical and Important finding.
- Record source, tests, runtime proof and limits separately.
- Commit, integrate locally into `master`, rerun M13 there and clean the worktree.
