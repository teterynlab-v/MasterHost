# M16 Release Engineering Plan

**Goal:** make MasterHost installable, diagnosable, recoverable and distributable as a local-first open-source product.

## Acceptance slice

- [x] One `docker compose up --build -d` starts PostgreSQL, the API and the browser product.
- [x] Browser/API traffic and WebSockets use one public origin.
- [x] A clean named Compose project creates durable data and survives restart.
- [x] Backup and destructive restore are documented, validated and exercised against real PostgreSQL.
- [x] Diagnostics report container, database, API and browser health without exposing secrets.
- [x] A release archive excludes local state and includes checksums, license inventory and operator docs.
- [x] Automated accessibility/responsive checks cover the public home and primary controls.
- [x] README, GM/player guide, operations guide and migration policy describe the verified workflow.
- [x] TypeScript, tests, production build, M15 regression and M16 release gate pass.

## Limits

The real three-to-four-hour multiplayer game and public release publication remain separate final M16 gates.
