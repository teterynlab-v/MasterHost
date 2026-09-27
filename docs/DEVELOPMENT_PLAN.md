# MasterHost --- Full Development Plan

> Current implementation and acceptance evidence: [PROJECT_STATUS.md](PROJECT_STATUS.md). The historical "Current immediate backlog" at the end of this original plan predates M2.1; use the status document for active next steps.

**Version:** 0.1\
**Date:** 2026-09-20

## Product goal

MasterHost is an open web platform and engine for creating, publishing,
hosting, and playing custom tabletop RPG universes.

-   **Creator:** unlimited depth; hours or months building a reusable
    universe.
-   **GM:** minimal preparation; world/campaign/session in minutes when
    defaults are acceptable.
-   **Player:** near-zero friction; site → PIN → character → lobby →
    game.

Core pipeline:

    World Pack + GM choices
              ↓
       Descriptor Builder
              ↓
      Descriptor + Seed
              ↓
        World Compiler
              ↓
    Persistent Materialized World
              ↓
      Campaign → Session + PIN → Players

## Non-negotiable principles

1.  World Pack defines what is possible.
2.  Descriptor is dynamically composed from GM choices, not selected as
    a predefined world template.
3.  World Compiler materializes Pack + Descriptor + Seed.
4.  Materialized World is authoritative after creation; it is not
    rebuilt on every load.
5.  Worlds support autosave, revisions, snapshots, restore, fork,
    export/import.
6.  Quick, Guided, and Advanced builders produce the same Descriptor
    type.
7.  AUTO / CUSTOM / LOCK is universal authoring behavior.
8.  Core contains no setting-specific branches.
9.  Full World Packs include rules, content, procedural generation,
    standard artwork, and visual identity.
10. Different settings have different setting-appropriate artwork.
11. World Packs are data/content packages, not arbitrary executable
    browser/server code.
12. Same application works locally, privately hosted, on a branded
    Realm, and as hosted multi-Realm service.
13. Guest players can join permitted sessions without creating an
    account.
14. Session PIN is a short-lived join mechanism, never privileged
    authorization.

------------------------------------------------------------------------

# Phase 0 --- World Engine Foundation

M0 proves creation, customization, persistence, safe regeneration,
versioning, and transport of arbitrary RPG worlds. Combat is not
required.

## M0.0 --- Repository/platform skeleton

Deliverables: pnpm TypeScript monorepo; `apps/server`; `apps/web`;
packages `domain`, `descriptor`, `template-engine`, `world-compiler`,
`worldpack-sdk`, `persistence`, `shared`; PostgreSQL; Docker Compose;
tests; CI; `/docs`.

Exit: clean install; DB/server/web start; typecheck/tests pass.

## M0.1 --- Descriptor Builder

World Pack declares a decision graph; UI writes normalized decisions
into a versioned Descriptor.

Value modes: `default`, `generated`, `constrained`, `explicit`,
`inherited`.

Builder levels:

-   **Quick:** \~5--10 high-value choices.
-   **Guided:** geography, politics, civilization, magic/technology,
    danger, campaign style.
-   **Advanced:** constraints, explicit values, entities, generation
    settings, rules, assets.

All produce the same Descriptor schema. A **Preset** is a reusable
partial Descriptor, not a generated World.

Exit: conditional questions; common schema; serialization/validation;
presets; schema-versioned semantics.

## M0.2 --- Template DSL v0.1

Core primitives:

`Definition`, `Template`, `Parameter`, `Reference`, `Generator`,
`Table`, `Trait`, `Condition`, `Constraint`, `Dependency`, `Output`,
`Instance`, `Override`, `Lock`, `Seed`, `AssetRef`.

Templates recursively materialize entities. Prefer composition:

    Goblin + Warrior + Elite + Poisonous

over deep inheritance.

Traits may modify attributes, resources, tags, components, equipment,
assets, generation weights, and behavior metadata.

Exit: recursive materialization; conditional components; typed
parameters; context propagation; trait composition; no Fantasy knowledge
in core.

