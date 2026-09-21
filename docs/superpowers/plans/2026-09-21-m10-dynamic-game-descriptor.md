# M10 Dynamic Game Descriptor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a GM explicitly select compatible Descriptor fragments, configure their parameters, preview the resulting Pack, compile a persistent World and safely recompose it after selections change.

**Architecture:** `@masterhost/descriptor` receives a pure fragment composer that applies validated, parameterized patch operations to a complete base `WorldPackDocument`. PostgreSQL stores the current GM selection project plus immutable composed revisions so existing Worlds can always resolve the exact Pack version they were compiled with. New API and browser flows expose selection, diagnostics, preview, compilation and recomposition while the existing World Compiler and generic runtime remain unchanged.

**Tech Stack:** TypeScript, Zod 4, Fastify, PostgreSQL 17 via `postgres`, React 19, Vite, Vitest, headless Chrome CDP.

**Spec:** `docs/superpowers/specs/2026-09-21-m10-m16-open-source-product-roadmap-design.md`

## Global Constraints

- The GM selects fragments through UI; natural-language or AI composition is excluded.
- Preserve World Pack → Descriptor → Compiler → materialized World → generic runtime.
- The same base Pack, ordered selections, parameters, decisions and seed must produce the same materialized paths and values.
- Fragment composition must not permit prototype keys, arbitrary filesystem access or setting-specific application branches.
- Published composed revisions are immutable; existing Worlds must resolve their exact historical revision after project edits and process restarts.
- PostgreSQL, a clean database, actual process restart and an exercised browser path are required for the M10 gate.
- Recomposition must preserve CUSTOM values and LOCK state by stable materialization path.
- A milestone is reported complete only after its entire acceptance gate passes.

## Review Focus

- A fragment JSON Pointer containing `__proto__`, `prototype` or `constructor` must be rejected before traversal; Task 1 pins this with a hostile patch test.
- Two selected fragments writing the same object key must produce a diagnostic rather than depend on selection order; Task 1 pins this with an overlapping-write test.
- Missing, unknown and wrongly typed parameters must fail before Pack validation; Task 1 pins all three cases.
- Updating a project must not make an already materialized World impossible to regenerate; Tasks 3 and 4 pin immutable revision lookup after an update and restart.
- A stale browser save must receive `409` and preserve the current project; Tasks 3 and 6 pin optimistic concurrency through repository and live API tests.

---

### Task 1: Pure Descriptor Fragment Composer

**Files:**
- Create: `packages/descriptor/src/composition.ts`
- Modify: `packages/descriptor/src/index.ts`
- Modify: `packages/descriptor/package.json`
- Create: `tests/m10-descriptor-composition.test.ts`

**Interfaces:**
- Consumes: `WorldPackDocument` and `WorldPackDocumentSchema` from `@masterhost/worldpack-sdk`.
- Produces: `GameDescriptorFragment`, `GameFragmentSelection`, `CompositionDiagnostic`, `CompositionReport`, `composeGameDescriptor(input)` and `validateFragmentSelection(fragment, selection)`.

- [ ] **Step 1: Write the failing composition tests**

Create tests that build a starter Pack, select two fragments and assert parameter replacement, capability resolution, deterministic output and actionable diagnostics:

```ts
import { describe, expect, it } from "vitest";
import { createStarterPack } from "@masterhost/worldpack-sdk";
import { composeGameDescriptor, type GameDescriptorFragment } from "@masterhost/descriptor";

const base = () => createStarterPack({
  realmId: "00000000-0000-4000-a000-000000000010",
  id: "masterhost.m10-base",
  name: "M10 Base",
}).document;

const location: GameDescriptorFragment = {
  id: "masterhost.fragment.observatory",
  version: "1.0.0",
  name: "Ancient Observatory",
  provides: ["location:observatory"],
  requires: [],
  conflicts: [],
  parameters: { danger: { type: "number", required: true, min: 1, max: 5 } },
  patches: [
    { op: "set", path: "/content/templates/location.observatory", value: { kind: "location", values: { name: { value: "Ancient Observatory" }, danger: { value: { $parameter: "danger" } } } } },
    { op: "merge", path: "/content/templates/world.root/components", value: { observatory: { template: "location.observatory" } } },
  ],
};

it("composes the same Pack from the same ordered selections", () => {
  const input = { projectId: "game-one", revision: 3, name: "Game One", base: base(), fragments: [location], selections: [{ fragmentId: location.id, version: location.version, parameters: { danger: 4 } }] };
  const first = composeGameDescriptor(input);
  const second = composeGameDescriptor(input);
  expect(first.report.valid).toBe(true);
  expect(first.document).toEqual(second.document);
  expect(first.document.content.templates["location.observatory"].values?.danger).toEqual({ value: 4 });
  expect(first.document.manifest).toMatchObject({ id: "masterhost.game.game-one", version: "0.1.3", name: "Game One" });
});
```

