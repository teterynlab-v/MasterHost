# M11 Base Asset Library v1 Design

**Status:** implementation design derived from the approved M10–M16 roadmap.

## Outcome

M11 supplies a searchable, licensed library of reusable game blocks that a GM can select in the M10 Game Builder. Selected assets resolve to ordinary Descriptor fragments and still flow through World Pack → Descriptor → Compiler → materialized World.

The bundled `Voidwake Archipelago` collection targets the installed Space Opera Pack and forms one coherent one-shot kit. It includes a setting core, world structure, ten locations, twenty NPC or creature variants, twenty items/clues/rewards, twelve scenes or encounters, character archetypes, a complete rules module and original functional SVG maps, portraits, tokens and backgrounds.

## Asset contract

Each published asset JSON records:

- schema version, stable ID, semantic version, type, name and description;
- tags and preview highlights;
- supported base Pack IDs, required asset versions and fragment capabilities;
- SPDX license, source and attribution;
- immutable published state and optional fork lineage;
- one validated M10 Descriptor fragment;
- optional media entries with logical name, role, media type, byte size and SHA-256 checksum.

The registry rejects duplicate identities, unsafe paths, unsupported licenses, missing dependencies, dependency cycles, mismatched fragment identities, invalid fragments, missing media, checksum/size/type mismatches and media declarations that are not embedded into the composed Pack. Registry order and search results are deterministic.

## Runtime integration

The server loads the bundled asset registry at startup, adds its fragments to the existing composition registry and exposes Realm-authorized catalog, detail and immutable media routes. Catalog queries filter by text, type, tag and active base Pack compatibility.

The Game Builder combines legacy proof fragments with the asset catalog. Asset cards show family, compatibility, dependencies, tags, content depth, license, attribution and preview media. Selection remains explicit. M10 preview diagnostics remain authoritative for the complete selection.

Composed Pack media metadata is added through validated fragment patches. A selected visual asset may nominate one default Art Set; conflicting defaults produce a composition diagnostic. World-specific Pack media routes resolve bundled bytes by name and checksum so old composed revisions continue to render after restart.

## Acceptance

On clean PostgreSQL, activate the installed Space Opera Pack and select the complete Voidwake collection through the supported API. Require valid dependency, license and checksum evidence, compile twice deterministically, and prove minimum content depth from the composed Pack and materialized World. After a server restart, read the project and World and fetch every referenced media byte with matching checksum.

Headless Chrome must search and filter the library, inspect provenance and preview media, select the complete collection, preview a valid Descriptor, compile the one-shot, render its generation report and resolve bundled media without browser errors.

M11 does not claim M12 guided presets, M13 asset editing/fork persistence, M14 `.mhgame` portability, M15 table rehearsal or M16 release acceptance.
