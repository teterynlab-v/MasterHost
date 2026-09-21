# M15 Complete Table Experience Design

## Goal

Finish the browser experience required to run a complete tabletop rehearsal in MasterHost. The GM must be able to pace scenes, keep private and shared notes, operate the exploration map and runtime, and complete the Session. Players must be able to use their own Pack-defined actions as well as their Character sheet, resources, inventory, map, dice and activity history. PostgreSQL remains authoritative across reconnect and process restart.

## Product boundary

M15 extends the existing Pack-driven runtime. It does not add setting-specific code, a natural-language composer, or a second game-state model. World Pack + Descriptor + compiler still produce the materialized World; the table layer references that World and the active Pack.

M15 accepts a reproducible browser/API rehearsal. The three-to-four-hour game with a real GM and two to five players remains the M16 release gate.

## Table state

Each Session may have one revisioned `TableState` in PostgreSQL:

- a pacing phase: `setup`, `exploration`, `social`, `encounter`, `reward`, or `epilogue`;
- ordered scenes derived from materialized World locations, scenes, encounters and events;
- one active scene and per-scene `upcoming`, `active`, or `complete` status;
- shared notes visible to all Session viewers;
- GM notes returned only to the authenticated GM.

Creation and updates use optimistic revisions. The repository commits table state and its audit event in one transaction. Private note text is never written to `game_events`, realtime messages, player responses, spectator responses, replay or recap. Its audit event contains only the resulting note count.

## At-table APIs

- `POST /api/sessions/:id/table` creates the table from the materialized World.
- `GET /api/sessions/:id/table` returns the GM or redacted public view.
- `PATCH /api/sessions/:id/table` changes phase, focuses/completes a scene, and appends a shared or private note at an expected revision.
- `POST /api/sessions/:id/table/beats` records an explicit public beat for exploration, social interaction, encounter, reward, or epilogue.
- `GET /api/sessions/:id/rehearsal-report` reports the evidence for the M15 gate.

Pack-defined Actions use the existing `/actions` endpoint. A GM may control any initialized actor. A participant may use only the actor whose ID equals their participant ID; spoofing another actor is rejected. Action mechanics, targets, resources, checks and effects remain defined by the active Pack and committed through the existing mutation transaction.

## Browser experience

The shared table panel renders:

- current phase and active scene;
- GM scene controls, shared notes and a private notebook;
- a real SVG exploration board using persisted World node coordinates, token positions and fog polygons;
- an explicit actor picker for GM token movement;
- redacted player maps based on the existing visibility function;
- replay and recap below the live controls.

The player view adds a Pack ability panel. Players select a Pack Action and any required legal targets, then execute it as their own actor. The page stays usable at phone width with horizontally scrollable table navigation and a map that scales to its container.

## Rehearsal evidence

The report has one boolean and count for each required stage:

1. setup: table created and party actor initialized;
2. Character creation: every participant has a Character and actor state;
3. exploration: exploration started and a token/fog/travel change occurred;
4. social interaction: a `social` table beat was recorded;
5. rules encounter: an Encounter started and ended;
6. rewards: an item was granted;
7. progression: a progression value changed;
8. reconnection: authenticated WebSocket catch-up recorded `SessionReconnected`;
9. completion: Session state is `finished`.

The gate passes only when every stage is true. It is independent of the deferred M4 120-minute duration gate.

## Acceptance

On a clean PostgreSQL database, the acceptance script creates a complete game, Character, Campaign and Session; runs setup, exploration, social interaction, a Pack-defined action and check, an Encounter, reward and progression; reconnects; completes the Session; restarts the server; and verifies table, actors, events, redaction and the passing report. Headless Chrome performs the GM and player table controls without JSON/YAML/source editing. TypeScript, unit tests, live repository tests and the production web build pass.
