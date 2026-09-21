# Standalone Check recovery — 2026-09-21

## Decision

Standalone `CheckRequested`, `DiceRolled`, and `CheckResolved` events reconstruct pending and resolved Check rows. Action-scoped Check rolls have an `actionId` and are outside this projection. Replay rejects duplicate requests or rolls, a resolution without its roll, a partial roll/resolution pair, contradictory totals or outcomes, unsupported event schemas, and out-of-order events. Verification reads the Session's events and Check rows in one PostgreSQL MVCC snapshot and reports mismatched Check IDs and replay issues. Only the GM can call `GET /api/sessions/:id/runtime/verify-checks`.

The offline `scripts/check-repair.mts --session-id <uuid>` previews discrepancies. Run with `--apply` only after every server using the database has stopped. Apply requires a finished Session, locks game events and Check rows with a five-second timeout, restores missing or divergent rows, removes extra rows, verifies the result inside the transaction, and writes an audit record. A matching Session is a no-op. Invalid event history blocks repair. This is a separate projection from Actor/Encounter repair; operators should preview both and handle each independently.

## Evidence and limits

The unit tests cover pending and resolved replay, Action-event separation, and malformed streams. The live PostgreSQL recovery smoke corrupts a pending Check, deletes a resolved Check, adds an extra row, detects all three, repairs and verifies the result, checks its audit and no-op path, then rejects live-Session repair and an incomplete event stream. Both Pack API smokes verify the GM endpoint against actual Check activity; the Fantasy smoke also rejects unauthenticated verification.

Verification compares IDs, status, request/resolution JSON, and Check columns. Database `created_at` and `resolved_at` are not compared because existing rows were written with database transaction timestamps that can differ from the event timestamps; repair uses event timestamps when it rewrites a row. Event payloads are treated as the source of truth, so compromised events require a separate backup or forensic path. Repair blocks writes across Sessions briefly and is intended for stopped-server maintenance, not live self-healing or multi-node delivery.
