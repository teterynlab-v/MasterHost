# M22 Deep Post-Apocalypse

**State:** complete engineering gate and independent review verified 2026-09-27.

## Source

Post-Apocalypse 2.0.0 preserves byte-identical 1.0.0 and adds 151 authored entries, three six-scene Campaign Kits, nine Quick/Advanced assets and six portable schematics. Dustroad Convoy negotiates emergency reserves and passage; Seed Vault tests contamination and shared planting rights; Last Grid restores heat to omitted households. Every scene specifies objectives, alternatives and costs. Eight selectable survivor roles and six progression paths bind to Character fields, traits and runtime tracks. Six executable actions use Grit/Scavenge/Heart. All behavior remains Pack-driven.

## Automated evidence

`./scripts/m22-gate.sh` passed TypeScript, 206 tests (4 environment-gated skips), production builds, two empty PostgreSQL 17 installations, exact v1/v2 activation, nine-asset Quick review, Advanced composition, different Kit graphs, mismatch rejection, self-contained `.mhgame` transfer, role/path and path advancement, complete check/action/encounter/reward/progression/reconnect/private-redaction rehearsal and restart readback. The shared M15 harness now supplies custom encounter order when the Pack declares that policy, matching the existing UI.

Independent review confirmed byte-identical v1, content references, three campaign routes, focused tests and the policy-dependent harness correction. No engineering blocker remained; browser evidence was exercised by the primary agent.

## Browser evidence

Collection demo API8245/web8246: Quick Builder assembled Dustroad Tonight and opened the GM table immediately with zero players and six scenes. Ash joined late as Tinker/Convoy Auditor/Reserve Steward, received Health18/Water8/Radiation0 and starting equipment, and resolved Brace Crossing through the server (Scavenge, 2d6, failure9). GM switched to A Span for Everyone; the player recovered that scene and Character after reload without another join. Screenshot: `/tmp/masterhost-m22-player.png`.

## Limits

Five non-source locales explicitly fall back to English; translation and native editorial review remain open. Media are schematics, base root content coexists with selected deep content, and fictional obligations remain GM adjudication. Accessibility and a complete friends-at-table game remain M30 acceptance work. No deployment or PR.
