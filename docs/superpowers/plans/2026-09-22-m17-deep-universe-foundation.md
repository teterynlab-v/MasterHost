# M17 Deep Universe Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver the versioned Deep Universe Standard, automated quality assessment, Campaign Kit contract, twelve-entry universe catalog and previews, and Pack Creator completeness tooling without adding setting-specific runtime branches.

**Architecture:** Deep universe metadata is declarative Pack data owned by `@masterhost/worldpack-sdk`. The SDK validates structure and semantic completeness; the server exposes catalog and project assessment APIs; the web app renders generic catalog, preview, and authoring surfaces. Catalog entries advertise the M18–M29 roadmap and become playable only when a conforming exact Pack version is available.

**Tech Stack:** TypeScript 5, Zod 4, React 19, Fastify 5, Vitest 3, pnpm workspace, PostgreSQL-backed Pack projects.

**Spec:** `docs/superpowers/specs/2026-09-22-deep-universe-collection-design.md`

## Global Constraints

- Preserve World Pack → Descriptor → Compiler → materialized World.
- Keep the server, compiler, and web runtime free of universe IDs and setting-specific branches.
- Existing Pack documents remain valid when `universe` is absent.
- Drafts may be incomplete; preview/publication quality assessment returns structured diagnostics.
- No automatic short-text composer, executable Pack code, machine-translation publication, deployment, or public release.
- Every new production behavior begins with a failing test.

## Review Focus

- Schema compatibility for old Pack projects and strict validation for new deep-universe metadata.
- Reference integrity across patterns, Campaign Kits, content, game-loop rules, locales, and Play Today.
- Honest availability: planned catalog entries cannot launch; playable entries must have a passing quality report and exact Pack identity.
- Actionable diagnostics with stable code, path, and affected content identity.
- Generic UI and API behavior across all twelve catalog entries; no universe-name conditionals.

## Interfaces

### Deep universe model

Create `packages/worldpack-sdk/src/deep-universe.ts` exporting:

```ts
export const deepUniverseMinimums = {
  patterns: 3, campaignKits: 3, factions: 8, locations: 12,
  npcs: 24, adversaries: 18, items: 24, events: 30,
  scenes: 18, archetypes: 8, progressionPaths: 6, visualThemes: 3,
} as const;

export type DeepContentKind = keyof Omit<typeof deepUniverseMinimums, "patterns" | "campaignKits">;

export interface DeepUniverseProfile {
  schemaVersion: "1";
  id: string;
  genres: string[];
  tones: string[];
  complexity: "beginner" | "intermediate" | "advanced";
  recommendedPlayers: { min: number; max: number };
  gameLoop: Array<{ id: string; label: string; ruleRefs: string[] }>;
  patterns: Array<{ id: string; name: string; summary: string; capabilityRefs: string[] }>;
  campaignKits: CampaignKit[];
  content: Record<DeepContentKind, DeepUniverseContentEntry[]>;
  playToday: { patternId: string; campaignKitId: string; visualThemeId: string };
  localization: { sourceLocale: string; supportedLocales: string[]; strings: Record<string, Record<string, string>> };
}

export interface CampaignKit {
  id: string;
  name: string;
  summary: string;
  durationMinutes: { min: number; max: number };
  playerCount: { min: number; max: number };
  patternIds: string[];
  requiredCapabilities: string[];
  openingSceneId: string;
  sceneIds: string[];
  npcIds: string[];
  locationIds: string[];
  rewardIds: string[];
  gmGuidance: string[];
  readyCharacterIds: string[];
}

export interface DeepUniverseContentEntry {
  id: string;
  name: string;
  description: string;
  patternIds: string[];
  relations: Array<{ type: string; targetId: string }>;
  localeKey: string;
  media: Array<{ role: "map" | "background" | "portrait" | "token" | "item" | "ui"; asset: string; alt: string }>;
}

export interface DeepUniverseAssessment {
  standardVersion: "1";
  passed: boolean;
  counts: Record<string, { actual: number; required: number }>;
  diagnostics: PackDiagnostic[];
}
```

`WorldPackDocument` gains optional `universe?: DeepUniverseProfile`. `WorldPackDocumentSchema` imports the schema and remains backward compatible.

