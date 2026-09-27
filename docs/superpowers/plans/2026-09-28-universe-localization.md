# Full universe localization implementation plan

Goal: the selected en, ru, es, ja, zh-CN or ko language covers official universe content throughout selection, composition, character creation and play. Custom names and notes, IDs, dice formulas and immutable stored Worlds remain unchanged.

Architecture: explicit authored-field rendering uses exact-source dictionaries in content-locales/<universe>/<locale>.json with Pack-owned localization taking precedence. No DOM rewriting or translated API write payloads. Shared UI copy uses content-locales/_ui. Runtime exposes Pack localization and field provenance as response metadata. Official corpus coverage must be complete; unsupported custom extensions retain their declared source language. Machine-authored translations are not native editorial acceptance.

1. Reproduce Russian catalogue with a failing SSR test. Add resolver tests for source preservation, own-Pack precedence and locale switching.
2. Inventory catalogue, profiles, Pack runtime definitions, published assets and static UI display copy. Author all five translations for each official source string. Check exact-key coverage, placeholders and scripts; review samples.
3. Integrate explicit render calls across catalogue, QuickBuilder, character selection/builder, GameHub, GM/player tables and advanced table. Keep canonical filter/option/action values.
4. Add non-mutating runtime metadata/provenance helpers; test custom versus generated fields. Expose profile localization at Pack/session/character endpoints. Include stock dictionaries in release and portable bundles without editing old published identities.
5. Run TypeScript, relevant/full tests, production build and clean PostgreSQL/API checks. Browser-check catalogue and full game flow, switching all six locales, custom names/notes and saved state.
6. Update retained demo preserving database/ports. Record evidence and limitations, review changes, then commit verified complete slice. M30 human game/native editorial gate stays open.
