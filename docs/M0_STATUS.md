# M0 Status — verified development baseline (2026-09-20)

`./scripts/m0-check.sh` passed on macOS. Both Fantasy and Cyberpunk passed `scripts/m0-runtime-smoke.mjs` on PostgreSQL and generated through the same browser UI. Full product acceptance remains open for import and complete clean-database/manual browser coverage. See `PROJECT_STATUS.md`.

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
- 100-seed conformance tests.
- macOS M0 check script and browser acceptance checklist.

## Gate remaining

The remaining gate is the complete browser import/restore/fork flow and validation on a clean database. Static checks and the two-Pack runtime smoke passed on this machine.
