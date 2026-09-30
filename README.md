# MasterHost

MasterHost is a self-hosted tabletop RPG engine for creating and running original game worlds. A creator or Game Master selects ready assets or uses the visual editor; MasterHost composes a versioned World Pack, builds a Descriptor and materializes a persistent World. Players join with a six-digit code, create Pack-defined Characters and use the generic engine for maps, dice, actions, encounters, inventory, progression and the shared journal. The Docker Compose installation runs locally with PostgreSQL; an AI provider or SaaS account is not required. The optional AI endpoint is currently disabled.

The source code is available under the [PolyForm Noncommercial License 1.0.0](LICENSE): noncommercial use is permitted; commercial use requires separate permission from the rights holder. This is a source-available license, not an OSI-approved open-source license. Bundled original game content, artwork and translations have separate CC BY 4.0 terms; see [licensing and attribution](docs/LICENSES.md).

## Start the product

Requirements: Docker Engine 24 or newer with Docker Compose v2, 4 GB free memory, 5 GB free disk and a current browser.

```bash
cp .env.example .env
```

Replace `MASTERHOST_DB_PASSWORD` and `MASTERHOST_ADMIN_TOKEN` in `.env` with two independent URL-safe random values, for example output from `openssl rand -hex 32`. MasterHost refuses to start the product Compose stack when either value is absent.

```bash
docker compose up --build -d
./scripts/diagnose.sh
```

Open [http://localhost:8088](http://localhost:8088). Choose **Create a game** to assemble a game from the asset library, **Run game** to prepare a room, or **Join a game** when you have an invitation code.

Product traffic uses one browser origin: Nginx serves the application and proxies HTTP API and WebSocket traffic to the private API container. PostgreSQL and the API are not published on host ports.

## Guides

- [Installation and upgrades](docs/INSTALL.md)
- [GM and player game guide](docs/GAME_GUIDE.md)
- [Backup, restore and diagnostics](docs/OPERATIONS.md)
- [Licensing and attribution](docs/LICENSES.md)
- [Current milestone evidence](docs/PROJECT_STATUS.md)
- [Contributing](CONTRIBUTING.md)

## Protect active games

```bash
./scripts/backup.sh
./scripts/restore.sh backups/your-backup.dump --confirm-replace
```

Restore replaces the configured database. Read [Operations and recovery](docs/OPERATIONS.md) before using it. A `.mhgame` file transfers an authored game; a database backup protects Campaigns, Characters, Sessions and play history.

## Build a release archive

```bash
pnpm release -- 0.1.0
node scripts/verify-release.mjs release/masterhost-0.1.0.tar.gz
```

The archive includes source, operator documentation, `VERSION`, a third-party dependency license inventory and SHA-256 manifests. Local environment files, database data, dependencies and build output are excluded.

## Local development

Development requires Node.js 22+, Docker and Corepack or npm. The repository pins pnpm 10.17.1. `scripts/m0-check.sh` starts only the development PostgreSQL service from `compose.dev.yaml`, installs dependencies and runs the baseline checks. If `pnpm` is unavailable, use `corepack pnpm` or `npm exec --yes --package=pnpm@10.17.1 -- pnpm` for the commands below.

```bash
./scripts/m0-check.sh
npm exec --yes --package=pnpm@10.17.1 -- pnpm dev
```

Open `http://localhost:5173`; the development API is at `http://localhost:8080`. Set `WORLD_PACK_PATH=./worldpacks/<pack-directory>` to run another installed Pack.

Core verification:

```bash
pnpm typecheck
pnpm test
cd apps/web && pnpm build
```

The complete local release engineering gate is `./scripts/m16-release-gate.sh`. It creates and deletes its own isolated Compose project and volume.

## Architecture

```mermaid
flowchart LR
  Assets[Game assets and GM choices] --> Pack[Versioned World Pack]
  Pack --> Descriptor[Descriptor]
  Descriptor --> Compiler[Generic compiler]
  Compiler --> World[Materialized World]
  World --> Runtime[Campaign and Session runtime]
  Runtime --> GM[GM table]
  Runtime --> Players[Player clients]
```

Game rules and content live in Packs. The compiler and runtime remain generic, and exact Pack and Descriptor identities are persisted with Worlds so saved games can be reopened and transferred without reconstructing the original UI choices.

## Current product status

The twelve-universe collection and official content localization have passed documented engineering checks. This is an engineering candidate, not a completed product acceptance or hosted service. Full product acceptance still requires real human games, editorial and accessibility review, and independent installation. Publishing source code does not close those gates. See [M30 status](docs/M30_STATUS.md), [localization status](docs/CONTENT_LOCALIZATION_STATUS.md) and the [project status](docs/PROJECT_STATUS.md) for the evidence and limits.
