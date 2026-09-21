# M18 Deep Classic Fantasy Implementation Plan

**Goal:** Ship Classic Fantasy 2.0.0 as the first complete Deep Universe: three coherent patterns, three playable Campaign Kits, full standard content, Quick and Advanced assembly, portable game proof, and an end to end browser table flow.

**Architecture:** Extend the filesystem World Pack format with optional declarative `universe.yaml`. The SDK loads it into `LoadedWorldPack`, converts installed Packs into complete `WorldPackDocument` values, and feeds the generic M17 catalog resolver. Classic Fantasy content remains data; server, compiler, runtime, and UI gain no setting branches.

**Constraints:** Preserve World Pack → Descriptor → Compiler → materialized World. Use original open licensed content. Do not add a text composer. Exact identities are `masterhost.classic-fantasy@2.0.0`, `border-kingdoms`, `war-of-heirs`, and `ancient-empire-ruins`.

## Task 1: Installed Deep Universe documents

- Add RED tests for optional `universe.yaml`, loaded document conversion, media checksums, and catalog readiness from installed official Packs.
- Extend `LoadedWorldPack`, `loadWorldPack`, `toLoadedWorldPack`, and `worldPackDocumentFromLoaded` without breaking legacy Packs.
- Supply installed official documents to the catalog route and prove Classic Fantasy readiness survives restart.

## Task 2: Classic Fantasy 2.0.0 content

- Upgrade the official Pack as a new exact version while retaining generic runtime rules.
- Author a strict Deep Universe profile with all M17 minimums, meaningful unique copy, valid relations, six locales, media coverage, compatible Campaign Kits, and an exact Play Today selection.
- Expand Pack world, Character, rule, item, actor, scene, and visual material needed by the three patterns.

## Task 3: Quick and Advanced assets

- Add a compatible nine category Classic Fantasy asset set with explicit capabilities, dependencies, counts, license evidence, parameters, and media.
- Prove Quick review supplies exactly one compatible choice per category and Advanced composition materializes through the generic Descriptor pipeline.
- Make Play Today activate the exact installed official Pack before opening Quick Builder while preserving the handoff.

## Task 4: Portable playable acceptance

- On clean PostgreSQL, choose Play Today, compose and compile a World, export `.mhgame`, install it into a clean second Realm state, and prove exact content and media.
- Create a Character, Campaign, Session and lobby; execute a check, Action, Encounter, reward/progression and finish; restart and verify persisted state.
- Run headless browser acceptance for catalog → Play Today → Quick Builder → World → Campaign/Session.

## Task 5: Evidence and final review

- Add `scripts/m18-gate.sh` and `docs/M18_STATUS.md` with separate source, automated, runtime, browser, portability, and remaining human evidence.
- Run typecheck, full tests, production image/build, clean PostgreSQL and browser gate.
- Request independent review, fix all Critical and Important findings with RED→GREEN regressions, update roadmap status, and commit verified M18.