### Catalog model

Create `universe-catalog/catalog.json` and SDK loader/schema with twelve entries:

```ts
interface UniverseCatalogEntry {
  id: string;
  name: string;
  summary: string;
  genres: string[];
  tones: string[];
  complexity: "beginner" | "intermediate" | "advanced";
  recommendedPlayers: { min: number; max: number };
  gameLoop: string[];
  patterns: Array<{ id: string; name: string; summary: string }>;
  targetPack: { id: string; version: string };
}

interface UniverseCatalogItem extends UniverseCatalogEntry {
  availability: "planned" | "ready";
  assessment?: DeepUniverseAssessment;
  playToday?: DeepUniverseProfile["playToday"];
}
```

The server computes readiness from exact installed or project Pack documents. Catalog JSON never claims runtime availability by itself.

## Task 1: Deep Universe schemas and assessment

**Files:**
- Create: `packages/worldpack-sdk/src/deep-universe.ts`
- Create: `packages/worldpack-sdk/src/deep-universe.test.ts`
- Modify: `packages/worldpack-sdk/src/authoring.ts`
- Modify: `packages/worldpack-sdk/src/index.ts`

- [ ] Write tests that build a complete profile at every minimum and assert parsing plus `passed: true`; remove one faction and expect `deep-universe.minimum` at `universe.content.factions`; add a dangling Campaign Kit scene and expect `deep-universe.reference`; insert `TODO` copy and expect `deep-universe.copy`; remove a relation from a required faction and expect `deep-universe.disconnected`; reference a missing action in a game-loop step and expect `deep-universe.rule`; remove Russian locale text and expect `deep-universe.locale`; omit `universe` from a legacy Pack and expect existing validation to remain valid.
- [ ] Run `pnpm vitest run packages/worldpack-sdk/src/deep-universe.test.ts`; expected: failures because schemas and assessor are absent.
- [ ] Implement strict Zod schemas, `assessDeepUniverse(document)`, stable diagnostics, minimum counts, text checks, reference checks, relationship coverage, Pack-rule checks, media role/alt/license checks, Play Today checks, Character creation/progression checks, and locale coverage. Warnings cover repeated descriptions; errors block conformance.
- [ ] Export the public API and add optional `universe` to `WorldPackDocumentSchema`.
- [ ] Re-run the focused test and `pnpm typecheck`; expected: all pass.
- [ ] Commit: `Implement M17 deep universe standard`.

## Task 2: Twelve-entry catalog and readiness resolver

**Files:**
- Create: `universe-catalog/catalog.json`
- Create: `packages/worldpack-sdk/src/universe-catalog.ts`
- Create: `packages/worldpack-sdk/src/universe-catalog.test.ts`
- Modify: `packages/worldpack-sdk/src/index.ts`

- [ ] Write tests that load exactly twelve unique entries, assert the approved pattern names and primary loops, reject duplicate IDs/pattern IDs, and verify that readiness remains `planned` without an exact passing Pack, remains `planned` for a failing profile, and becomes `ready` only for a matching exact Pack with a passing assessment.
- [ ] Run the focused test; expected: failure because loader and resolver are absent.
- [ ] Implement the strict catalog schema, filesystem loader, and pure `resolveUniverseCatalog(entries, documents)` function. Put the approved original names, summaries, loops, pattern summaries, player ranges, complexity, tones, and exact target Pack identities in JSON.
- [ ] Re-run focused tests and `pnpm typecheck`; expected: all pass.
- [ ] Commit: `Add M17 universe catalog contracts`.

## Task 3: Server catalog and Pack conformance APIs

**Files:**
- Create: `apps/server/src/universe-catalog.ts`
- Create: `apps/server/src/universe-catalog.test.ts`
- Modify: `apps/server/src/index.ts`

- [ ] Write injection tests for `GET /api/universes`, `GET /api/universes/:id`, `GET /api/pack-projects/:id/deep-universe`, and validation/publication behavior. Prove realm isolation, 404 for unknown entries, planned readiness without a valid exact Pack, and structured deep-universe errors from a draft.
- [ ] Run the focused server test; expected: route-not-found failures.
- [ ] Implement a route plugin that loads the catalog once, resolves exact bundled/published/project documents for the request Realm, returns summaries and detail, and never mutates Packs. Extend Pack conformance so a present `universe` profile must pass before publication.
- [ ] Re-run focused tests and server tests; expected: all pass.
- [ ] Commit: `Expose M17 universe catalog and quality API`.