## M0.3 --- Generator Engine

Required generators: constant, range, weighted table, sequence/count,
template, reference query, name, expression, composition.

Randomness:

    World seed + stable generator path = RNG stream

Changing an unrelated generator must not reshuffle the whole World.

Context example:

    Region culture → Settlement culture → NPC culture → Name generator

Exit: deterministic generation; stable paths; context propagation;
useful diagnostics.

## M0.4 --- Conditions, references, dependencies, constraints

Conditions change graph structure based on Descriptor/context.

References form a graph:

    Ravenford
     ├─ belongsTo → Northern Reach
     ├─ controlledBy → Kingdom of Arven
     ├─ tradesWith → Stonecross
     └─ hostileTo → Black Hand

Constraints turn GM intent into enforced requirements. If GM requests
three kingdoms, low stability, and active war, compiler must create a
graph satisfying those requirements.

Exit: conditional graph changes; validated references; cycle detection;
enforced constraints; actionable diagnostics.

## M0.5 --- Cross-setting architecture test

Create `classic-fantasy-test` and `cyberpunk-test`.

Cyberpunk concepts: districts, megacorporations, gangs, fixers, street
clinics, cyberware, security drones.

Forbidden core pattern:

    if (pack.id === "cyberpunk") { ... }

Both packs must compile through the same generic engine.

## M0.6 --- Materialized World and provenance

Every value stores value, source
(`pack | generated | custom | runtime`), source reference, and lock
state.

Example:

    Name        Ravenford   CUSTOM      LOCKED
    Population  1,834       GENERATED   UNLOCKED
    Economy     Mining      PACK        LOCKED
    Religion    Old Gods    GENERATED   UNLOCKED

Exit: reload never recompiles; provenance persists; generated values can
become custom.

## M0.7 --- Safe regeneration

Rules: explicit target scope; LOCK survives; CUSTOM survives unless
reset; generated/unlocked may change; dependency analysis first;
snapshot before destructive regeneration; impact preview.

Exit: protected work cannot be silently destroyed.

## M0.8 --- World persistence

Required: autosave, revision history, named snapshots, non-destructive
restore, fork from revision/snapshot, archive, backup compatibility.

Exit: snapshot → modify → restore; later history preserved; fork
independent; restart loses no data.

## M0.9 --- World export/import

Portable extension: `.mhworld`.

    world.mhworld
    ├── manifest.json
    ├── descriptor.json
    ├── world/
    │   ├── entities.ndjson
    │   ├── relations.ndjson
    │   └── metadata.json
    ├── overrides/
    ├── assets/
    └── checksums.json

Export records exact Pack/version, schema, Descriptor, seed/provenance,
materialized state, relations, custom assets, checksums. Import
validates all of these and never executes arbitrary code.

Future: **Create World Pack from World**.

## M0.10 --- Asset System v0.1

Asset types: portrait, token, card, background, map, item, location, UI
asset, variants.

Resolution:

    specific entity
      → variant/type
      → family
      → active Art Set
      → World Pack default

Full packs ship setting-specific standard artwork. Creator overrides
survive revisions and pack upgrades unless explicitly replaced.

## M0 completion gate

    Classic Fantasy
      → Quick Builder
      → Dynamic Descriptor
      → Compile
      → Persistent World
      → Customize
      → Lock
      → Regenerate
      → customization survives
      → Snapshot
      → Modify
      → Restore
      → Fork
      → Export
      → Import

Cyberpunk must use the same compiler without setting-specific core
branches.

------------------------------------------------------------------------

# Phase 1 --- Realm, Campaign, Session and PIN

M1 turns the World Engine into a multiplayer product shell.

## M1.0 --- Realm

Realm owns branding/domain, auth/guest policy, memberships, enabled
World Packs, Worlds and Campaigns. Same code supports LAN, private
hosting, branded domain, and hosted multi-Realm service.

## M1.1 --- Identity and permissions

Roles: Owner/Admin, Creator, GM, Player.

