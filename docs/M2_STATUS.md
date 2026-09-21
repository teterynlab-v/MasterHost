# M2 Status — Pack-defined Character System (2026-09-21)

**Status: canonical M2 completion gate passed locally.** The source, tests, PostgreSQL runtime proof and browser proof below cover M2.0–M2.3 from `DEVELOPMENT_PLAN.md` for both bundled Packs. This is local product acceptance for the current single-Realm, single-active-Pack development topology; third-party Pack certification, accounts and hosted Realm policy administration remain later work.

## Source

- The Pack Character DSL declares schema versions, steps, fields, options, conditional steps/fields, text/number validation, calculated values, starting progression/resources/inventory/traits/assets, and explicit portability rules.
- Pack load rejects duplicate or unknown field references, missing choice/asset options, invalid regular expressions, invalid calculation references, and incomplete migration declarations.
- Character creation applies defaults and conditions server side, rejects hidden/inactive or unknown input, validates all active fields, calculates derived values, and materializes the Pack-defined starting state.
- PostgreSQL persists Pack/version and Character schema compatibility beside values, progression, inventory, resources, traits and assets. Existing tables migrate in place with explicit defaults.
- Campaigns persist an explicit Character policy: exact Pack/schema only, or Pack-declared portability. Existing Campaigns migrate to Pack policy so pre-schema Characters can follow the declared version-1 normalization rule; new Campaigns default to exact. Portability otherwise defaults to rejection and can accept, normalize, or migrate only through a matching Pack rule. Normalize/migrate creates a new current Character and keeps the source Character unchanged.
- The web builder renders the same DSL for both Packs, including conditional fields, asset choices and calculated previews. Saved Characters display their compatibility result; incompatible Characters cannot be selected. GM chooses the Campaign policy before opening the lobby.

## Tests

- 62 unit/conformance tests pass across 21 files.
- Character tests cover required/unknown/choice validation, defaults, conditional fields, text validation, calculations, starting state, exact matching, rejection, normalization and migration.
- Cross-setting conformance loads Fantasy and Cyberpunk through the same SDK and runtime code.
- TypeScript check and the Vite production build pass.

## Runtime proof

A clean temporary PostgreSQL database was created and removed after acceptance. `scripts/m2-character-smoke.mjs` passed against separately started Fantasy and Cyberpunk servers:

- first-time Character creation produced schema version 2, calculated values and full starting state;
- the same owner listed and reused the exact saved Character;
- an older Fantasy Character normalized through an explicit rule;
- an older Cyberpunk Character migrated through an explicit field map;
- an exact-only Campaign rejected the older Character with 409;
- a Pack-policy Campaign created and selected a current compatible copy.

A separate legacy-schema database fixture verified that migration assigns existing Campaigns the Pack policy before making the column non-null; the temporary database was removed afterward.

## Browser proof

On Cyberpunk against that clean acceptance database, the browser generated a World, created a Campaign with Pack portability, joined by five-digit PIN, and completed all four Pack-defined Character steps. Selecting Netrunner revealed the conditional Intrusion suite field; Interface 2 plus Awareness 3 rendered calculated `edge: 5`; the asset step defaulted to Neon avatar. Creation reached the lobby. The same browser left, rejoined by PIN, saw `Browser Neon` as `Compatible · exact`, selected it without rebuilding, and returned to the lobby as a returning player.

## Limits

- Guest ownership remains a browser-held bearer key from M1; authenticated profiles and cross-device account sync are outside M2.
- Portability rules are declarative Pack data and Campaign policy is chosen at creation. A hosted Realm administration UI and signed Character exchange format are not part of this gate.
- Bundled Packs are proven; arbitrary third-party Packs are validated structurally but are not certified by these two examples.
