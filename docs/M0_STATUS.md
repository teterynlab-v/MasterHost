# M0 Status — verified development baseline (2026-09-21)

`./scripts/m0-check.sh` passed on macOS. Both Fantasy and Cyberpunk passed authoring and ZIP import round-trip smoke on PostgreSQL. The browser opens saved Worlds, restores snapshots, forks Worlds, imports `.mhworld` ZIPs, and uploads/downloads World images. Asset-bearing archives preserve validated custom PNG, JPEG and WebP bytes through PostgreSQL. Entity image roles can now be assigned and rendered in the browser, and survive regeneration, snapshot/restore, fork and ZIP import. Full product acceptance remains open for clean-database/manual coverage. See `PROJECT_STATUS.md` and `WORLD_ASSET_PERSISTENCE_DECISION.md`.

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
- World image upload/download backed by digest-addressed PostgreSQL bytes and revisioned references; snapshot/restore, regeneration, fork and ZIP import preserve the image set.
- Per-entity image role assignment, detach and browser thumbnail rendering; assignment references are checked against the World image set and preserved by materialization path across regeneration.
- 100-seed conformance tests.
- macOS M0 check script and browser acceptance checklist.

## Gate remaining

The Fantasy browser generated a World, snapshotted, regenerated, restored, forked, reopened and imported it; Cyberpunk used the same controls for generation, restore and fork. A later Fantasy browser uploaded a PNG, saw its new revision and download link, then reloaded to find the image still present. For this slice, the Fantasy browser attached an existing World image to an entity, showed its 1×1 thumbnail, and retained it after reload. Both Packs passed PostgreSQL image assignment/lifecycle smokes including byte readback after ZIP import; the 55-test suite, TypeScript check and web build passed. A stale authoring save was rejected after an image upload. The remaining gate is a complete clean-database/manual acceptance pass; these browser checks used an existing development database.