Identity modes: guest, persistent profile, Realm account, later
OIDC/external identity.

## M1.2 --- Campaign

Campaign references Realm, World, baseline World revision, party
settings, characters, sessions, and campaign-specific state. One World
may host many independent Campaigns.

## M1.3 --- Session lifecycle

    PREPARING → LOBBY → LIVE → FINISHED
                    ↘ CANCELLED

Session stores UUIDv7 identity, campaign, GM, participants, PIN,
timestamps, state, runtime snapshot/event stream.

## M1.4 --- PIN resolver

GM:

    Continue Campaign → START SESSION → 74291 → Share PIN

Player:

    Open Realm → PIN → nickname/profile → character → lobby

Rules: short-lived; belongs to Session; expires after
finish/cancel/expiry; private Realm uses Realm-scoped active uniqueness;
hosted resolver uses global/partitioned active uniqueness; rate-limited;
never grants GM privileges.

## M1.5 --- Realtime lobby

WebSocket events: join/leave, character selected, ready state,
start/cancel.

M1 gate: two devices complete GM start → PIN → guest join → realtime
lobby → LIVE → reconnect.

------------------------------------------------------------------------

# Phase 2 --- Character System

## M2.0 --- Pack-defined character schema

MasterHost never assumes `Race → Class → Level`.

Examples:

    Fantasy: Species → Class → Background → Stats
    Cyberpunk: Origin → Role → Augmentations → Skills
    Narrative: Name → One Ability → Done

## M2.1 --- Character Builder DSL

Pack defines steps, fields, options, conditions, validation, calculated
values, assets, starting items, and traits.

## M2.2 --- Persistent characters

Character stores Pack/ruleset compatibility, values, progression,
inventory/resources as defined by Pack, and assets.

## M2.3 --- Portability

GM/Realm may accept, reject, normalize, or require migration.
Compatibility is explicit, never guessed.

M2 gate: first-time guest creates a valid character quickly; returning
player reuses a compatible saved character.

------------------------------------------------------------------------

# Phase 3 --- Playable Game Engine

## M3.0 --- Generic runtime primitives

Actor/Entity, Attribute, Resource, Action, Check, Effect, Item,
Encounter, Turn, Location, Event.

No assumption that every game has HP, levels, classes, initiative, or
combat.

## M3.1 --- Dice and checks

Pack-defined dice expressions, modifiers, difficulty, success/failure,
critical rules, hidden/public DC, GM-requested checks. Resolution is
server-authoritative and auditable.

## M3.2 --- Resources and effects

Generic resources support health, mana, sanity, battery, ammunition,
etc. Effects modify values/actions/checks and may expire.

## M3.3 --- Encounters and turns

Pack capability determines whether initiative/turn order exists.

## M3.4 --- Inventory, loot, progression

Entirely pack-driven.

## M3.5 --- Game event stream

Examples:

    EncounterStarted
    InitiativeRolled
    TurnStarted
    ActionDeclared
    DiceRolled
    CheckResolved
    DamageApplied
    EffectAdded
    ItemTransferred

Runtime snapshots provide efficient recovery/read state.

M3 gate: GM sends a check; player rolls; both see result; a basic
encounter survives reconnect/restart.

------------------------------------------------------------------------

# Phase 4 --- GM Console and Player UX

## M4.0 --- GM console

Primary controls: party, location, checks, encounters, NPCs,
travel/events, loot, session log. GM manages game mechanics, not
infrastructure.

## M4.1 --- Player view

Character sheet, pending checks/actions, dice result, resources/effects,
inventory, turn/encounter state, session context. Phone-friendly for
physical-table play.

## M4.2 --- Reconnect/recovery

WebSocket reconnect, missed-event catchup, state recovery, device
refresh.

M4 gate: conduct a real 2+ hour playtest.

------------------------------------------------------------------------

# Phase 5 --- Advanced World Builder

## M5.0 --- Universal entity editor

