# M15 — Complete Table Experience

**Milestone gate: passed locally on 2026-09-21.** One reproducible Space Opera rehearsal covered setup, Character creation, exploration, social interaction, a Pack-defined Action and Check, a rules-defined Encounter, rewards, progression, authenticated reconnect and Session completion entirely inside MasterHost. The accepted Session, table, map and runtime state survived an actual server restart.

## Delivered source

- A Session now owns one revisioned PostgreSQL `TableState` with pacing phase, ordered materialized-World scenes, active/completed scene state, shared notes and a GM-only notebook.
- Table creation and updates commit the state and audit event atomically. Optimistic revisions reject stale writes. Finished and cancelled Sessions reject further table changes.
- Private note text is omitted from player and spectator table responses, realtime messages, game events, replay and recap. The audit event retains only the note count and table revision.
- Pack-defined Actions accept either an authenticated GM or the participant who owns the source actor. Participant tokens cannot control NPCs or another participant's actor.
- The GM table console controls setup, pacing, scene focus, shared/private notes, narrative beats, exploration map, fog, selected Actor tokens, NPCs, Checks, Actions, Encounters, rewards, progression and Session completion.
- The exploration board now renders as a responsive SVG from persisted World coordinates, tokens and fog rather than a text-only location list.
- The player view combines the responsive Character sheet, Resources, Effects, Inventory, progression, Location, Pack abilities/actions and targets, dice, Encounter status, party, visible map and activity history.
- `GET /api/sessions/:id/rehearsal-report` reports each of the nine M15 stages separately and passes only when all are present in authoritative state/events.

## Automated tests

- TypeScript workspace check: pass.
- Ordinary Vitest suite: **146 passed**, with **4 environment-gated tests skipped** in the ordinary run.
- Live PostgreSQL table repository contract: **2 passed**. It proves create/read, optimistic conflict, atomic event persistence and the absence of private note text in the event stream.
- Web production build: pass, 43 modules transformed.

## Runtime proof

`scripts/m15-gate.sh` creates a new PostgreSQL 17 container and isolated databases, starts the Space Opera server, runs the rehearsal, starts the browser app and then restarts the server.

The clean-database rehearsal proved:

1. World, Campaign, Session, guest Character and runtime Actor setup;
2. TableState creation and pacing changes;
3. exploration-board creation and token movement;
4. explicit social beat recording;
5. a player-owned Pack Action and a GM-requested server roll;
6. Encounter start and end;
7. a Pack Item reward and progression award;
8. authenticated WebSocket catch-up with `SessionReconnected`;
9. finished Session with all report stages green;
10. rejection of participant NPC control without a new event;
11. player and spectator redaction of GM notes, including absence from the event stream;
12. rejection of table mutation after Session completion;
13. restart readback of the finished Session, private/public table views, token map and report.

Headless Chrome exercised the visible GM and player surfaces. The GM loaded the SVG board and saved a private note. The player received the live WebSocket snapshot, saw the Character/action/map experience, could not see the GM notebook, and executed `Recover Integrity` from the Pack. No browser exception or failed HTTP response was observed.

## Remaining limits

- This is a reproducible engineering rehearsal with one automated player. It is not the real three-to-four-hour game with one GM and two to five people.
- M16 still owns clean-machine installation, onboarding, backup/restore operations, migration/diagnostic documentation, license inventory, accessibility/responsive audit, release archives and the real group game.
- Production identity, abuse controls and external infrastructure remain outside this local gate.

