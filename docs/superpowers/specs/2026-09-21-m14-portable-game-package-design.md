# M14 Portable Game Package Design

**Status:** accepted locally on 2026-09-21; evidence in `docs/M14_STATUS.md`

## Outcome

M14 adds a self-contained `.mhgame` archive. A GM exports one playable materialized World together with the exact Pack that drives it, the normalized Descriptor, GM asset selections, required media, dependency lock and attribution evidence. A second MasterHost installation imports the archive without the original asset library, activates the imported immutable runtime Pack, restores an equivalent World and creates an independent editable Pack fork.

The package preserves the product pipeline:

`embedded source evidence -> imported immutable Pack -> normalized Descriptor -> imported materialized World -> Campaign -> Character -> Session`

Runtime Session history is excluded.

## Archive contract

The outer ZIP uses MIME type `application/vnd.masterhost.game+zip`, extension `.mhgame`, format `masterhost.game` and current format version `0.1`.

Required entries:

- `game.json`: package identity, display name, export time, source World identity and optional source Descriptor project with GM selections.
- `pack.mhpack`: the exact complete Pack document and every referenced Pack media byte.
- `world.mhworld`: the materialized World, normalized Descriptor, authoring metadata and World-owned media.
- `game-assets/*.json`: selected published asset definitions and exact versions when the source game has them.
- `dependencies.lock.json`: exact Pack identity, selected asset identities/content checksums and media checksums.
- `attribution.json`: Pack and selected-asset SPDX identifiers, attribution text and source references.
- `checksums.json`: SHA-256 for every other entry, with no missing or extra paths.

Nested `.mhpack` and `.mhworld` reuse their existing schema, media and checksum validators. The outer reader additionally rejects unsafe or duplicate paths, encryption, excess entry count, excessive compressed or expanded size, unknown mandatory entries, cross-document Pack/World mismatches and lock/attribution mismatches.

## Export

`GET /api/worlds/:id/export-game` requires normal Realm read access. Export resolves the exact published Pack project used by the World. For Descriptor-composed Worlds without a Pack project, it materializes a transport-only Pack project from the immutable Descriptor revision and gathers the exact bundled media bytes. Selected asset manifests are copied as evidence; runtime resolution never depends on them after import.

Export fails closed if the Pack, media, Descriptor provenance or license evidence is incomplete.

## Import and identity

`POST /api/games/import` requires Realm owner or creator access. Parsing, migration and complete validation happen before database writes.

One PostgreSQL transaction then creates:

1. an immutable published runtime Pack preserving the exported Pack ID and version;
2. an editable draft fork with a new project UUID and manifest ID `<source>.fork.<suffix>`, version `0.1.0`, plus `.mhgame` lineage;
3. an independently identified World with remapped World/entity IDs but equivalent materialized paths, values, relations, Descriptor decisions and authoring state;
4. all World media blobs;
5. a persistent import record containing package identity, dependency lock and attribution;
6. the imported runtime Pack as the Realm's active Pack.

An existing published Pack collision rejects the whole import. The source package identity remains queryable after restart. Editing the fork cannot mutate the imported runtime Pack or World.

## Migration

The importer normalizes supported older manifests before validation. Version `0.0` used `licenses.json`; migration renames it to `attribution.json` and emits the current `0.1` in-memory contract. Unknown newer or otherwise unsupported versions fail before persistence.

## Browser flow

World Builder adds **Export .mhgame** beside `.mhworld`. The empty World screen accepts `.mhgame`; successful import opens the imported World and shows the runtime Pack plus editable fork identity. Pack Creator can open the returned draft fork immediately.

## Acceptance gate

Against two isolated disposable PostgreSQL databases and real server processes:

1. Installation A exports a complete M13-style game with selections, custom Pack structures, Character rules, Pack media and World media.
2. Installation B starts with an empty game-asset directory and imports the archive.
3. Canonical Descriptor and materialized World content match after excluding intentionally remapped IDs, Realm IDs, revisions and timestamps.
4. Every Pack and World media byte and digest matches; attribution and dependency lock read back after restart.
5. The editable fork changes, validates, publishes as a new version and compiles another World without changing the imported runtime Pack.
6. Installation B creates a Character from the imported Pack, creates a Campaign and starts a Session.
7. Tampered checksum, unsafe path, oversized archive, unsupported version and Pack collision each leave all import tables and World counts unchanged.
8. Headless Chrome exports, imports on B, opens the World and editable fork, and renders protected media with non-zero natural dimensions.

TypeScript, ordinary tests, production build, live repository tests, restart proof and M13 regression complete the reproducible gate.

## Limits after M14

- Active Session and event history are intentionally excluded; they belong to a future operational backup format.
- M15 completes real-table UX and rehearsal.
- M16 covers public installation, contributor and release acceptance.