Common UX:

    AUTO
    CUSTOM
    LOCK
    RESET TO PACK
    REGENERATE

## M5.1 --- World structure editors

Pack-supported geography, settlements, factions, cultures, species,
creatures, NPCs, items, locations, encounters, events, rules.

## M5.2 --- Dependency/impact UI

Visualize references and regeneration impact.

## M5.3 --- Media Library

Upload, tag, browse, reuse, replace, inherit, choose variants.

## M5.4 --- Art Set editor

Create/select coherent setting visual styles without changing core UX
layout.

M5 gate: Creator can safely spend hours editing a World without touching
YAML/code.

------------------------------------------------------------------------

# Phase 6 --- World Pack Creator

## M6.0 --- Visual Pack authoring

Create/edit decision graph, templates, generators, tables, traits,
constraints, character flow, rules, content, assets, terminology, theme.

## M6.1 --- Source view

Advanced creators can inspect/export declarative YAML/JSON.

## M6.2 --- Validation/conformance

Validate schemas, references, dependency graph, assets, generators,
rules, migrations, test fixtures.

## M6.3 --- Pack import/export

Portable pack format with immutable versions and dependencies.

M6 gate: create a small new setting entirely through MasterHost UI,
publish it, and generate a World from it.

------------------------------------------------------------------------

# Phase 7 --- Publishing and Hosted Platform

## M7.0 --- Publish World/Pack

Visibility: private, unlisted, public.

Policies control whether other GMs may create campaigns, fork, modify,
and use characters.

## M7.1 --- Branded Realm

Custom name, logo, favicon, landing art, theme, terminology, domain.
Players do not need to know MasterHost is underneath.

## M7.2 --- Multi-Realm hosting

Tenant isolation, global PIN resolver, scalable realtime, object
storage/CDN, quotas, telemetry, backup/restore.

M7 gate: one deployment hosts multiple visually independent RPG
universes.

------------------------------------------------------------------------

# Phase 8 --- Official Content

Target official/full packs:

1.  Classic Fantasy
2.  Dark Fantasy
3.  Space Opera
4.  Cyberpunk
5.  Post-Apocalypse
6.  Gothic Horror

Each contains meaningful standard artwork,
creatures/NPCs/items/locations, generation tables, character flow,
rules, encounters/events, theme, and at least one Art Set.

Quality is more important than pack count.

------------------------------------------------------------------------

# Phase 9 --- Optional advanced features

Only after the core product works:

-   maps/fog-of-war;
-   richer travel/exploration;
-   spectator/replay;
-   campaign recap;
-   cross-campaign/shared-universe state;
-   Creator collaboration;
-   community pack discovery;
-   marketplace/economics if ever desired;
-   optional AI assistance as an add-on, never a core dependency.

------------------------------------------------------------------------

# Testing strategy

## Unit

Deterministic RNG, Descriptor normalization, conditions, traits,
generators, references, constraints, asset resolution.

## Compiler conformance

Every World Pack runs a common suite.

Critical invariant:

    same Pack version + Descriptor + Seed
    → same initial generated values

## Persistence

Autosave, revision ordering, snapshot/restore, fork isolation,
export/import, migrations.

## Realtime

Join/leave, reconnect, event ordering, duplicate-message handling,
multiple clients.

## End-to-end

Creator creates World → GM creates Campaign → starts Session → Player
joins via PIN → creates/selects Character → mechanics work →
restart/reconnect preserves state.

------------------------------------------------------------------------

# Security strategy

-   no arbitrary code in World Packs or `.mhworld`;
-   constrained expression language; never `eval`;
-   schema validation at every external boundary;
-   namespace/dependency-safe references;
-   safe archive extraction;
-   upload media/type/size/checksum validation;
-   rate-limited PIN resolution;
-   RBAC independent of PIN;
-   tenant/Realm isolation;
-   server-authoritative game mechanics.

------------------------------------------------------------------------

# Deployment evolution

## Development

    Web + Server + PostgreSQL + local asset storage

