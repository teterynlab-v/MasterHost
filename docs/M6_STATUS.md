# M6 Status — World Pack Creator accepted locally (2026-09-21)

**Milestone gate: passed with a new browser-authored setting.** A Creator built `masterhost.browser-cloud-gardens@0.1.0` through MasterHost UI, ran conformance, published the immutable version and generated the three-entity `The Blooming Expanse` World without editing YAML or code.

## Source

### M6.0 — visual Pack authoring

- A starter wizard creates a complete Pack-owned setting with identity, decision graph, generators, templates, traits, constraints, Character flow, rules/content, Art Set, terminology, theme and a deterministic fixture.
- Visual workspaces edit those structures and add decisions, tables, templates, traits, constraints, Character fields, Checks, Resources, Items and Actions. Image assets are size/type/checksum validated and previewed.
- Drafts use optimistic revisions in PostgreSQL. Published `(packId, version)` pairs are unique and immutable; a published Pack can only be continued by cloning a new draft version.

### M6.1 — source view

- The visual document has read-only JSON and YAML views and download endpoints. Both are derived from the same validated document used by the compiler.

### M6.2 — validation and conformance

- Validation covers schema shape, entry/default references, generators, templates and cycles, traits, constraints, dependency nodes and cycles, assets and Art Set mappings, Character starting state, rules, actors, locations and migration edges.
- Conformance runs every fixture twice through the existing Descriptor and generic compiler, checks deterministic output, expected kinds/entity counts, compiler constraints and exact published dependencies.
- Publishing and World generation repeat server-side validation. Browser validation exposed and blocked an incomplete custom Action during acceptance; the visual Action creator was corrected to emit a valid Pack-defined Check action and the gate was rerun to PASS.

### M6.3 — portable Pack versions

- `.mhpack` is a ZIP container with `pack.json`, `pack.yaml`, assets and an exact checksum manifest. Import rejects unsafe paths, oversize archives, missing or extra checksum entries, corrupt bytes and invalid documents, then creates an independent draft project.
- Dependencies pin exact Pack IDs and versions. Publish verifies that every dependency already exists in the same Realm as an immutable published version.

## Acceptance evidence

- TypeScript check: pass.
- Vitest: 24 files, 72 tests: pass.
- Vite production build: pass.
- `scripts/m6-acceptance.mjs`: on clean PostgreSQL, created a complete Pack and image asset, validated its fixture, published it, rejected mutation of the published version and generated a persistent World. After an actual server-process restart it reread the Pack and World, generated a second World, checked JSON/YAML, round-tripped `.mhpack` and cloned `0.2.0` as a draft.
- Browser gate: created `Cloud Gardens` with `sky-garden` and `floating-island` kinds, changed terminology and Art Set, added a table, template, trait, constraint, Check, Resource, Item and Action, saved revision 3, received fixture/conformance PASS, published immutable revision 5, generated `The Blooming Expanse`, and inspected the declarative YAML. The generated World contained the expected three entities and both custom kinds.

## Limits outside M6

- Realm creator identity, hosted tenant isolation, moderation, catalog discovery, signing and trust policy belong to M7.
- The local database stores image bytes directly and enforces a 2 MB per-asset and 10 MB archive limit; external object storage remains future work.
- Conformance proves the declared fixtures and generic compiler contract. It does not certify arbitrary third-party game design quality or malicious Pack isolation.
