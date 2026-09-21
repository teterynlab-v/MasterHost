# M16 Product UX and Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the engineering-first demo with the approved product journey and ship English, Russian, Spanish, Japanese, Simplified Chinese and Korean UI packs.

**Architecture:** Keep the Pack-driven runtime and APIs unchanged. Add a typed browser-side localization runtime, a product home/game library shell, guided campaign setup and task-oriented GM/player workspaces; keep authoring and diagnostics behind secondary routes.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, existing Fastify/PostgreSQL runtime.

**Spec:** Approved interactive mockups at `/Users/viktarteteryn/.codex/visualizations/2026/09/20/01a0c04d-438e-7ee0-b053-33c6df196886/masterhost-product-mockups.html` and `docs/superpowers/specs/2026-09-21-m10-m16-open-source-product-roadmap-design.md`.

## Global Constraints

- Preserve World Pack → Descriptor → compiler → materialized World and the generic Pack-driven runtime.
- Translate application chrome; never translate stable Pack IDs or mutate Pack-authored content.
- Keep advanced authoring, import/export and diagnostics available but secondary.
- A new GM must reach the lobby and first scene without seeing Pack, Descriptor, revision, hash route or raw token terminology.

## Review Focus

- Saved GM state must resume the correct World and Session after reload.
- Locale detection, persistence and six-catalog parity must not expose missing keys.
- Primary actions must remain reachable at 375px without horizontal page overflow.
- M15 privacy and runtime browser acceptance must remain green after UI restructuring.
- Advanced authoring routes must remain reachable after removing them from the primary surface.

### Task 1: Typed localization and product home

**Files:** Create `apps/web/src/i18n/*`, `apps/web/src/product-home.tsx`; modify `apps/web/src/main.tsx`, `apps/web/src/style.css`, `apps/web/index.html`; test `tests/m16-localization.test.ts`.

- [x] Write and run failing locale parity/detection/persistence tests.
- [x] Implement six typed catalogs, locale runtime and switcher.
- [x] Implement home, saved game cards and secondary tools navigation.
- [x] Run focused tests, TypeScript and web build.

### Task 2: Guided campaign and player entry

**Files:** Modify `apps/web/src/lobby.tsx`, `apps/web/src/character-builder.tsx`, `apps/web/src/style.css`; test through the M16 browser gate.

- [x] Add visible setup/invite/play steps, clear disabled reasons and copyable invite URL.
- [x] Translate the campaign, PIN, player name, Character and readiness path.
- [x] Verify existing Session authorization and lifecycle behavior unchanged.

### Task 3: Task-oriented GM and player tables

**Files:** Create `apps/web/src/gm-workspace.ts`; modify `apps/web/src/game.tsx`, `apps/web/src/advanced-session.tsx`, `apps/web/src/style.css`; test `tests/m16-gm-workspace.test.ts` and browser acceptance.

- [x] Add Table, Checks, Encounter, Party and Journal workspaces with Table as default.
- [x] Keep scene/map/next action above the fold; move rehearsal, replay, canon and tokens into developer details.
- [x] Make pending player action the strongest surface and add mobile navigation.
- [x] Run M15 regression and responsive browser checks.

### Task 4: M16 acceptance evidence

**Files:** Create `scripts/m16-browser-acceptance.mjs`, `docs/M16_STATUS.md`; modify `docs/PROJECT_STATUS.md`.

- [ ] Exercise Home → game → setup → lobby → live table and player join in browser.
- [x] Exercise Russian and Japanese locale persistence and missing-key checks.
- [ ] Run full TypeScript, test, build and clean PostgreSQL browser gate.
- [x] Record delivered source, tests, runtime proof and the remaining real multiplayer release gate separately.
