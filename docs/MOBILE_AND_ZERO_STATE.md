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

Landscape screenshots are in `design/mobile-table/`. The user approved the portrait and landscape mockups on 2026-10-04 and authorized applying them. Actual phone safe areas/keyboard, longer translations, accessibility review and production gameplay integration remain open. The reported zero-value game failure remains unreproduced.

## Applied phone tables — verified locally, 2026-10-04

The approved navigation and orientation layouts now use the existing mounted GM/player game components and real API data. Portrait shows one workspace with dice and bottom navigation; landscape places navigation on the left, the map centrally, and scene/Character context on the right. The Tools dialog provides language selection, advanced GM controls and the existing local feedback export. Desktop layout remains outside these phone CSS breakpoints.

Participant removal requires an explicit confirmation. API rejection remains visible inside the dialog and permits retry; the live lobby callback propagates errors. Failed/offline note submissions retain the draft. Server mutations and pending player rolls are disabled while the socket is reconnecting.

### Source and automated verification

- TypeScript and production frontend build passed on the final source; the existing large-bundle warning remains.
- Full Vitest on a fresh PostgreSQL test database: **327 passed, no skipped tests**, 86 files. Navigation/locale and removal rejection/retry cases are included.
- An earlier repeated run against a reused test database failed the existing M14 immutable Pack installation case because that Pack was already installed. No assertion or schema was weakened; the final run used a new empty database.

### Independent runtime and browser proof

- Separate clean PostgreSQL/API setup passed the existing M15 setup scenario. Local API `8380`, web `8381`; public hosting was not updated.
- Root used normal UI navigation to open a GM table, join a player and create a Space Opera Character with Nerve `0`, Insight `2`, Command `1`. The Character retained other values, resources and inventory. The reported zero-value failure was not reproduced in this particular path and remains open for the original screen/action.
- GM requested a real Nerve check; the player dice control received the server result. A subsequent Pack action changed charge `12 → 11` while other resources and Character values remained unchanged.
- 390×844, 740×360 and 844×390 checks showed no document overflow. The Character pane's horizontal overflow and the portrait Journal panel hidden after rotation were found and corrected during root review.
- GM journal draft and selected tab survived portrait/landscape rotation; saving the note succeeded. Tools and participant confirmation dialogs remained open on rotation. Japanese menu content fitted its horizontal viewport. Feedback opened from Tools without a floating trigger covering the dice.
- Root stopped only the dedicated test API twice. GM save and player pending dice/action were disabled during reconnecting. GM draft, player Character and pending check survived; after restarting the API with the same database the UI reconnected and the draft could be saved.
- Removal cancellation retained the participant. Confirmed removal changed the roster to zero and revoked the old player connection. Rejoining exposed the same saved compatible Character, which could be selected again.
- Desktop GM layout was checked at 1754×1173 with mobile navigation hidden.

### Remaining acceptance

Actual iOS/Android touch, virtual keyboard, safe areas, screen reader and longer content review remain open. The new layouts are locally verified, not yet deployed to `mh.teterynlab.com`. No claim of native app delivery or resolution of the user's original zero-value report is made.

## Extracted release gate — 2026-10-04

Candidate `masterhost-0.1.4-mobile.tar.gz` from source `88aaf46` passed independent archive/checksum/license validation. API and web images built from its extracted source; all three containers in the isolated Compose stack became healthy. M15 setup passed via Nginx against its new PostgreSQL volume, including Character, actions/checks and reconnect. Hosted deployment and GitHub release publication are still blocked by the access requirements recorded in `PLAYTEST_RELEASE.md`.
