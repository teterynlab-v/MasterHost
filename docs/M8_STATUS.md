# M8 — Official Content

**Status:** canonical M8 content target and acceptance gate passed locally on 2026-09-21.

## Delivered source

MasterHost now ships six original, versioned official World Packs:

| Pack | World frame | Character callings | Runtime emphasis | Encounter order |
| --- | --- | --- | --- | --- |
| Classic Fantasy | Crowned provinces, communities and adventure sites | Knight, Ranger, Mage | Might, Wits, Spirit | Fixed |
| Dark Fantasy | Cursed borderlands and desperate settlements | Vigilant, Hexer, Penitent | Steel, Guile, Will | Rolled |
| Space Opera | Star systems, stations and ancient gates | Ace, Envoy, Tech | Nerve, Insight, Command | Attribute |
| Cyberpunk | Megacity districts, factions and street sites | Solo, Netrunner, Fixer | Reflex, Interface, Cool | None |
| Post-Apocalypse | Wasteland territories, enclaves and ruins | Scout, Tinker, Warden | Grit, Scavenge, Heart | Custom |
| Gothic Horror | Haunted parishes, estates and occult sites | Investigator, Medium, Hunter | Reason, Nerve, Occult | Rolled |

Each Pack contains four Descriptor questions, twelve generators, ten World templates across at least ten setting-specific kinds, traits, two relation families, three constraints, a four-step Character flow, three Checks, three Resources, seven Items, two progression tracks, three Actor/NPC templates, three Effects, seven Actions, encounter rules, events, locations and one standard Art Set with five distinct SVG artworks. All content is original MasterHost material declared as `CC-BY-4.0` with attribution and a content rating.

The World Pack manifest now carries official-content identity, description, publisher, content rating, SPDX license, attribution and source. `assessOfficialPack()` applies one shared minimum quality contract. The server discovers only installed Packs that declare official status and pass that contract.

The hosted API exposes the installed official catalog, detailed content metadata and immutable artwork. Any Realm owner can activate an installed official Pack without cloning its source into Realm storage. The existing Realm-scoped Pack proxy then drives the unchanged Descriptor → compiler → materialized World → generic runtime path.

The web app adds an Official Worlds library with artwork, description, rating/license, content coverage, Character flow, rules, NPCs and Realm activation. Active official content is marked in the Realm header and also appears in Realm Console's Pack selector.

## Automated evidence

- TypeScript check: pass.
- Vitest: 25 files and 91 tests pass.
- M8 official Pack conformance: 19 tests pass across all six settings.
  - every Pack passes the official quality contract and asset/reference validation;
  - two descriptors per Pack compile at 20 or more entities with all constraints passing;
  - identical Pack/version/Descriptor/seed input produces identical materialized values;
  - every Pack produces locations, creatures, NPCs, items, encounters and events;
  - every Character flow builds complete starting state;
  - every ruleset executes its composed attack and encounter ordering policy.
- Vite production build: pass.
- `scripts/generate-official-packs.mjs` reproducibly emits the checked-in YAML, Art Set manifests and SVG assets from the curated setting definitions.

## PostgreSQL runtime evidence

`scripts/m8-acceptance.mjs` passed against a clean temporary database and one server process:

- discovered exactly the six official Packs and read their metadata/artwork through the hosted catalog;
- created six isolated Realms and activated a different official Pack in each;
- generated and persisted a 20+ entity World per setting and verified every required content kind;
- published every World and created a policy-authorized GM Campaign;
- built and selected a Pack-defined Character, joined by global PIN and entered LIVE;
- initialized the player Actor, created a Pack-defined NPC, executed `basic-attack`, and started an Encounter using each Pack's ordering policy;
- stopped the server, started a fresh process, and read back all six Realm/Pack/World/live Session/Character combinations.

The temporary database was removed after acceptance.

## Browser evidence

The browser loaded the Space Opera Realm from the shared deployment and showed the active `Space Opera 1.0.0 OFFICIAL` Pack, all four Descriptor questions, its persisted World and Realm theme. The full-page Official Worlds library rendered all six cards with distinct artwork/palettes, description, rating, license, World kinds, Character flow, Checks, NPCs and activation state.

## Acceptance and limits

M8 is accepted locally: every target official setting is installed, visibly discoverable, generates a meaningful World, creates a complete Character and plays through the same generic runtime without setting-specific application code.

The Packs are a production-quality content baseline for the capabilities currently expressible by the Pack DSL. They do not contain third-party game rules, brands, text or art. Content editing remains YAML/generated-source plus the M6 Pack Creator; editorial localization, accessibility review by human specialists, print products, audio, large illustration sets, signed distribution, moderation and external legal review remain later publication work. No production deployment was performed.
