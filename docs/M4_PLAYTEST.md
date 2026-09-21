# M4 Two-Hour Playtest Protocol

> Deferred on 2026-09-21 by explicit product-owner direction so development could proceed to M5. Keep this protocol for later human and production-readiness evidence; no completed playtest is currently claimed.

## Participants and setup

- One GM and at least one player use separate devices or browser contexts.
- Use either bundled World Pack and a newly created Campaign.
- At least one player view should use a phone-sized screen during the session.
- Keep the Session LIVE for at least 120 wall-clock minutes. Pauses may remain inside that Session if they reflect the real table session.

## Required coverage

During play:

1. Create or reuse Characters and initialize the party.
2. Use at least one Pack Action and one GM-requested Check.
3. Start and end at least one Encounter; use turns when the Pack defines them.
4. Grant loot or progression.
5. Travel the party to a materialized World Location.
6. Record at least one narrative event.
7. Disconnect or stop the server once, then confirm both GM and player recover automatically without losing current state.
8. Continue play after recovery and finish the Session normally.

The GM evidence card must show at least 120 minutes plus nonzero Checks, Actions, Encounters, travel and reconnects. After the Session finishes, `GET /api/sessions/:id/playtest-report` with the GM token must return `gatePassed: true`.

## Human observations

Record:

- devices and viewport sizes;
- Pack, participant count and actual start/end time;
- confusing or slow GM operations;
- player actions that required GM explanation;
- stale, missing or duplicated state after reconnect;
- layout failures on the phone;
- defects found and whether they block another two-hour run.

Attach the completed observations to this document or a dated playtest report before changing M4 status to complete.