Add cases for a missing required capability, an explicit conflict, duplicate writes, unknown parameter, wrong parameter type, missing required parameter, and each forbidden path segment.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm exec -- vitest run tests/m10-descriptor-composition.test.ts`

Expected: FAIL because `composeGameDescriptor` and the fragment types do not exist.

- [ ] **Step 3: Implement the fragment model and composer**

Define these public shapes in `composition.ts`:

```ts
export type FragmentParameter =
  | { type: "string"; required?: boolean; default?: string; options?: string[] }
  | { type: "number"; required?: boolean; default?: number; min?: number; max?: number }
  | { type: "boolean"; required?: boolean; default?: boolean };

export type FragmentValue = unknown;
export interface FragmentPatch { op: "set" | "merge" | "append"; path: string; value: FragmentValue }
export interface GameDescriptorFragment {
  id: string;
  version: string;
  name: string;
  description?: string;
  provides: string[];
  requires: string[];
  conflicts: string[];
  parameters: Record<string, FragmentParameter>;
  patches: FragmentPatch[];
}
export interface GameFragmentSelection { fragmentId: string; version: string; parameters: Record<string, string | number | boolean> }
export interface CompositionDiagnostic { code: "fragment" | "version" | "parameter" | "capability" | "conflict" | "path" | "write-conflict" | "pack"; path: string; message: string }
export interface CompositionReport { valid: boolean; diagnostics: CompositionDiagnostic[]; selected: { id: string; version: string }[]; providedCapabilities: string[]; writes: string[] }
```

Implement `composeGameDescriptor` with this exact sequence:

1. Match every ordered selection by exact fragment ID and version.
2. Validate supplied parameter names and scalar types; apply defaults; enforce string options and numeric bounds.
3. Resolve `{ $parameter: "name" }` recursively without interpreting ordinary strings.
4. Parse RFC 6901 JSON Pointer paths, decode `~0` and `~1`, and reject empty interior segments plus `__proto__`, `prototype`, or `constructor` before traversal. Dotted IDs such as `world.root` remain one pointer segment.
5. Allow patch roots only under `content`, `artSets`, `terminology`, and `theme`.
6. Treat `set` as requiring an absent target, `merge` as adding previously absent object keys, and `append` as appending to an array. Record every concrete written path and reject overlaps across fragments.
7. Resolve `requires` against the union of selected `provides`; treat conflicts as either fragment IDs or provided capability names.
8. Set the output manifest ID to `masterhost.game.<projectId>`, version to `0.1.<revision>`, name to the project name, `official` to false and publisher to `MasterHost Game Builder`.
9. Validate the final value with `WorldPackDocumentSchema.safeParse` and convert every Zod issue into a `pack` diagnostic.
10. Return a deep-cloned document and a stable report; never mutate the base or fragments.

Export the new module from `packages/descriptor/src/index.ts` and add `@masterhost/worldpack-sdk` plus `zod` to `packages/descriptor/package.json`.

- [ ] **Step 4: Run focused and regression tests**

Run: `npm exec -- vitest run tests/m10-descriptor-composition.test.ts tests/worldpack.test.ts tests/compiler.test.ts tests/cross-setting.test.ts`

Expected: all tests PASS.

- [ ] **Step 5: Commit the pure composition boundary**

```bash
git add packages/descriptor tests/m10-descriptor-composition.test.ts
git commit -m "Add dynamic Descriptor fragment composition"
```

---

### Task 2: Built-in Fragment Registry and Preview Metadata

**Files:**
- Create: `game-assets/fragments/classic-observatory.json`
- Create: `game-assets/fragments/classic-fortune.json`
- Create: `packages/descriptor/src/fragment-registry.ts`
- Modify: `packages/descriptor/src/index.ts`
- Create: `tests/m10-fragment-registry.test.ts`

**Interfaces:**
- Consumes: `GameDescriptorFragment` and the JSON Pointer guard from the Task 1 composition module.
- Produces: `FragmentCatalogEntry`, `validateGameDescriptorFragment(input)`, `loadFragmentRegistry(root)` and `fragmentCatalog(fragments)`.

- [ ] **Step 1: Write failing registry tests**

Test loading the two JSON files, stable sorting by name then ID, complete preview metadata and rejection of duplicate `id@version`, invalid IDs, unsafe patch paths, unsupported parameter definitions and an unresolvable parameter reference.

```ts
const fragments = await loadFragmentRegistry(resolve("game-assets/fragments"));
expect(fragments.map(value => value.id)).toEqual([
  "masterhost.fragment.fortune",
  "masterhost.fragment.observatory",
]);
expect(fragmentCatalog(fragments)[0]).toMatchObject({
  version: "1.0.0",
  parameterCount: expect.any(Number),
  provides: expect.any(Array),
});
```

- [ ] **Step 2: Run the registry test and verify failure**

Run: `npm exec -- vitest run tests/m10-fragment-registry.test.ts`

Expected: FAIL because the loader does not exist.

- [ ] **Step 3: Implement strict registry validation**

Use Zod to validate metadata, scalar parameter definitions and patch operations. Reuse the path guard exported from Task 1. Recursively collect `$parameter` references and require each to exist in the fragment's parameter map. Limit each fragment to 100 patches and each serialized patch value to 256 KiB. Return catalog entries without patch bodies:

```ts
export interface FragmentCatalogEntry {
  id: string;
  version: string;
  name: string;
  description?: string;
  provides: string[];
  requires: string[];
  conflicts: string[];
  parameters: GameDescriptorFragment["parameters"];
  parameterCount: number;
}
```

The Observatory fragment adds one location template and attaches it to the base root. The Fortune fragment adds a `luck` Resource, one Check and one Action through non-overlapping patches. Both files use original MasterHost text and no media.

- [ ] **Step 4: Run the focused tests and typecheck**

Run: `npm exec -- vitest run tests/m10-fragment-registry.test.ts tests/m10-descriptor-composition.test.ts && npm exec -- tsc --noEmit -p tsconfig.json`

Expected: PASS.

- [ ] **Step 5: Commit the registry**

```bash
git add game-assets/fragments packages/descriptor tests/m10-fragment-registry.test.ts
git commit -m "Add validated Descriptor fragment registry"
```

---

### Task 3: Persistent Game Descriptor Projects and Immutable Revisions

**Files:**
- Create: `packages/persistence/src/game-descriptor-repository.ts`
- Modify: `packages/persistence/src/index.ts`
- Create: `tests/m10-game-descriptor-repository.test.ts`

**Interfaces:**
- Consumes: `GameFragmentSelection`, `CompositionReport`, `WorldPackDocument`.
- Produces: `GameDescriptorProject`, `GameDescriptorRevision`, and `GameDescriptorRepository` with `migrate`, `create`, `get`, `list`, `save`, `revision`, `resolvePack`, and `close`.

- [ ] **Step 1: Write the repository contract test**

Run the test only when `TEST_DATABASE_URL` is present. Cover create/read, list isolation by Realm, optimistic update, stale update rejection, immutable revision readback and resolving both old and new composed Pack versions after the update.

```ts
const created = await repository.create(projectAtRevision(1));
const updated = await repository.save(projectAtRevision(2), 1);
await expect(repository.save(projectAtRevision(3), 1)).rejects.toMatchObject({ statusCode: 409 });
expect((await repository.resolvePack(created.compiled.manifest.id, created.compiled.manifest.version))?.manifest.version).toBe("0.1.1");
expect((await repository.resolvePack(updated.compiled.manifest.id, updated.compiled.manifest.version))?.manifest.version).toBe("0.1.2");
```

- [ ] **Step 2: Run against a temporary PostgreSQL container and verify failure**

Run:

```bash
docker run --rm --name masterhost-m10-repository -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=masterhost -p 55450:5432 -d postgres:17-alpine
TEST_DATABASE_URL=postgresql://postgres:masterhost@127.0.0.1:55450/masterhost npm exec -- vitest run tests/m10-game-descriptor-repository.test.ts
docker rm -f masterhost-m10-repository
```

Expected: FAIL because the repository does not exist.

- [ ] **Step 3: Implement transactional persistence**

Create:

```sql
create table if not exists game_descriptor_projects(
  id uuid primary key,
  realm_id uuid not null,
  revision int not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists game_descriptor_revisions(
  project_id uuid not null,
  revision int not null,
  pack_id text not null,
  pack_version text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key(project_id, revision),
  unique(pack_id, pack_version)
);
```

`create` inserts the current project and revision in one transaction. `save(project, expectedRevision)` locks the current row, requires an exact revision match, requires `project.revision === expectedRevision + 1`, then updates current data and inserts the immutable revision in one transaction. `resolvePack(packId, packVersion)` reads the revision and returns `toLoadedWorldPack(revision.compiled)`.

- [ ] **Step 4: Run repository, full unit tests and typecheck**

Run the PostgreSQL command from Step 2 again, then run `npm exec -- vitest run && npm exec -- tsc --noEmit -p tsconfig.json`.

Expected: repository test and all existing tests PASS.

- [ ] **Step 5: Commit persistence**

```bash
git add packages/persistence tests/m10-game-descriptor-repository.test.ts
git commit -m "Persist dynamic game Descriptor revisions"
```

---

### Task 4: Descriptor Project API, World Compilation and Recomposing

**Files:**
- Create: `apps/server/src/game-descriptors.ts`
- Modify: `apps/server/src/index.ts`
- Create: `scripts/m10-acceptance.mjs`

**Interfaces:**
- Consumes: fragment registry, `composeGameDescriptor`, `GameDescriptorRepository`, `WorldRepository`, `compileSatisfying`, `compareWorlds`, and `preserveCustomByPath`.
- Produces: `/api/game-fragments`, `/api/game-descriptors`, project preview/update/compile routes, and World recomposition routes.

- [ ] **Step 1: Write the failing live API acceptance phase**

The create phase must:

1. Create a Realm and creator identity.
2. `GET /api/game-fragments` and select Observatory plus Fortune.
3. `POST /api/game-descriptors` with a name, exact base Pack identity, seed, ordered selections, parameters, decisions and locks.
4. Assert preview diagnostics are empty and the report lists both capabilities.
5. Compile twice with the same project revision and assert equal materialization paths and values.
6. Customize and lock one generated World value.
7. Update the project with `expectedRevision: 1`, then assert a second update from revision 1 returns `409`.
8. Preview and apply recomposition to the customized World.
9. Assert the custom value and lock remain while the World points to composed Pack version `0.1.2`.
10. Store IDs and versions for restart verification.

The verify phase must resolve the project, both immutable composed revisions and the recomposed World after an actual server restart.

- [ ] **Step 2: Start a clean server and verify the acceptance script fails**

Use PostgreSQL 17 on port `55451`, server port `8141`, `WORLD_PACK_PATH=worldpacks/classic-fantasy-test`, and `M10_STATE_FILE` in `/tmp`. Expected failure: `/api/game-fragments` returns 404.

- [ ] **Step 3: Implement route registration and historical Pack resolution**

Create `registerGameDescriptors(app, dependencies)` and register it before runtime routes. Enforce owner/creator role through the existing Realm role hook.

Routes:

```text
GET    /api/game-fragments
GET    /api/game-descriptors
POST   /api/game-descriptors
GET    /api/game-descriptors/:id
PUT    /api/game-descriptors/:id
POST   /api/game-descriptors/:id/preview
POST   /api/game-descriptors/:id/compile
POST   /api/game-descriptors/:id/worlds/:worldId/recompose/preview
POST   /api/game-descriptors/:id/worlds/:worldId/recompose
```

Creation and update must compose and validate before persistence. Preview never writes. Compile uses the immutable current composed revision and writes the World with reason `game-descriptor:<id>@<revision>`. Recompose requires that the World originated from the same project ID recorded in `WorldDescriptor.composition`, snapshots before mutation, compiles against the current composed revision, calls `preserveCustomByPath`, copies existing assets and timestamps, advances the World revision and saves atomically through `WorldRepository`.

Extend `WorldDescriptor` with optional metadata:

```ts
composition?: {
  projectId: string;
  revision: number;
  selections: { fragmentId: string; version: string; parameters: Record<string, string | number | boolean> }[];
};
```

Update `packForWorld` to try built-in Pack, published Pack project, then `GameDescriptorRepository.resolvePack`. This preserves historical regeneration.

- [ ] **Step 4: Run create, restart and verify phases**

Run the live script, stop the server process, start a new server process against the same database and run with `M10_PHASE=verify`. Expected: both phases PASS and the stale update remains rejected.

- [ ] **Step 5: Run source checks and commit the API slice**

Run: `npm exec -- tsc --noEmit -p tsconfig.json && npm exec -- vitest run && git diff --check`

Then:

```bash
git add apps/server packages/domain scripts/m10-acceptance.mjs
git commit -m "Expose persistent dynamic game Descriptors"
```

---

### Task 5: GM Dynamic Game Builder UI

**Files:**
- Create: `apps/web/src/game-descriptor-builder.tsx`
- Modify: `apps/web/src/main.tsx`
- Modify: `apps/web/src/style.css`
- Create: `scripts/m10-browser-acceptance.mjs`

**Interfaces:**
- Consumes: the Task 4 JSON API and existing Realm-aware request function.
- Produces: a `#game-builder` browser route with project creation, selection, parameter editing, preview diagnostics and World compilation.

- [ ] **Step 1: Write the headless browser acceptance script**

Follow the repository's dependency-free CDP pattern from `scripts/m9-browser-acceptance.mjs`. The script must:

1. Open `#game-builder` in a Realm with creator authorization seeded into session storage.
2. Create `The Observatory Test`.
3. Select the Observatory and Fortune fragments from rendered cards.
4. Set Observatory danger to `4`.
5. Preview and assert `VALID`, both provided capabilities and the generated Pack version.
6. Compile and assert the UI opens the materialized World with generation report.
7. Reload and assert the project and selections are restored.
8. Collect Runtime exceptions, `console.error`, and non-favicon HTTP responses with status 400 or higher; require none.

- [ ] **Step 2: Run the browser script and verify failure**

Start the Task 4 server plus Vite with `VITE_API_URL` and `VITE_WS_URL`, then execute the browser script. Expected: FAIL because the `#game-builder` route is absent.

- [ ] **Step 3: Implement the builder as focused panels**

`game-descriptor-builder.tsx` must expose:

- project name, deterministic seed and base Pack summary;
- searchable fragment cards with description, provides, requires and conflicts;
- explicit add/remove controls;
- generated controls for string, numeric, boolean and option parameters;
- ordered selected-fragment summary;
- decision controls sourced from the active base Pack questions;
- Preview, Save and Compile actions;
- diagnostics grouped by code with their exact path;
- a compilation report with entity counts, kinds and composed Pack identity.

Use the current request helper and Realm authentication. Do not add setting-specific conditionals or a free-text game-generation field. Split UI helpers inside the new file only when each helper has a single responsibility; keep API mutations centralized in the top-level component.

- [ ] **Step 4: Run browser, build and type checks**

Run the headless browser flow, `npm exec -- tsc --noEmit -p tsconfig.json`, and `(cd apps/web && ../../node_modules/.bin/vite build)`.

Expected: browser acceptance, TypeScript and production build PASS.

- [ ] **Step 5: Commit the GM Builder**

```bash
git add apps/web scripts/m10-browser-acceptance.mjs
git commit -m "Add the dynamic game Descriptor builder"
```

---

### Task 6: Reproducible M10 Gate and Evidence

**Files:**
- Create: `scripts/m10-gate.sh`
- Create: `docs/M10_STATUS.md`
- Modify: `docs/PROJECT_STATUS.md`

**Interfaces:**
- Consumes: all M10 source, unit tests, live acceptance and browser acceptance.
- Produces: one repeatable milestone command and evidence-led status.

- [ ] **Step 1: Create the clean gate orchestrator**

Model process handling on the corrected M9 gate: use unique container and temporary file names, `exec` the Vite child, trap cleanup, and verify all processes are gone. Execute in order:

```text
tsc --noEmit
full Vitest suite
Vite production build
clean PostgreSQL 17 startup
server startup
M10 create/live acceptance
server process restart
M10 persistence verification
Vite startup
headless Chrome acceptance
cleanup
```

The script must accept port overrides through `M10_PG_PORT`, `M10_API_PORT`, `M10_WEB_PORT` and `M10_CDP_PORT`.

- [ ] **Step 2: Run the complete gate from a clean worktree state**

Run: `./scripts/m10-gate.sh`

Expected: one final line reporting source checks, clean PostgreSQL acceptance, restart readback and browser acceptance as passed.

- [ ] **Step 3: Record source, tests, runtime proof and limits separately**

`docs/M10_STATUS.md` must include:

- delivered fragment composition and project persistence;
- exact test totals from the final run;
- clean PostgreSQL and restart evidence;
- browser actions that were actually exercised;
- remaining limits assigned to M11–M16, including the small temporary fragment catalog and absence of `.mhgame` before M14.

Update `docs/PROJECT_STATUS.md` with one concise M10 evidence entry and a canonical M10 section. Do not claim M11 asset depth, M14 portability or the final real-game gate.

- [ ] **Step 4: Run final integrity checks**

Run:

```bash
./scripts/m10-gate.sh
git diff --check
git status --short
```

Expected: gate PASS, no whitespace errors, and only intended M10 files modified.

- [ ] **Step 5: Request independent review and commit the complete milestone**

Review the full diff against the M10 spec, with special attention to fragment path safety, write conflicts, Realm isolation, immutable revision resolution, stale updates, CUSTOM/LOCK preservation and browser cleanup. Fix every Critical or Important finding, rerun the complete gate, then commit:

```bash
git add scripts/m10-gate.sh docs/M10_STATUS.md docs/PROJECT_STATUS.md
git commit -m "Complete canonical M10 dynamic game Descriptor"
```
