# M12 Quick Game Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a guided browser path from an empty Realm and active Pack to a reviewed, compiled one-shot without JSON, YAML or source editing.

**Architecture:** Add a pure authoritative quick-selection review to `@masterhost/descriptor`, expose it through the existing Realm-authorized game-assets API, and build a dedicated React wizard that creates the same persisted M10 Descriptor project. Keep the advanced asset library available as a separate route.

**Tech Stack:** TypeScript, Zod, Fastify, React, Vitest, PostgreSQL 17, Vite and headless Chrome CDP.

**Spec:** `docs/superpowers/specs/2026-09-21-m12-quick-game-builder-design.md`

## Global Constraints

- Preserve World Pack -> Descriptor -> Compiler -> materialized World.
- The GM explicitly selects assets; natural-language composition is excluded.
- The generic runtime cannot branch on Pack or asset identity.
- Quick readiness requires all nine canonical asset types and exact `id@version` dependencies.
- PostgreSQL, actual process restart and browser automation are required acceptance evidence.

## Review Focus

- Manipulated incompatible base Pack input must fail server-side.
- A missing or wrong dependency version must produce an exact actionable diagnostic.
- Duplicate selections for a single Quick category must block readiness.
- Selection ordering must be deterministic even when input order is reversed.
- The browser must never enable creation from a stale review after a selection changes.

---

### Task 1: Authoritative quick-selection review

**Files:**
- Modify: `packages/descriptor/src/asset-registry.ts`
- Modify: `packages/descriptor/src/index.ts`
- Modify: `tests/m11-asset-registry.test.ts`
- Create: `tests/m12-quick-selection.test.ts`

**Interfaces:**
- Consumes: `GameAsset[]`, exact base Pack ID and `{ id, version }[]`.
- Produces: `quickGameAssetTypes`, `QuickGameReview`, `reviewQuickGameSelection(assets, basePackId, selections)`.

- [ ] Write failing tests for complete readiness, missing category, incompatible Pack, unknown/wrong version, missing exact dependency, duplicate category and deterministic dependency order.
- [ ] Implement the nine-category contract, deterministic topological ordering, aggregate counts and license inventory.
- [ ] Run `./node_modules/.bin/vitest run tests/m12-quick-selection.test.ts tests/m11-asset-registry.test.ts` and TypeScript.
- [ ] Commit the tested review contract.

### Task 2: Realm-authorized quick-review API

**Files:**
- Modify: `apps/server/src/game-descriptors.ts`
- Create: `scripts/m12-acceptance.mjs`

**Interfaces:**
- Consumes: `POST /api/game-assets/quick-review` with `{ basePack: { id, version }, selections: { id, version }[] }`.
- Produces: the pure `QuickGameReview`, authorized against the active exact Realm Pack.

- [ ] Add failing live acceptance for no creator token, wrong active Pack, incomplete selection and reversed complete selection.
- [ ] Parse bounded exact identities and call `reviewQuickGameSelection`; reject a non-active exact base Pack.
- [ ] Extend acceptance to create, preview and compile a project using returned ordered selections, then verify restart readback.
- [ ] Run the live script against disposable PostgreSQL and commit the API slice.

### Task 3: Primary guided browser workflow

**Files:**
- Create: `apps/web/src/quick-game-builder.tsx`
- Modify: `apps/web/src/main.tsx`
- Modify: `apps/web/src/style.css`
- Modify: `apps/web/src/game-descriptor-builder.tsx`
- Create: `scripts/m12-browser-acceptance.mjs`

**Interfaces:**
- Consumes: compatible `/game-assets`, authenticated media, `/game-assets/quick-review`, Descriptor preview/create/compile and active Pack questions.
- Produces: the primary `#game-builder` wizard and the preserved `#advanced-game-builder` route.

- [ ] Implement stage navigation, one exact selection per required category, Pack decisions and authenticated previews.
- [ ] Invalidate review/preview on every edit and require fresh valid results on the final stage.
- [ ] Render full review: assets, counts, dependencies, licenses, decisions and diagnostics; compile only after project creation.
- [ ] Add headless Chrome acceptance that uses only visible wizard controls from empty Realm to materialized World and reload.
- [ ] Run TypeScript, production build and browser acceptance; commit the UI slice.

### Task 4: Complete gate, evidence and integration

**Files:**
- Create: `scripts/m12-gate.sh`
- Create: `docs/M12_STATUS.md`
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `docs/superpowers/specs/2026-09-21-m10-m16-open-source-product-roadmap-design.md`

**Interfaces:**
- Consumes: all M12 source and acceptance scripts.
- Produces: one reproducible milestone gate and evidence-led status.

- [ ] Run TypeScript, every ordinary and live repository test, production build, clean PostgreSQL API flow, restart readback and headless browser flow.
- [ ] Run M10 and M11 regression gates.
- [ ] Request independent review; fix every Critical and Important finding in one pass and rerun affected gates.
- [ ] Record source, tests, runtime evidence and remaining limits separately.
- [ ] Commit the complete milestone, integrate into `master`, rerun `scripts/m12-gate.sh` there and verify cleanup.
