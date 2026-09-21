# M12 Quick Game Builder Design

**Status:** implementation design derived from the approved M10-M16 product roadmap.

## Outcome

M12 makes the guided builder the primary way a new GM assembles a playable one-shot. Starting with an active base Pack and an empty Realm, the GM names the game, explicitly chooses one compatible asset for every required game category, reviews Pack decisions and receives a complete readiness report before creating and compiling the World.

The flow does not compose from natural language, infer creative choices or introduce setting-specific application branches. It converts explicit selections into the same M10 game Descriptor and uses the existing World Pack -> Descriptor -> Compiler -> materialized World path.

## Guided flow

The browser presents these ordered stages:

1. game identity and deterministic seed;
2. setting;
3. world template;
4. locations;
5. cast (NPCs and creatures);
6. items, clues and rewards;
7. rules;
8. Character Builder and archetypes;
9. adventure structure, scenes and encounters;
10. visual style and media;
11. base Pack decisions;
12. final review, create and compile.

Each content stage shows only published assets compatible with the active exact base Pack. A card includes preview, highlights, content counts, exact dependencies and license attribution. The GM selects one asset per required category; Back and Next preserve every choice. The existing free-form M10/M11 builder remains reachable as Advanced mode.

## Authoritative readiness review

`@masterhost/descriptor` owns a pure `reviewQuickGameSelection` function. It receives the complete registry, an exact base Pack ID and selected `id@version` identities. It returns:

- `ready`;
- diagnostics for missing categories, unknown assets, incompatible base Packs, duplicate category selections and missing exact dependencies;
- dependency-ordered fragment selections;
- selected asset summaries;
- aggregate content counts, media count and a deduplicated license inventory.

The nine required v1 asset types are `setting`, `world-template`, `locations`, `cast`, `items`, `rules`, `characters`, `adventure` and `visuals`. The review rejects a selection until all nine are present. Dependency order is deterministic and independent of click order.

Fastify exposes `POST /api/game-assets/quick-review`. It resolves and authorizes the Realm, requires the requested base Pack to be the active exact Pack, parses only exact asset identities, and returns the pure review. This endpoint never persists or compiles incomplete input. Existing Descriptor preview/create endpoints remain authoritative for schema and composition validation.

## Browser behavior

`QuickGameBuilder` is a focused component rather than another mode inside the already dense advanced builder. It loads the compatible catalog, owns the wizard state and calls quick-review after every meaningful selection change. The Next action remains disabled until the current required choice exists. The final stage displays all nine selections, aggregate depth, exact dependencies, license inventory, base Pack decisions and any remaining diagnostics.

When readiness and Descriptor preview both pass, the GM creates the Descriptor project and compiles it. The resulting World opens in the existing World Builder. A saved project can still be managed through Advanced mode; M12 does not add a separate persistence model.

## Failure handling

- No compatible asset in a required category produces an explicit blocked stage and readiness diagnostic.
- Stale or manipulated IDs, versions or base Pack identities are rejected by the server review.
- Missing exact dependencies and duplicate categories are named in the review.
- Create and compile controls stay disabled until both quick review and Descriptor preview are valid.
- Media failures are visible on the card and remain browser-gate failures.
- Refresh before creation resets an unsaved wizard; persisted recovery belongs to the existing Descriptor project after creation.

## Acceptance

The reproducible M12 gate starts from clean PostgreSQL, creates an empty Realm with an installed official base Pack, and proves negative review cases plus a complete nine-category review. Headless Chrome enters the primary Build game flow, makes every choice through the wizard, changes a base Pack decision, inspects the final review, creates and compiles the one-shot, opens the materialized World and restores it after reload. No JSON, YAML, source editor or direct composition API is used by the browser flow.

The gate runs TypeScript, all ordinary tests, the live PostgreSQL repository contract, production web build, API acceptance, a real server restart, browser acceptance and cleanup. M10 and M11 regression gates must continue to pass.

## Limits

M12 guides selection of published assets. Asset editing and full-custom structures belong to M13, portable `.mhgame` transfer belongs to M14, table rehearsal belongs to M15, and release installation plus the real three-to-four-hour game belongs to M16.
