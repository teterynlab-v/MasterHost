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

Release candidate `masterhost-0.1.4-mobile.tar.gz` contains application source `88aaf46`. SHA256: `044ac2ac257f1ea3c3e481cca927f85e0766b983b7a231dd80a094614acc28a7`. All 3495 extracted file checksums and 197 dependency licenses were independently checked. Final source passed TypeScript, production build and 327 tests on a fresh PostgreSQL database with no skips.

Both API and web Docker images were built from the extracted candidate. An isolated Compose project `masterhost-mobile-release-proof` started with a new PostgreSQL volume; all three containers became healthy. The existing M15 setup rehearsal passed through Character, exploration, social, action/check, encounter, reward, progression and reconnect via its Nginx origin. This closes the local extracted-release build/runtime gate, not the public deployment gate.

No new hosted deployment has occurred. SSH to the existing instance timed out; its allowlist contains the former operator IP. Current operator IP is `150.228.49.109`. The official MCP proxy using profile `masterhost` reported that its refresh token had expired. A fresh CLI login was opened and is awaiting browser authentication. Production firewall, stack, data and secrets have not been changed in this release attempt.

The GitHub connector still reports `teterynlab`, but the browser authenticated as the chosen account `teterynlab-v`. Created the public repository [teterynlab-v/MasterHost](https://github.com/teterynlab-v/MasterHost) with an initial README and prepared a prerelease draft. Complete source/archive upload, Git source import, CI completion and release publication remain pending. The browser extension rejected the archive file upload because file-URL access is disabled; no archive was uploaded. The release notes explicitly distinguish the future complete application asset from the current README-only branch/tag.

For production builds, pass `--build-arg VITE_RELEASE_VERSION=<release>` when building the web image; otherwise reports truthfully use `development`.

The remaining accepted product work is tracked in [the friends playtest plan](superpowers/plans/2026-10-04-friends-playtest.md). Scoped password-free invitations, measured presence, table refinements, reversible actions, retained off-host backup and human playtest acceptance are still open. Current code license remains PolyForm Noncommercial; this preparation does not change it.

## Deployment follow-up — 2026-10-04

The AWS access gate was resolved and application source `88aaf46` was deployed as `0.1.4-mobile+88aaf46` with the existing database/authentication retained. Fresh backup restore, unchanged World digest, public HTTPS/API and GM/player mobile gameplay checks passed; exact evidence and remaining in-app direct-navigation/reconnect limits are in `AWS_STAND.md`. Repository `teterynlab-v/MasterHost` still contains its initial README; the prerelease draft has no uploaded complete-source asset. Chrome use was stopped at the owner's request. Publication now awaits login to `teterynlab-v` in the in-app browser or an appropriately authenticated GitHub connector; no additional Chrome extension permission is needed.
