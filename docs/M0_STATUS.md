# M0 Status — verified development baseline (2026-09-20)

`./scripts/m0-check.sh` passed on macOS. Both Fantasy and Cyberpunk passed authoring and ZIP import round-trip smoke on PostgreSQL. The browser now opens saved Worlds, lists snapshots, restores a snapshot as a new revision, forks a World, and imports a `.mhworld` ZIP through the same Pack-driven UI. Asset-bearing archives are rejected until custom asset storage is implemented. Full product acceptance remains open for clean-database/manual coverage and custom assets. See `PROJECT_STATUS.md`.

## Implemented in code

- Dynamic Descriptor and generic Template DSL.
- Conditions, parameters, context propagation, traits.
- Deterministic path-based generation.
- Stable materialization identity.
- Fantasy + Cyberpunk generic compilation.
- Relations, constraints, retry and targeted repair baseline.
- Dependency DAG diagnostics.
- Provenance and Explainability.
- Generation Report.
- Regeneration preview/impact and CUSTOM/LOCK preservation.
- Autosave/revision/snapshot/fork foundations.
- PostgreSQL revision and relation persistence structures.
- Real ZIP `.mhworld` export with checksums and embedded asset support.
- Asset resolver, Art Set model, and built-in standard SVG test artwork for both settings.
- Server endpoints for report/explain/scope/regeneration preview.
- UI for Generation Report, Why?, regeneration preview, snapshot/regenerate, export.
- UI for Pack-compatible saved World selection and search by name or ID, snapshot restore, fork, and ZIP import; browser reload retains the selected World.
- 100-seed conformance tests.
- macOS M0 check script and browser acceptance checklist.

## Gate remaining

The Fantasy browser generated a World, created a manual snapshot, regenerated it to revision 2, restored the manual snapshot to revision 3, forked it into an independent World, reopened the fork after a page reload, and imported an exported ZIP into another independent World. The import used a local ZIP fetched from the export endpoint and the browser file picker; the original and imported World IDs differed. The Cyberpunk browser generated a World, restored a snapshot to revision 3 and forked it through the same controls. Both Packs passed the PostgreSQL authoring/ZIP smoke; the full suite (54 tests), TypeScript check, and web build passed. The remaining gate is custom asset persistence and a complete clean-database/manual acceptance pass; these browser checks used an existing development database.
