# World-linked actors and live Encounter roster — 2026-09-21

## World link

An NPC can remain Session-local or carry `worldEntityId` referring to one entity in its Campaign's persisted materialized World. Campaign creation and Actor binding check the active Pack identity/version; binding also checks World Realm, entity existence, and that its kind is listed in the selected Pack actor template's `worldEntityKinds`. A unique PostgreSQL index allows only one linked Actor per World entity within a Session, including concurrent creation. Actor resources, effects, and action attributes remain Session runtime state initialized from the Pack template; the World entity is an identity/provenance link, not a source of combat statistics. `ActorInitialized` contains the link, so replay and checkpoints retain it. A later World revision may change or remove the linked entity; the existing Session actor remains an auditable record and no automatic rebinding occurs.

Both test Packs now materialize actor-capable entities through their ordinary template/component graph: Fantasy `creature` Goblin Scouts and Cyberpunk `actor` Security Drones. Their actor templates declare compatible kinds. The same server route and validation work for both; no Pack-ID branch is used. The GM UI lists eligible World entities and still offers a Session-only NPC.

## Encounter roster

The GM can add initialized Session actors to, or remove non-current actors from, a live Encounter. An `EncounterParticipantsChanged` event records the resulting participants and order in the same version-checked transaction as Encounter state. Retries may use the Session-scoped `Idempotency-Key`. Reusing a key with different input returns 409; simultaneous changes computed from the same Encounter version cannot silently overwrite one another.

Existing turn order and current turn remain intact. For ordered policies, late entrants append to the established order, including `rolled` and `attribute`; previous scores are not rerolled. Packs with `none` ordering keep an empty order. Removing the current actor is rejected; the GM advances its turn first. The last participant cannot be removed; end the Encounter instead. Roster changes do not tick effects or emit turn/round transitions.

## Evidence and limits

Unit tests cover roster invariants and replay, Pack validation rejects unknown World kinds, and cross-setting compiler tests confirm both actor entity kinds are materialized. Both Pack API smokes exercise linked NPC creation, uniqueness, roster changes, and runtime replay. A cross-Pack Campaign creation attempt returned 409. The Fantasy browser flow linked a Goblin Scout, added and removed it during an active Encounter, and finished the Session. Both Pack M0 World persistence/ZIP smokes still pass. NPC editing/removal, World revision reconciliation, player-driven roster changes, and distributed realtime remain separate work.
