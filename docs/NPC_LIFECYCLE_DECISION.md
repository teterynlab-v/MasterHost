# M2 NPC lifecycle — 2026-09-21

Session NPCs remain instances of validated Pack actor templates. The GM may change the display label and numeric attributes declared by that template while the Session is live. Attribute keys outside the template, non-finite values, and values outside ±1000 are rejected. Resources and effects continue to change only through the generic Action and Encounter engines.

An edit emits `ActorUpdated` and atomically replaces the materialized Actor state with an optimistic version check. Removal emits `ActorRemoved` and deletes the Actor state in the same transaction. Both commands support Session-scoped idempotency receipts and are GM-only. A player Actor cannot use either command. An NPC participating in a live Encounter must first be removed from that Encounter, which keeps Encounter history and turn references valid.

Runtime replay understands both lifecycle events. Full verification and checkpoint-tail verification therefore compare the edited or removed state with PostgreSQL rather than treating lifecycle events as unsupported. Finished Encounters keep their historical Actor IDs after the Actor is removed.

Fantasy and Cyberpunk PostgreSQL smokes edited Pack-declared attributes and labels, exercised idempotency and authorization, rejected removal from a live Encounter, removed the NPC after the Encounter, and passed replay verification. The Fantasy browser edited a Goblin to `Browser Scout`, changed Perception to 5, retained it after reload, then removed it from the actor list. Linked World entity reconciliation is specified separately in `WORLD_LINK_RECONCILIATION_DECISION.md`.
