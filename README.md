# MasterHost

MasterHost is a self-hostable tabletop RPG world engine and early playable runtime. A World Pack and GM choices produce a Descriptor; the compiler creates a persistent materialized World. Campaigns and Sessions connect that World to guest players through a short-lived PIN. Pack data defines characters, checks, resources, effects, actions and encounter ordering.

## Local development

Requires Node.js 22+, Docker, and Corepack or npm. The repository pins pnpm 10.17.1. On this macOS machine Corepack is unavailable; `scripts/m0-check.sh` automatically uses the pinned pnpm through npm.

```bash
./scripts/m0-check.sh
npm exec --yes --package=pnpm@10.17.1 -- pnpm dev
```

Open `http://localhost:5173`; API is at `http://localhost:8080`. The default Pack is Classic Fantasy. To try the same engine with Cyberpunk:

```bash
WORLD_PACK_PATH=worldpacks/cyberpunk-test npm exec --yes --package=pnpm@10.17.1 -- pnpm dev
```

With the server running, the live PostgreSQL smoke checks are:

```bash
node scripts/m0-runtime-smoke.mjs
node scripts/runtime-smoke.mjs  # Classic Fantasy Pack
node scripts/cyberpunk-runtime-smoke.mjs  # Cyberpunk Pack server
npm exec --yes --package=pnpm@10.17.1 -- pnpm exec tsx scripts/concurrency-smoke.mts
```

See [Project Status](docs/PROJECT_STATUS.md) for verified scope and remaining product/security work. The current local baseline is a development prototype and has not passed production acceptance.
