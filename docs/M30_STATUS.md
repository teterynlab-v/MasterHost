# M30 Whole-collection acceptance

**State:** engineering candidate verified 2026-09-27; human product acceptance remains open. This is not a claim that M30's whole product gate has passed.

## Source

All twelve catalog targets resolve exact deep Packs with 151 entries each, three six-scene Kits, nine assets and six media roles. Catalog genres, tones, complexity and player counts match installed profiles. Genre filtering treats spacing and hyphen aliases alike without changing Pack identity. Play Today uses the complete Deep Universe Standard bundle when exactly one asset per category exists; ordinary Quick/Advanced selection retains alternative libraries.

Characters compatible with the game appear first, with schema-provided labels. Other-game Characters sit in a closed disclosure; if none are compatible, creation opens immediately. Traits already explained by selected schema fields no longer expose redundant internal IDs. Custom traits remain visible. Play Today activation failures now show an actionable access message instead of silently leaving the user on the catalog. Closing an unmounted client no longer signals revoked credentials: network failures retry; server policy rejection still clears removed-player access.

Mythic Antiquity, Weird West and Urban Fantasy publish corrected base Actor labels as 1.0.1. Their complete previous 1.0.0 files are retained byte-for-byte in `*-v1`; assets remain immutable 1.0.0 because their content did not change. Old Worlds retain their resolved documents. The subsequent official content-localization increment supplies full inventoried source-string coverage in five target languages; it does not claim native editorial review. See `CONTENT_LOCALIZATION_STATUS.md`.

## Automated and PostgreSQL evidence

`./scripts/m30-gate.sh` builds a checksummed source release archive, verifies its inventory and 197 third-party license records, builds the Docker Compose images from the extracted archive (without Compose deployment), then starts the extracted server image against two empty PostgreSQL 17 installations. Installation A resolves all twelve exact ready Packs, reviews every nine-asset bundle and compiles all 36 Kit Worlds. Twelve `.mhgame` files transfer to installation B with exact Pack/Descriptor/World evidence. All twelve survive restart. The full Character → exploration → check/action → encounter → reward → progression → reconnect/private-redaction rehearsal runs through the same release image, including explicit Heat0→1→0. TypeScript, 230 tests (four environment-gated skips) and production web build pass.

The collection test additionally checks 36 generic compiler fixtures, valid independent mixed fragments, missing requirements, overlapping writes and foreign Quick asset rejection. It proves original 1.0.0 file fidelity and corrected 1.0.1 identities. M19–M29 browser/runtime evidence remains in the individual status documents. Automated rehearsals do not count as human games.

## Browser evidence

Retained demo API8245/web8246: twelve playable catalog cards, combined genre/tone/complexity filtering, six UI language switches, three-step Space Opera Play Today creates Collection Rescue Tonight (PIN109098), compatible Character-first selection, hidden other-game Characters, clean schema-based sheet and reconnect verification. Catalog at 375px has no horizontal overflow; controls have visible names and images have alt attributes. This is a narrow engineering accessibility check, not a complete assistive-technology audit. Screenshots in `/tmp/masterhost-m30-*.png` provide local visual evidence.

## Human gate and remaining limits

M30 still requires several full human games across different universes, editorial feedback from actual GMs/players, native review of Russian/Spanish/Japanese/Chinese/Korean adventure content, and human accessibility review. Official universe content now has complete inventoried source-string coverage, while user-authored text and non-universe administration tools are not translated by this increment. Schematics are usable reference shapes rather than polished illustrations. Deep material is additive to retained base roots. Vehicle, naval, social and cosmic consequences remain generic Actions plus GM adjudication, not dedicated simulations.

Do not label the product accepted or all M17–M30 complete until these gates have actual evidence. No deployment, external service change or PR was performed.

Human session protocol: `COLLECTION_PLAYTEST.md`. Original-version preservation uses a portable SHA256 baseline from commit cdb02cd, so source-archive tests do not require Git history.