## Small private Realm

    Reverse proxy
        ↓
    MasterHost
        ├── PostgreSQL
        └── local/S3-compatible assets

## Hosted platform

    CDN / Load Balancer
        ↓
    Stateless MasterHost nodes
        ↓
    PostgreSQL + distributed pub/sub + object storage

Infrastructure abstractions: `AssetStorage`, `EventBus`, `AuthProvider`.

PostgreSQL is the production baseline. Docker is a delivery/development
mechanism, not the product identity.

------------------------------------------------------------------------

# Milestone summary

  -----------------------------------------------------------------------
  Milestone                           Result
  ----------------------------------- -----------------------------------
  M0                                  Generic persistent World Engine
                                      proven across Fantasy + Cyberpunk

  M1                                  Realm + Campaign + Session + PIN +
                                      realtime lobby

  M2                                  Pack-defined character creation and
                                      persistence

  M3                                  Generic playable rules/game engine

  M4                                  Usable GM console + player UX +
                                      real playtest

  M5                                  Deep visual World Builder + asset
                                      tooling

  M6                                  Full visual World Pack Creator

  M7                                  Publishing, branded Realms, hosted
                                      multi-tenant platform

  M8                                  Production-quality official World
                                      Packs

  M9                                  Optional advanced ecosystem
                                      features
  -----------------------------------------------------------------------

## Deep universe product roadmap

The approved product expansion is defined in `docs/superpowers/specs/2026-09-22-deep-universe-collection-design.md`. It preserves the generic Pack-driven runtime and adds no short-text composer.

| Milestone | Product result | State |
|---|---|---|
| M17 | Deep Universe Standard, Campaign Kits, quality gate, catalog and preview | Complete |
| M18 | Deep Classic Fantasy | Complete; full gate and review corrections passed 2026-09-22 |
| M19 | Deep Space Opera | Complete engineering gate and review corrections 2026-09-27 |
| M20 | Deep Cyberpunk | Complete engineering gate 2026-09-27 |
| M21 | Deep Gothic Horror | Complete engineering gate 2026-09-27 |
| M22 | Deep Post-Apocalypse | Complete engineering gate 2026-09-27 |
| M23 | Deep Dark Fantasy | Complete engineering gate 2026-09-27 |
| M24 | Mythic Antiquity | Active |
| M25 | Weird West | Planned |
| M26 | Urban Fantasy | Planned |
| M27 | Cosmic Investigation | Planned |
| M28 | Age of Sail | Planned |
| M29 | Mecha & Kaiju | Planned |
| M30 | Whole-collection compatibility, localization, release and product acceptance | Planned |

Each universe milestone closes only after the complete Deep Universe Standard, Quick and Advanced assembly, `.mhgame` round trip, restart persistence, Character → Campaign → Session play, ready demo, and clean browser gate pass.

# Current immediate backlog

Do now, in order:

1.  Complete Template DSL conditions.
2.  Add typed template parameters/context propagation.
3.  Add composable traits.
4.  Add entity references/relations.
5.  Add constraint evaluation.
6.  Build `cyberpunk-test`.
7.  Run common compiler conformance tests against Fantasy and Cyberpunk.
8.  Finish revision persistence.
9.  Finish regeneration impact analysis.
10. Harden snapshot/restore/fork.
11. Harden `.mhworld` export/import.
12. Finish Asset System v0.1.
13. Close M0 acceptance gate.
14. Only then start M1 Realm/Campaign/Session/PIN.

## Definition of ready to move from M0 to M1

Do not move because the UI merely looks usable. Move only when:

-   two radically different packs compile through one core;
-   Descriptor is fully dynamic;
-   initial generation is deterministic;
-   materialized Worlds persist independently of compilation;
-   CUSTOM/LOCK survive regeneration;
-   impact preview exists;
-   snapshot/restore/fork work;
-   export/import works;
-   setting-specific standard assets resolve correctly;
-   tests cover these invariants.

At that point the World Engine is a proven foundation rather than a
prototype.
