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

## Landscape review — 2026-10-04

Added GM and player landscape layouts, plus explicit Portrait / Landscape / Automatic preview controls. Navigation moves to the left rail, the map occupies the centre, and GM scene notes or player Character context occupy the right pane above the dice control. Dialogs dock at the right and scroll internally on short screens.

Designer and root independently checked 844×390 and 740×360 in Chrome. Root measured page dimensions matching both viewports and visible buttons at least 44 px. Root verified player Character and GM participants dialogs remain open through rotation into portrait and back; a typed GM journal note and the selected tab also remain intact. Reconnecting disables the dice control, and the ended GM view retains the next-session controls. Prototype JavaScript syntax check passed.

Landscape screenshots are in `design/mobile-table/`. This change contains standalone mockups and documentation only. User approval, actual phone safe areas/keyboard, longer translations, accessibility review and production gameplay integration remain open. The reported zero-value game failure remains unreproduced.
