# M0 Status — verified development baseline (2026-09-20)

`./scripts/m0-check.sh` passed on macOS. Both Fantasy and Cyberpunk passed authoring and ZIP import round-trip smoke on PostgreSQL and generated through the same browser UI. Asset-bearing archives are rejected until custom asset storage is implemented. Full product acceptance remains open for complete clean-database/manual browser coverage. See `PROJECT_STATUS.md`.

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

The remaining gate is the complete browser import/restore/fork flow, custom asset persistence, and validation on a clean database. Static checks and the two-Pack authoring smoke passed on this machine.
