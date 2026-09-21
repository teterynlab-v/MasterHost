# M15 Complete Table Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver and prove the complete M15 at-table rehearsal for a GM and players.

**Architecture:** Add a revisioned, redacted table-state aggregate beside the existing exploration board, while keeping Actors, Actions, Checks and Encounters in the generic Pack runtime. Extend the current React table panel and player game view, then exercise the entire gate against clean PostgreSQL and Chrome.

**Tech Stack:** TypeScript, Fastify, PostgreSQL, React, Vitest, Playwright/Chrome DevTools Protocol scripts.

**Spec:** `docs/superpowers/specs/2026-09-21-m15-complete-table-experience-design.md`

## Global Constraints

- Preserve World Pack → Descriptor → compiler → materialized World.
- Core contains no setting-specific branches.
- Private GM note text never leaves the GM-authorized table response.
- Every state mutation is durable and revision-conflict safe.
- M15 needs a complete clean-database rehearsal and actual server restart.

## Review Focus

- A participant spoofing another actor must receive `403` and commit no event.
- A stale table revision must receive `409` and retain the winning state.
- Private note text must be absent from player, spectator, replay and event responses.
- Hidden map geometry must not expose nodes or tokens to players.
- A partial rehearsal must list missing stages and keep `gatePassed` false.

---

### Task 1: Table domain and visibility contract

**Files:**
- Create: `packages/game-runtime/src/table.ts`
- Modify: `packages/game-runtime/src/index.ts`
- Test: `tests/m15-table-experience.test.ts`

**Interfaces:**
- Produces: `TableState`, `PublicTableState`, `createTableState`, `visibleTableState`, `buildRehearsalReport`.

- [ ] Write failing tests for table construction, private-note redaction, rehearsal completeness and missing-stage reporting.
- [ ] Run `pnpm vitest run tests/m15-table-experience.test.ts` and confirm failure.
- [ ] Implement immutable table types, validation helpers, redaction and report aggregation.
- [ ] Run the focused test and commit the passing domain contract.

### Task 2: Transactional table persistence

**Files:**
- Modify: `packages/persistence/src/advanced-ecosystem-repository.ts`
- Test: `tests/m15-table-repository.test.ts`

**Interfaces:**
- Consumes: `TableState` from Task 1.
- Produces: `table`, `createTable`, and `updateTable` repository methods.

- [ ] Write a live PostgreSQL test proving create/read, optimistic conflict, atomic event insertion and private-note event redaction.
- [ ] Run the focused test with `TEST_DATABASE_URL` and confirm failure.
- [ ] Add `session_table_state` migration and transactional repository methods.
- [ ] Run the live repository test and commit the persistence contract.

### Task 3: Runtime authorization and rehearsal APIs

**Files:**
- Modify: `apps/server/src/runtime.ts`
- Test: `tests/m15-table-experience.test.ts`

**Interfaces:**
- Consumes: table repository and report builder.
- Produces: `/table`, `/table/beats`, `/rehearsal-report`, and participant-authorized `/actions` behavior.

- [ ] Add failing authorization/report validation tests for actor spoofing, invalid table changes and incomplete evidence.
- [ ] Implement strict request validation, GM/public views, safe broadcasts and participant self-action authorization.
- [ ] Run focused tests, typecheck, and commit the API slice.

### Task 4: GM and player table UI

**Files:**
- Modify: `apps/web/src/advanced-session.tsx`
- Modify: `apps/web/src/game.tsx`
- Modify: `apps/web/src/style.css`

**Interfaces:**
- Consumes: Task 3 endpoints and existing Pack definitions/session socket.
- Produces: visual map, pacing/scenes/notebook, player actions and rehearsal card.

- [ ] Implement the responsive SVG map, actor token picker and fog controls.
- [ ] Implement GM phase, scene, shared/private note and beat controls.
- [ ] Implement player Pack Action selection and execution as the player's own actor.
- [ ] Run web typecheck/build and commit the browser experience.

### Task 5: Complete M15 gate and evidence

**Files:**
- Create: `scripts/m15-acceptance.mjs`
- Create: `scripts/m15-browser-acceptance.mjs`
- Create: `scripts/m15-gate.sh`
- Create: `docs/M15_STATUS.md`
- Modify: `docs/PROJECT_STATUS.md`

**Interfaces:**
- Consumes: complete M15 source and clean PostgreSQL.
- Produces: reproducible source, runtime, restart and browser evidence.

- [ ] Implement a clean-database API rehearsal that covers all nine report stages, authorization/redaction negatives and restart readback.
- [ ] Implement headless Chrome GM/player interaction through the visible controls.
- [ ] Run TypeScript, all ordinary tests, live repository tests, production build, API rehearsal, restart readback and browser rehearsal.
- [ ] Update status with exact evidence and limits, run the complete gate once more, and commit the verified milestone.
