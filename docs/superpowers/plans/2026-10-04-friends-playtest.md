# Friends playtest and public repository plan

**Goal:** A GM and invited friends can start, play, reconnect and finish a game without operator assistance, with a reproducible public source release.

**Architecture:** Preserve Pack → Descriptor → Compiler → immutable World. Session changes use existing scoped runtime authorization; invitations must never grant author/admin privileges. Browser recovery reads authoritative server snapshots.

**Execution:** Native execution, authorized by the product owner on 2026-10-04. Implement and verify each stage before deployment. A GitHub account connection is needed only for publication.

## Acceptance and order

- [ ] Session recovery: finished GM/player screens, no misleading Continue label, next live session in the same Campaign, fallback refresh without WebSocket events. Tests, browser and public stand proof required.
- [ ] Friend access: scoped invitation entry without the stand's shared password; name → Character → table, returning player does not duplicate membership. Expired/revoked invitations cannot enter. Preserve anonymous author/admin restrictions before changing the reverse-proxy gate.
- [ ] Presence: distinguish authorized membership from measured online presence; reconnect grace, no automatic kicking of quiet players; GM disconnect does not destroy the game. Verify abrupt connection loss and recovery.
- [ ] Feedback: explicit user submission with release version and technical failure context; exclude credentials, private notes and other players' personal data; no outbound reporting until submitted.
- [ ] Table comfort: GM search/favorites/current scene notes and player map/Character/dice; responsive and keyboard checks. Review layouts before changing the approved visual structure.
- [ ] Safe actions: define reversible action types, authorization and audit trail; prevent retry duplication. Do not claim arbitrary history rollback.
- [ ] Campaign return: persisted recap with GM/player visibility boundaries.
- [ ] Operations: retained off-host backups and isolated full restore drill; preserve the $30 monthly cost objective.
- [ ] Human acceptance: a complete game with GM and friends, observed usability failures, native language review. Automated tests do not substitute for this evidence.
- [ ] Publication: clean source inventory, checksummed portable archive, installation/contribution/security docs and CI. Publish under `teterynlab-v` only after verified connection. Keep current PolyForm terms until a specific replacement license is agreed.

## Review focus

Two tabs joining simultaneously; stale join links; server restart during an action; revoked participant reconnecting; finished session with no selected Character. Each owning stage must include a regression test or a witnessed runtime scenario for these inputs.

## Current state

Session recovery changes are local. No new public release is claimed by this plan. GitHub connector initially reports `teterynlab`; the owner requested `teterynlab-v` and will connect it.
