# M20 Deep Cyberpunk

**State:** complete engineering gate and independent review verified 2026-09-27.

## Source

Cyberpunk 2.0.0 retains immutable 1.0.0 and adds 151 authored entries, three six-scene Campaign Kits, nine additive Quick/Advanced assets and six portable schematic media files. Rainline Mutual concerns utility ownership and household privacy; Glass House concerns stolen medical identities, consent and care; Ghost Transit concerns a missing courier's memory, copying consent and shelter. Each scene gives an objective, alternatives and a consequence. Eight Street roles and six selectable Progression paths bind to Character fields, conditional traits and actual runtime progression tracks. Six new executable actions use Interface/Cool checks through Pack rules.

Source-English content has explicit fallback for five untranslated locales. Coverage exposes missing translations rather than claiming translated keys. No genre branch is added to runtime.

Generic corrections preserve the chosen game name when compiling a Game Descriptor and show server Action Check totals, outcomes, labels and actual dice notation on the player's tray.

## Automated evidence

`./scripts/m20-gate.sh`: TypeScript, full Vitest suite (200 passed, 4 environment-gated skips), production web/server builds; two empty PostgreSQL 17 installations; exact legacy/deep activation; nine-asset review; Advanced composition; three distinct materialized graphs and incompatible Kit rejection; self-contained `.mhgame` transfer; Character creation including role/path; selected path advancement; full Session check/action/encounter/reward/progression/reconnect/private-redaction rehearsal and restart readback. Compilation explicitly asserts the user's game name survives transfer.

## Browser evidence

Retained API8245/web8246 demo:

- Catalog shows Cyberpunk ready. Play Today builds the default Kit in three steps; single-choice categories are omitted.
- Review shows all nine selected Cyberpunk assets and truthful counts. `Water Behind the Lock` is the opening.
- GM opens immediately with zero players, six scenes and Pack map. A player joins the live Session, creates Mara as Netrunner/Tenant Electrician/Grid Steward, receives health/humanity/ammo and starting equipment.
- Scene switch to `Live Copper` reaches the player. `Repair Grid` executes its server Interface check; tray shows total and outcome and correctly labels the roll `2d6`.
- API restart preserves live Session/Character. A fresh Quick build shows `Rainline Mutual Tonight` after the naming correction. Screenshots: `/tmp/masterhost-m20-player.png` and `/tmp/masterhost-m20-game.png`.

## Independent review

Reviewer found no remaining concrete engineering acceptance blocker and independently confirmed exact legacy bytes, runtime bindings, generic action feedback and successful API gate. Browser development hot reload was also corrected to reuse the React root instead of creating duplicate roots.

## Limits

Human editorial, five content translations, native-speaker review, polished illustrations, accessibility and friends-at-table acceptance remain M30 gates. Old base root content remains alongside selected deep fragments in composed Worlds. Runtime checks adjudicate mechanical outcomes; the GM narrates fictional consequences. Local convenience GM dice are distinct from authoritative server Checks. The temporary verification API sharing the demo PostgreSQL exhausted connections; it was stopped and the retained demo verified again. No external deployment or PR was published.
