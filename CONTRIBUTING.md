# Contributing to MasterHost

MasterHost is a self-hosted RPG engine. Contributions should preserve the generic World Pack → Descriptor → compiler → runtime path and keep hosted AI or SaaS services optional.

## Before a change

- Read [installation](docs/INSTALL.md), the [project status](docs/PROJECT_STATUS.md) and the relevant milestone document.
- Use Node.js 22+ and the pinned pnpm 10.17.1. Run `pnpm install`, `pnpm typecheck`, `pnpm test` and `pnpm --filter @masterhost/web build`. Some integration tests require PostgreSQL; the milestone gate scripts document their own setup.
- Add focused tests for changed behavior and describe manual checks and remaining limits in the pull request.
- Keep secrets, `.env` files, database dumps, local backups and generated build output out of commits. Use `.env.example` only for placeholder configuration.
- For new Packs, assets or artwork, include the license, attribution and source information described in [licensing](docs/LICENSES.md). Do not replace or mutate versioned Pack identities used by saved Worlds.

The source license is [PolyForm Noncommercial 1.0.0](LICENSE). Contributions to source code must be offered under those terms, and contributors must have the rights to grant them. Bundled content has separate CC BY 4.0 metadata; check it before reusing or contributing assets. Commercial licensing requests should be discussed with the project owner before use.
