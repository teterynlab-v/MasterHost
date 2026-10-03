# Session administration

The Realm administrator can inspect the latest 100 sessions, remove a participant, finish a session without deleting its Campaign/World, and explicitly resume the same saved session. Open **Advanced tools → Session administration** on the home page, or `#admin`. The existing Realm administrator access is required; campaign GM and player credentials do not grant this access. Labels are authored in all six UI languages.

## Behavior

- Each card shows campaign name, lifecycle state, active participant records, last recorded activity and current join code. These are database records, not online-presence measurements. Quiet sessions are not automatically killed.
- Disconnect marks the participant as departed, revokes their token and closes their local connected socket. Characters and runtime actor history remain saved. Removed players do not regain authorization when a session resumes.
- Finish closes the join code and marks the session finished. It does not delete the World, Campaign, Characters, table, exploration board, journal or encounter data.
- Resume is an explicit administrator exception to normal terminal lifecycle transitions: it reopens the same finished session with a newly allocated code valid for six hours. GM campaign authorization and remaining participants remain valid. Cancelled sessions are not resumed.
- Operations require confirmation in a keyboard-accessible native dialog. They lock the session row, check the observed state, scope all lookups to the authenticated Realm and record `SessionAdminOperation` in the durable event stream. A stale state returns 409. No arbitrary deletion endpoint exists.
- Existing client reconnection and saved GM access remain in use. The panel does not issue replacement GM credentials or assign another person as master.

## Evidence (2026-10-04)

- Full Vitest with isolated PostgreSQL: 302/302 passed, including four route tests and four repository scenarios. TypeScript and production frontend build passed.
- Repository proof: cross-Realm listing/mutation denial, stale-state denial, participant access revoked, closed PIN not resolved, same table/private notes retained after resume, durable audit entries, removed player remains revoked.
- Clean API rehearsal passed Character, exploration, social/check/action, encounter, reward, progression and reconnect before administration. Real API rejected anonymous, player and campaign GM admin reads.
- Browser verification covers administrator login, participant removal confirmation and result, session finish and resume. Public AWS verification is recorded in `AWS_STAND.md` after rollout.

## Remaining limits

This is a Realm operations panel, not a cross-account super-admin. Listing is limited to the latest 100 sessions; no pagination yet. Last activity does not prove that a person is online or disconnected. No automatic session termination, host failover, GM succession or automatic reassignment is introduced. Cross-process participant access is revoked in PostgreSQL; immediate socket closure is local to the receiving API process, matching the existing GM removal path.
