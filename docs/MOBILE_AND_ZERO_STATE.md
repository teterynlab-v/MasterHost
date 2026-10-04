# Mobile design and zero-value investigation — 2026-10-04

## User report

The user confirmed that reducing «Выдержка» to zero resets other state. The exact screen, universe and action are still requested; the reported end-to-end failure is not yet reproduced or claimed fixed.

Two edge-case tests pass: Space Opera's `nerve` Character aptitude can be zero without clearing other aptitudes, identity, starting resources, inventory, traits or progression; setting one generic Pack-defined resource to zero preserves unrelated actor state and does not mutate the input state. Space Opera's Nerve is an aptitude/check modifier, not a base resource. Do not replace declared Pack rules with mockup values.

## Separate recovery fix

Investigation found that any failure while restoring a saved World, including auxiliary report/localization requests, deleted the browser's selected World identity. This made a temporary failure appear as lost selection after reload.

The client now retains the selection, reports recovery errors and offers Retry on the GM route. Three tests cover API failure followed by retry of the same World, auxiliary metadata failure and absence of any saved World. No Campaign, Session, Character or runtime mutation is introduced.

TypeScript and frontend build pass. Full local Vitest: **307 passed, 10 PostgreSQL-gated tests skipped**. Docker/PostgreSQL runtime gate and hosted deployment remain pending as described in `PLAYTEST_RELEASE.md`. The user-reported zero-value failure is still open.

## Designer deliverable

Interactive prototype: [mobile-table/index.html](design/mobile-table/index.html), with [designer notes](design/mobile-table/README.md).

- GM: map, scenes, group and journal; invite/player management through a bottom sheet. Table does not wait for players.
- Player: map, Character, actions and journal; pending check and a dice-shaped control stay near bottom navigation.
- Separate reconnecting and ended states retain the same campaign context.
- The prototype uses illustrative SVG and demonstration data. It does not call the game API, implement presence, authorize kicks, or resolve actual checks.

Designer independently checked 360/390/430 px. Root independently checked 360/390 px, role/tab switching, player Character, dice sheet, GM participants drawer, reconnecting and ended states. No horizontal overflow; visible phone buttons were at least 44 px in root's measured test (the design aims for 48 px). Actual phone keyboard/safe-area behavior and real gameplay integration are not accepted yet.

The earlier user requirement remains: review and approve mockups before applying the design. Production table layout has not been changed. The standalone mobile prototype does not turn MasterHost into an iOS/Android native application.
