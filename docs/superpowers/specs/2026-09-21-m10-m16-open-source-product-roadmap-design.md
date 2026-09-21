# MasterHost M10–M16 Open-source Product Roadmap

**Date:** 2026-09-21  
**Status:** approved product direction; M10 and M11 accepted locally
**Target:** a self-hosted open-source product that a GM and friends can use to build, share and complete a full tabletop one-shot.

## Product outcome

MasterHost is considered working when a GM can install it, assemble a complete game through the browser, export that game as one self-contained file, import it into another clean installation and run a three-to-four-hour one-shot for two to five players entirely through MasterHost.

The GM assembles the game deliberately from menus of reusable assets. Advanced mode allows the GM to modify those assets. Full Custom mode allows every supported game structure to be authored through the UI. Automatic composition from a text prompt is excluded.

The existing architecture remains authoritative:

```text
Asset library + GM selections
        -> dynamic Descriptor
        -> templates and generators
        -> World Compiler
        -> materialized World
        -> Campaign / Session
        -> generic game runtime
```

The runtime supplies visualization, dice, checks, scenes, encounters, maps, tokens, fog, resources, effects, inventory, replay and persistence. Rules and content remain Descriptor and Pack driven.

## Product principles

1. **GM authored:** the GM chooses the building blocks and controls the result.
2. **UI complete:** normal, advanced and full-custom workflows require no YAML, JSON or source editing.
3. **Portable:** an exported game contains everything required to import, edit and play it on another installation.
4. **Deterministic:** the same Descriptor, template inputs, asset versions and seed compile to the same World.
5. **Generic runtime:** setting and rules remain data; application code does not branch by Pack identity.
6. **Open licensing:** every bundled asset records license, source and attribution. Only redistributable material is bundled.
7. **Local first:** Docker Compose and local/self-hosted use are the release baseline. No commercial SaaS is required.
8. **Evidence led:** automated checks support the gates, while the final product gate requires a real completed game.

## Core concepts

### Dynamic Game Descriptor

The GM Builder creates a normalized, versioned Descriptor from explicit selections. Descriptor fragments can define:

- world structures, templates, relations and generators;
- game rules, dice, checks, actions, resources and effects;
- Character Builder steps, validation and calculated values;
- scenes, encounters, narrative structures and progression;
- visual roles, maps, tokens, portraits and Art Sets.

Fragments declare compatibility, required dependencies, provided capabilities and conflicts. Composition must fail with actionable errors when requirements cannot be satisfied. GM selections are stored separately from the materialized World so the game can be regenerated without losing CUSTOM and LOCK state.

### Base Asset Library

The library contains reusable content and media rather than opaque finished games. An asset has:

- stable ID and semantic version;
- type and schema version;
- tags, parameters and preview metadata;
- compatibility and dependency declarations;
- license, source and attribution;
- optional images, maps, portraits, tokens or audio;
- immutable published content and editable fork lineage.

Initial asset families include settings, world templates, locations, maps, NPCs, creatures, factions, items, rewards, clues, scenes, encounters, plot structures, character archetypes, rule modules and visual media.

### Authoring levels

- **Quick:** select compatible published assets and adjust exposed parameters.
- **Advanced:** fork an asset into the game, edit its supported fields, replace media and control generation.
- **Full Custom:** create every supported structure, rule and visual role through UI editors.

All three levels produce the same Descriptor model and compiler inputs.

### Portable game package

The `.mhgame` package is a checksum-validated archive containing:

- normalized Descriptor and schema version;
- GM selections and generator inputs;
- embedded asset definitions and exact versions;
- materialized World and authoring metadata;
- Character Builder and rules;
- maps, images, tokens and other required media bytes;
- license, source and attribution manifest;
- dependency lock and content checksums.

Import does not require the source asset library or separately installed Pack. Imported games can be played immediately and forked for editing. Runtime Session history is excluded from the default authoring package; a later explicit backup format can preserve active play state.

## Milestones

### M10 — Dynamic Game Descriptor

Deliver typed Descriptor fragments, capability/dependency/conflict resolution, template parameters, deterministic composition, stored GM selections and a previewable compilation report.