## Task 4: Universe catalog, detail preview, and Play Today handoff

**Files:**
- Create: `apps/web/src/universe-catalog.tsx`
- Create: `apps/web/src/universe-catalog.test.tsx`
- Modify: `apps/web/src/main.tsx`
- Modify: `apps/web/src/product-home.tsx`
- Modify: `apps/web/src/quick-game-builder.tsx`
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/src/i18n.tsx`

- [ ] Write component tests proving twelve cards render from API data, filters are generic, preview exposes loop/patterns/player count/complexity, planned cards cannot launch, a ready card’s Play Today action hands exact Pack/pattern/kit/theme identities to Quick Builder, and no preview creates a World.
- [ ] Run the focused web test; expected: import/component failure.
- [ ] Implement responsive catalog and detail views. Change Create Game entry points to open `#universes`. Keep Advanced authoring accessible. Add a typed session handoff consumed once by Quick Builder; selections remain visible and editable before creation.
- [ ] Add English, Russian, Spanish, Japanese, Simplified Chinese, and Korean UI keys with flexible layout.
- [ ] Re-run focused tests, web tests, and `pnpm typecheck`; expected: all pass.
- [ ] Commit: `Build M17 universe catalog experience`.

## Task 5: Pack Creator completeness dashboard and Campaign Kit preview

**Files:**
- Create: `apps/web/src/deep-universe-dashboard.tsx`
- Create: `apps/web/src/deep-universe-dashboard.test.tsx`
- Modify: `apps/web/src/pack-creator.tsx`
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/src/i18n.tsx`

- [ ] Write tests for count progress, blocking diagnostic links, pattern/content filtering, relationship graph summaries, locale coverage, and Campaign Kit preview. Prove that incomplete draft data can be saved while Preview/Publish remains blocked by errors.
- [ ] Run the focused test; expected: component missing.
- [ ] Implement the dashboard using the assessment API and the current draft document. Add client-only filters and accessible relationship summaries; preview shows exact scenes, cast, locations, rewards, duration, players, and GM guidance. Keep raw source editing as the authoritative edit path for M17.
- [ ] Re-run focused tests and `pnpm typecheck`; expected: all pass.
- [ ] Commit: `Add M17 Pack Creator quality dashboard`.

## Task 6: M17 acceptance, evidence, and status

**Files:**
- Create: `scripts/m17-acceptance.mjs`
- Create: `docs/M17_STATUS.md`
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `docs/DEVELOPMENT_PLAN.md`

- [ ] Write an acceptance script that verifies schema negatives, twelve catalog entries, readiness truthfulness, API detail and assessment, browser catalog/preview/planned disablement, a temporary complete Pack project becoming ready, Play Today exact handoff, Pack Creator diagnostics, and legacy Pack compatibility.
- [ ] Run `pnpm test`, `pnpm typecheck`, and the production web/server build commands; expected: green.
- [ ] Run clean PostgreSQL/API/browser acceptance through the repository’s existing Compose and Playwright/CDP conventions; capture commands, counts, exact commit, observed browser path, and limitations in `docs/M17_STATUS.md`.
- [ ] Update project and development status only from observed evidence. Mark M17 complete only if every automated gate passes; list human editorial review and M18 content delivery separately.
- [ ] Commit: `Complete M17 deep universe foundation`.

## Final Review

- [ ] Generate the whole milestone review package from the commit before Task 1 through HEAD.
- [ ] Request a fresh reviewer to assess the complete M17 change against this plan, the approved spec, and Review Focus.
- [ ] Re-grade findings by user effect; fix Critical and Important findings with new RED→GREEN tests in one pass; record deferred Minor findings and rulings.
- [ ] Re-run `pnpm test`, `pnpm typecheck`, M17 acceptance, clean PostgreSQL, and browser acceptance after fixes.
- [ ] Commit review fixes and documentation evidence, then report M17 only when the gate is genuinely closed.
