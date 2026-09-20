# Runtime checkpoints and repair — 2026-09-21

## Decision

The GM can create a runtime checkpoint only when a full replay of version-1 events matches the materialized Actor and Encounter rows. PostgreSQL stores the reconstructed states, last event sequence, and event count. A second verifier starts from the latest checkpoint and replays later events; the original full verifier remains available. The checkpoint and later events are read with materialized rows in one MVCC snapshot. A repeated checkpoint request at the same event sequence returns the existing row.

Checkpoints cover Actor and Encounter state. Pending standalone Checks have their own transactional rows and are not part of runtime replay. A checkpoint is trusted because its complete history was verified when it was created; use full verification to recheck historical events or before a repair.

Repair is an operator command for a finished Session, not a live HTTP action. It replays the entire event history, rejects unsupported or malformed events, and replaces only divergent Actor/Encounter rows. Existing row versions increase so stale commands cannot reuse them. A repair writes an audit row with affected IDs and event count; it does not add a game event because it restores materialized state to the event stream. The command verifies the result after commit. A matching Session produces no mutation or audit row.

Run a preview with `pnpm exec tsx scripts/runtime-repair.mts --session-id <uuid>`. To apply, stop every server using the database first, then run the same command with `--apply`. The transaction checks that the Session is finished and locks runtime event/state tables while it replays and writes; a five-second lock timeout prevents indefinite waiting. This table lock affects all Sessions briefly. The command does not repair pending Checks, character data, World materialization, or invalid game events.

## Evidence and limits

The recovery smoke creates a checkpoint, appends a ResourceChanged event, verifies replay from the checkpoint, corrupts materialized Actor state, confirms both verifiers detect it, repairs a finished Session, checks the audit and readback, then rejects live-Session repair and an unsupported event. Fantasy and Cyberpunk live API smokes create GM-only checkpoints and verify later events from them. PostgreSQL startup migrations are serialized with an advisory lock so two server processes cannot race on the new DDL.

Checkpoint verification does not hash or revalidate events before its sequence. Checkpoint creation and operator repair use full replay. This is a local development recovery path; multi-node realtime delivery and operational backup/restore remain separate work.