**Acceptance gate:** on clean PostgreSQL, a game assembled from multiple fragments through the supported API validates and compiles twice to the same playable World; incompatible fragments are rejected with actionable errors; selections survive restart; CUSTOM and LOCK state survive scoped regeneration. No source-file editing is used.

### M11 — Base Asset Library v1

Deliver the asset schemas, registry, search/filter UI, previews, compatibility metadata, provenance, licensing and enough original or redistributable content to assemble a complete one-shot.

The first library must cover a coherent setting with world templates, at least ten locations, twenty NPC/creature variants, twenty items/clues/rewards, twelve scenes or encounters, character archetypes, a complete rule module and the media needed for usable maps, portraits, tokens and backgrounds. Counts are minimum depth checks, not a quality substitute.

**Acceptance gate:** a GM can assemble a complete one-shot using only bundled assets; every selected asset passes dependency, license and checksum validation; the result compiles and all referenced media resolve after restart.

### M12 — Quick Game Builder

Deliver the primary guided browser workflow for selecting rules, setting, world template, locations, plot structure, scenes, NPCs, encounters, items, Character Builder and visual style. The UI displays only compatible choices, explains unmet requirements and provides a complete review before compilation.

**Acceptance gate:** a new user follows the UI from an empty installation to a playable one-shot without editing JSON, YAML or source code. Browser automation repeats the complete path on a clean database.

### M13 — Advanced and Full Custom Builder

Deliver visual editors for every supported Descriptor structure, including rules, dice, checks, actions, effects, Character Builder, templates, generators, relations, scenes, maps, tokens and media. Support asset forking, CUSTOM, LOCK, inheritance, scoped regeneration and dependency-safe removal.

**Acceptance gate:** a distinct original game with custom rules, Character flow, World structures and media is authored, validated and compiled entirely through the browser. Restart, regeneration and dependency failure paths are verified.

### M14 — Portable Game Package

Deliver `.mhgame` export/import, archive security limits, schema migration, exact checksums, embedded dependencies, attribution manifest and editable fork identity.

**Acceptance gate:** export a complete game from installation A, import it into clean installation B with no source assets installed, compare its Descriptor and materialized World, edit it, create Characters and start a Session. Tampered, oversized and incompatible archives are rejected without partial persistence.

### M15 — Complete Table Experience

Finish the GM and player experience for a real table. The GM controls scenes, maps, fog, tokens, NPCs, encounters, hidden information, checks, narrative notes and pacing. Players use responsive Character sheets, abilities, resources, inventory, maps, actions, dice and activity history. Reconnect and restart preserve authoritative state.

**Acceptance gate:** a rehearsal covers setup, Character creation, exploration, social interaction, combat or another rules-defined encounter, rewards, progression, reconnection and Session completion without mandatory external sheets, notes, maps or dice tools.

### M16 — Open-source Product Release

Deliver reproducible Docker Compose installation, browser onboarding, backup/restore, migrations, diagnostics, GM and player documentation, example games, license inventories, accessibility checks, responsive verification and release archives.

**Final acceptance gate:**

1. Install MasterHost from the public instructions on a clean machine.
2. Assemble a one-shot from bundled assets through the browser.
3. Export and import it on a second clean installation.
4. Run and complete a three-to-four-hour game with one GM and two to five players.
5. Use MasterHost for Characters, rules, dice, scenes, maps, events and the ending.
6. Fix all defects that block completion or corrupt authoritative state.
7. Publish the first working open-source release from the accepted source revision.

## Cross-milestone quality requirements

- PostgreSQL is the persistent baseline; in-memory substitutes do not satisfy acceptance.
- Clean database and actual process restart checks are required where persistence changes.
- Browser gates exercise the user path instead of only asserting that controls render.
- Imports are transactional and enforce archive path, size, checksum and schema limits.
- Private GM data and hidden checks remain redacted for players and spectators.
- Built-in content is original or has redistribution-compatible licensing and attribution.
- Source, automated tests, runtime proof, real-play evidence and remaining limits are reported separately.
- A milestone is reported complete only after its whole acceptance gate passes.

## Explicit exclusions

- automatic game composition from natural-language prompts;
- required external AI providers;
- commercial marketplace, billing or hosted SaaS operations;
- setting-specific branches in the generic runtime;
- a production claim based only on unit tests or short smoke tests.
