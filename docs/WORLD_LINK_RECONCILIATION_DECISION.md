# M2 World-linked NPC reconciliation — 2026-09-21

A linked Session NPC stores the World entity ID, stable materialization path, last observed label, World revision and link status. Runtime mechanics remain copied from the Pack actor template; reconciliation never overwrites the NPC display label, attributes, Resources or Effects.

The GM explicitly runs reconciliation for all linked NPCs in a live Session. Resolution uses the stable materialization path first and the original entity ID as a compatibility fallback for older Actor records. A compatible entity updates provenance and becomes `current`; a missing path becomes `missing`; a path now occupied by a kind outside the actor template becomes `incompatible`. A missing link keeps its last ID/path/label so it can reconnect if that path appears again in a later World revision.

Changed Actor states and `ActorWorldLinkReconciled` events commit in one optimistic transaction. The command is GM-only and supports Session-scoped idempotency. Replay, checkpoint-tail verification and finished-Session repair understand the reconciliation event. The UI shows the last observed World label, status and revision, and exposes one reconciliation command for the Session.

Unit tests cover entity replacement at the same path, disappearance, reappearance and incompatible replacement. Fantasy and Cyberpunk PostgreSQL smokes changed linked entity names in the World, reconciled idempotently, preserved customized NPC labels and passed full runtime replay verification. The Fantasy browser moved a link from `Scarlet Scout · current at r2` to `Azure Scout · current at r3`, showed the reconciliation event, and retained the result after reload.

Reconciliation is intentionally explicit. World edits do not mutate an active Session in the background. Missing or incompatible NPCs remain auditable and mechanically usable until the GM removes or otherwise resolves them. Multi-node realtime delivery and arbitrary third-party Pack acceptance remain separate gates.
