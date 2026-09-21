# Deep Universe Collection — Product and Architecture Design

**Date:** 2026-09-22  
**Status:** approved design  
**Scope:** M17–M30

## Objective

MasterHost will ship twelve deep official universe sets. The existing Classic Fantasy, Dark Fantasy, Space Opera, Cyberpunk, Post-Apocalypse and Gothic Horror sets will be expanded to the same product standard as six new sets: Mythic Antiquity, Weird West, Urban Fantasy, Cosmic Investigation, Age of Sail, and Mecha & Kaiju.

A Game Master must be able to select a universe, one of its patterns, a campaign shape, a ready adventure, tone, difficulty and visual theme, then create a playable game without editing source. Advanced mode continues to permit explicit replacement and custom authoring. No short-text automatic composer is part of this design.

The existing architecture remains authoritative:

```text
Versioned assets + explicit GM choices
        -> World Pack
        -> dynamic Descriptor
        -> generic Compiler
        -> materialized World
        -> Campaign -> Session
```

The core must contain no setting-specific branches.

## Deep Universe Standard v1

Every official universe must contain at least:

| Content area | Minimum |
|---|---:|
| Distinct universe patterns | 3 |
| Campaign frameworks | 3 |
| Ready 3–4 hour adventures | 3 |
| Factions | 8 |
| Significant locations | 12 |
| Named NPCs and allies | 24 |
| Adversaries and creatures | 18 |
| Items, clues and rewards | 24 |
| Events and complications | 30 |
| Scenes and encounters | 18 |
| Character archetypes | 8 |
| Progression paths | 6 |
| Visual themes | 3 |

Each set must also provide:

- a complete baseline of maps, backgrounds, portraits, tokens, item art and UI visuals;
- setting-specific checks, resources, effects, actions, encounters and progression;
- generators for names, conflicts, goals, relationships and complications;
- explicit links between factions, NPCs, locations and threats;
- Quick, Guided and Advanced assembly through one Descriptor model;
- one verified “play today” configuration with a ready World, adventure, Characters, opening scene and GM guidance;
- a portable `.mhgame` and a browser-driven playable acceptance flow;
- content rating, open-license provenance, attribution and alternative text.

Minimum counts are necessary but not sufficient. The quality gate must also prove meaningful descriptions, relationship coverage, playable mechanics and a coherent game loop.

## Content architecture

### Universe Core

The core document owns the universe’s rules, Character Builder, actions, resources, terminology, generators and base visual identity. It is the exact versioned World Pack resolved by the generic runtime.

### Universe Patterns

Each universe contains three meaningfully different patterns. A pattern contributes compatible Descriptor fragments, generators, content pools, threats and one visual theme. Selecting a pattern materially changes the generated graph and play experience.

### Campaign Kits

A Campaign Kit is a versioned asset bundle with a central conflict, opening state, important NPCs, scenes, encounters, rewards, branches and GM guidance. Each kit declares its required capabilities and exact dependencies. It is selected explicitly and persisted in the Descriptor.

### Mixable assets

Locations, factions, adversaries, items, Character components, rules and visual assets remain individually replaceable in Advanced mode. Compatibility is governed by declared capabilities, dependencies, conflicting writes and exact versions. A kit or pattern cannot silently insert content that the GM did not select.

## Builder experience

The primary flow is:

```text
Universe -> universe pattern -> campaign type -> ready adventure
         -> tone and difficulty -> visual theme -> review -> create game
```

The universe catalog card shows genre, tone, game loop, duration, recommended player count, GM complexity, patterns, adventures and visual previews. Previewing a set does not create or modify a World.

Every universe provides a “Play today” configuration. The GM may rename the game and adjust tone or difficulty, then create the room directly. Advanced tools expose exact identities, dependencies, source editing and replacement controls outside the primary flow.

## Authoring and quality tooling

Pack Creator gains:

- a Deep Universe completeness dashboard;
- filters by pattern and content type;
- graph inspection for factions, NPCs, locations, scenes and threats;
- duplicate, generic-text, dangling-reference and empty-description diagnostics;
- Campaign Kit preview and isolated launch;
- Quick Builder preview from the current draft;
- cloning between explicitly compatible patterns;
- localization coverage by stable string key.

The automated quality gate rejects:

- missing minimum content;
- blank or placeholder copy;
- broken references or unreachable required scenes;
- disconnected required factions, NPCs or locations;
- a declared game loop without corresponding runtime rules;
- incomplete Character creation or progression;
- missing media, alternative text, license or attribution;
- a missing ready adventure or failed `.mhgame` round trip;
- failure of the universe’s browser acceptance scenario.

Diagnostics must name the asset, path and violated rule. Publication remains immutable and is blocked while errors exist. Warnings may describe editorial repetition or weak connectivity without blocking draft saves.

## Localization

Official Pack content uses stable string keys with separate locale catalogs. The source language is the fallback and missing translations are visible in the completeness dashboard. User-authored names and narrative text are never translated automatically. Machine-generated translations cannot be published automatically.

Application UI localization remains separate from Pack-content localization. Layouts must support English, Russian, Spanish, Japanese, Simplified Chinese and Korean without fixed text heights.

## Runtime presentation

