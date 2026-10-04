# Friends playtest release preparation — 2026-10-04

## Source changes

- Finished/cancelled sessions show an explicit ended screen to GM and players, including players who have not yet selected a Character. Campaign, World and prior table data are preserved.
- The GM can create a new live session in the same Campaign without clearing authorization and becoming stuck on the opening screen. This is a new session, not automatic migration of the old table's runtime state.
- Authoritative session snapshots are refreshed every five seconds alongside WebSocket events. Polling does not overlap or apply a late response after cleanup.
- Saved World cards no longer imply that the first World has a resumable Session.
- Shared invitations preserve the GM's selected language.
- The feedback form is available in all six UI languages. It downloads a local JSON report containing only description, version, locale and a whitelisted screen name. URL, query, automatic logs, credentials and private notes are not collected. User-entered text must be reviewed before sharing; it is not automatically redacted or sent.
- GitHub verification workflow uses Node 22, pinned pnpm, PostgreSQL 17, typecheck, tests and frontend build. A bug template and security-reporting instructions are included.

## Verification

TypeScript and production frontend build pass. Full local suite: **302 passed, 10 PostgreSQL-gated tests skipped**. Eight session lifecycle tests and two feedback-report tests cover the new behavior. Invitation language regression was observed failing before the fix.

Browser: the local frontend loaded with its API unavailable; feedback remained accessible, blank submission was disabled, and entering a description produced `masterhost-feedback.json` in Downloads. The downloaded report was read back and contained the expected locale, description, screen and development version. This proves feedback export, not gameplay or session recovery against a running backend.

GitHub workflow YAML parses and has read-only repository permissions. It has not run in GitHub Actions. Credential-signature scan of current tracked/unignored source found no AWS access-key identifiers, private keys or GitHub token signatures; this is a limited scan, not a complete security audit.

The Vite bundle warning remains: main JavaScript is approximately 4.7 MB before compression. Loading less content at startup should be addressed in the next performance stage.

## Deployment/publication gate

No new deployment or GitHub release has occurred. AWS credentials expired and SSH allows the former operator IP. CLI reauthentication was opened; the authorization response is pending. Docker daemon is unavailable, so clean PostgreSQL and extracted-release Docker build checks remain pending.

GitHub connector reports `teterynlab`. The product owner selected `teterynlab-v` and will connect that account. Do not publish to the other account. Repository creation, remote push, CI completion and release upload each require actual verification.

For production builds, pass `--build-arg VITE_RELEASE_VERSION=<release>` when building the web image; otherwise reports truthfully use `development`.

The remaining accepted product work is tracked in [the friends playtest plan](superpowers/plans/2026-10-04-friends-playtest.md). Scoped password-free invitations, measured presence, table refinements, reversible actions, retained off-host backup and human playtest acceptance are still open. Current code license remains PolyForm Noncommercial; this preparation does not change it.