The GM surface exposes the selected universe’s game loop through:

- a clear current-scene objective;
- universe-specific suggestions for the next GM action;
- fast selection of relevant checks, encounters and complications;
- unresolved consequence and story-thread tracking.

These suggestions resolve from Pack data and current materialized/session state. They do not introduce setting branches in the web client or server.

## Universe portfolio

| Universe | Patterns | Primary game loop |
|---|---|---|
| Classic Fantasy | Border Kingdoms; War of Heirs; Ruins of the Ancient Empire | travel -> threat -> deed -> growth |
| Dark Fantasy | Dying Marches; Witch Principalities; Plague Pilgrimage | investigation -> difficult choice -> price -> consequence |
| Space Opera | Voidwake Archipelago; Sunforge Hegemony; Nightglass Frontier | exploration -> diplomacy/conflict -> discovery -> sector change |
| Cyberpunk | Corporate Arcology; Flooded Neon Freeport; Orbital Data Haven | contract -> preparation -> operation -> fallout |
| Post-Apocalypse | Road Clans; Valley of Ancient Machines; Reclaimed Green Zone | resources -> expedition -> community threat -> rebuilding |
| Gothic Horror | Stormbound Estates; Gaslight City; Cursed Province | mystery -> clues -> temptation -> confrontation |
| Mythic Antiquity | Warring Poleis; Islands of the Odyssey; Underworld Frontier | prophecy -> ordeal -> divine intervention -> legacy |
| Weird West | Cursed Frontier; Ghost Railway; Occult Boomtown | job -> journey -> supernatural threat -> settlement fate |
| Urban Fantasy | Hidden Courts; Monster Districts; Municipal Magic Conspiracy | ordinary problem -> hidden world -> bargain -> balance shift |
| Cosmic Investigation | Coastal University; Polar Expedition; Decaying Metropolis | investigation -> forbidden knowledge -> pressure -> containment |
| Age of Sail | Pirate Archipelago; Imperial Trade War; Mythic Ocean | rumor -> voyage -> discovery/battle -> spoils and reputation |
| Mecha & Kaiju | Defense Metropolis; Colony Rebellion; Machine-Wreck Frontier | alarm -> machine preparation -> operation -> damage and pilot bonds |

All names and content must remain original and free of third-party setting text, rules, characters, visual identities and trademarks.

## Milestones

| Milestone | Acceptance result |
|---|---|
| M17 | Deep Universe Standard, schemas, quality gate, Campaign Kits, catalog and preview |
| M18 | Deep Classic Fantasy |
| M19 | Deep Space Opera |
| M20 | Deep Cyberpunk |
| M21 | Deep Gothic Horror |
| M22 | Deep Post-Apocalypse |
| M23 | Deep Dark Fantasy |
| M24 | Mythic Antiquity |
| M25 | Weird West |
| M26 | Urban Fantasy |
| M27 | Cosmic Investigation |
| M28 | Age of Sail |
| M29 | Mecha & Kaiju |
| M30 | Whole-collection catalog, compatibility, localization and product acceptance |

Only one complete named milestone is delivered per iteration. A universe milestone is not complete until it meets the full Deep Universe Standard, works in Quick and Advanced modes, completes `.mhgame` export/import, survives restart, runs Character -> Campaign -> Session gameplay, supplies a ready demo, and passes content, typecheck, test and browser gates.

M30 verifies all twelve catalog entries, genre/tone/difficulty filters, compatible mixing, absence of empty categories, locale fallback, release-archive installation and several human games across different universes.

## Data and compatibility boundaries

- Stable IDs and exact versions remain the portability identity.
- Patterns and Campaign Kits are Pack/asset data, never executable server or browser code.
- Composed revisions store the exact selected asset set and parameters.
- Existing Worlds retain their exact Pack and Descriptor revisions.
- Existing published Packs remain immutable; deeper versions are published as new exact versions.
- Advanced forks copy the resolved document and media while retaining lineage.
- Capability contracts allow deliberate mixing; missing requirements and conflicting writes fail before compilation.

## Error handling

Draft authoring may save incomplete work, but preview, publication and compilation report structured diagnostics. Installation rejects invalid checksums, missing exact dependencies, unsupported schema versions and identity collisions atomically. Runtime loading reports unavailable exact Pack versions rather than substituting a newer set. A failed content generation or constraint pass cannot create a partial World.

## Verification strategy

M17 adds contract tests for schemas, minimum counts, relationship coverage, Campaign Kit dependency resolution, locale fallback and actionable diagnostics. Every universe milestone adds deterministic compilation fixtures, content matrix tests, clean PostgreSQL creation/restart, `.mhgame` round trip and browser-only Quick Builder plus playable-session acceptance.

The complete collection gate runs all universe fixtures through the same compiler and runtime, checks that the core contains no setting ID branches, renders every catalog card and preview, verifies compatible and rejected cross-pattern combinations, and exercises release installation. Human editorial, localization, accessibility and table-play findings remain separate evidence and must not be inferred from automated tests.

## Explicit exclusions

- No automatic composer from a short text prompt.
- No arbitrary Pack executable code.
- No automatic publication of machine translation.
- No third-party branded settings or copied rules/content.
- No claim that content counts alone establish editorial quality.
