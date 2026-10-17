# AWS development stand

Deployment evidence recorded 2026-10-04. This is a development stand; public HTTPS transport and landing acceptance passed.

## Resources and cost

- Account `336540709198`, CLI profile `masterhost`, region `eu-central-1`.
- Resource Group `MasterHost`; resource tags `Project=MasterHost`, `Environment=development`.
- Lightsail `masterhost-dev`, Ubuntu 24.04, `medium_3_0`: 4 GB RAM, 2 vCPU, 80 GB disk. Bundle API quoted USD 24/month at creation.
- Attached static IP `masterhost-dev-ip`: `3.120.125.5`.
- Account-wide Budget `MasterHost-Monthly-USD30`: actual 50/80/100 percent and forecast 100 percent email alerts. This is **not a hard spending cap** or a separate AWS account/project. Additional usage can exceed USD 30.
- No RDS, load balancer, NAT gateway, AWS snapshots or object storage provisioned.

## Runtime and access

The existing PostgreSQL → API → Nginx/web Compose architecture runs with project name `masterhost`. Caddy fronts the local web origin `127.0.0.1:8088`; PostgreSQL and API have no public port. Containers restart automatically and rotate JSON logs. Host has 4 GB swap.

The 2026-10-04 application deployment used commit `88aaf46` at `/opt/masterhost/releases/masterhost-0.1.4-mobile-88aaf46`. Archive SHA256 `044ac2ac257f1ea3c3e481cca927f85e0766b983b7a231dd80a094614acc28a7`; source checksums were verified on the host. API/web Linux images were built from the archive, with web release marker `0.1.4-mobile+88aaf46`. Existing database volume and mode-600 environment/override files were retained. The web deployment below supersedes this web image and the `current` symlink; the API remains on `88aaf46`.

SSH uses `/Users/viktarteteryn/.ssh/masterhost_lightsail_rsa`, user `ubuntu`. Firewall allows TCP 22 only from `150.228.49.21/32` (updated 2026-10-18; update when the operator address changes); 80/443 are public. Bootstrap initially failed because Lightsail ran its wrapper under `sh`; installation was completed explicitly using Bash. Docker, Compose and Caddy are installed and verified; historical cloud-init error is not an application health signal.

Unique database, Realm author and platform secrets live in the remote mode-600 `.env`. Caddy's domain configuration requires demo authentication, then sets an HTTP-only, Secure, SameSite cookie so application Bearer requests remain usable. Local credentials are in `/Users/viktarteteryn/.ssh/masterhost-demo-access.txt` (mode 600), never in this repository. Public authentication and WebSocket upgrade through HTTPS passed after DNS activation. AWS provisioning used temporary root browser credentials; a scoped operator identity remains to be configured.

Temporary operator demo: SSH tunnel `127.0.0.1:8350` → remote `127.0.0.1:8088`. This tunnel is not a public endpoint or an independently managed service.

## Verification

- TypeScript check passed. Production web build passed (existing large-bundle warning remains).
- Full local Vitest: 288 passed, 6 skipped; PostgreSQL suites skipped locally. Release regression separately passed after the final archive option change (5 tests).
- Actual Linux images built; PostgreSQL, API and web healthy.
- Fresh deployed PostgreSQL rehearsal via `scripts/m15-acceptance.mjs` setup: Character, exploration, social action/check, encounter, reward, progression and reconnect passed.
- API restart readback retained World, live Session, player access, private-note isolation and map token; authenticated WebSocket snapshot received after restart.
- Browser loaded Russian landing/catalog and author access enabled the Quick Builder. This does not claim a complete browser gameplay gate.
- Initial archive included `._standard.yaml`, causing Art Set parsing failure. Regression observed failing before correction; archive helper now suppresses macOS metadata and excludes pre-existing `._*` files. Corrected candidate extracted on GNU/Linux with checksum validation and zero sidecars.

## Backup

`masterhost-backup.timer` is active, scheduled daily at 04:00 UTC with up to ten minutes jitter. It atomically replaces `/opt/masterhost/backups/daily.dump`; directory mode 700, current dump mode 600. Manual run succeeded. Restore into isolated database `masterhost_restore_proof` succeeded: 34 tables, one World, Session and Character. Production database was not replaced.

One off-host copy is stored locally at `/Users/viktarteteryn/.ssh/masterhost-backups/2026-10-04.dump`. Scheduled backup currently stays on the same VM and keeps only one dump; automated off-host retention and a full application restore drill remain open.

## Domain gate

Registrar requested by the user is GoDaddy, but authoritative nameservers are `mary.ns.cloudflare.com` and `chance.ns.cloudflare.com`. Add **A `mh` → `3.120.125.5`** in the existing Cloudflare zone, initially DNS-only. Parent nameservers and root/www family-site records must remain unchanged.

After user login, created A `mh` → `3.120.125.5`, DNS-only, TTL Auto, and read it back in Cloudflare and from authoritative nameserver. Existing family-site and mail records were untouched. Caddy obtained a valid Let’s Encrypt certificate. Verified public TLS without bypass, anonymous HTTP 401, authenticated HTTP 200, Secure/HttpOnly cookie, Bearer API access, GM/player private-note isolation and authenticated WSS session snapshot. Browser displayed the Russian landing page and retained World at `https://mh.teterynlab.com/?realm=default&lang=ru`. This is public transport/landing acceptance, not a full human gameplay acceptance gate.

## Session administration rollout

`https://mh.teterynlab.com/?lang=ru#admin` is available. Local isolated PostgreSQL full suite: 302/302 tests, TypeScript and production build passed. Public HTTPS acceptance created a separate named test Campaign: rejected anonymous/player/campaign-GM access; removed participant closed WSS with 1008 and revoked Bearer access; finish invalidated PIN; resume preserved the same table and private notes. The test session was left finished. Public browser administrator login and resume confirmation/result were verified. No existing user session was ended. Detailed behavior and remaining limits: `SESSION_ADMIN.md`.

## Mobile release deployment acceptance — 2026-10-04

- Existing AWS CLI profile `masterhost` was reauthenticated. The official AWS MCP proxy confirmed account `336540709198` before replacing the former SSH source IP with the current operator `/32`. Readback confirmed 80/443 remained unchanged and the scoped SSH update succeeded. No new cloud resources were provisioned.
- Fresh pre-update dump `/opt/masterhost/backups/before-mobile-88aaf46.dump` was restored into isolated database `masterhost_mobile_restore_88aaf46`. Both databases had 34 application tables, one World, three Campaigns/Sessions, two Characters and three participants. Full World-row digest matched (`dc9d2c12bf1befb4099a9cc2af47851e`). Off-host mode-600 copy is `/Users/viktarteteryn/.ssh/masterhost-backups/before-mobile-88aaf46.dump`.
- Immediately after switching containers, those counts and the World digest remained identical. Application acceptance subsequently created dedicated test Campaigns/Sessions and a test Character; these are additions, not evidence of overwritten existing data.
- Public HTTPS checks with certificate verification passed: anonymous 401, authenticated landing/API 200, secure HTTP-only demo cookie, healthy API, exact JS release marker and the retained World. Local Python initially lacked its default CA trust path; the check passed with the system CA bundle, without disabling certificate verification. Caddy and the backup timer remain active.
- Public browser acceptance before the owner's browser preference correction covered GM table, player invitation/Character creation, 390×844 and 844×390 tables without document overflow, live Pack action (charge 12 → 11), GM Nerve check and player 1d20 result 15/success. Nerve 0, Insight 2, Command 1, other resources and inventory were retained in this path. The original zero-value failure remains unreproduced.
- API was restarted with the same database. PostgreSQL readback retained resolved check 15, action events and focus 10 / charge 11 / integrity 18; World digest still matched. Browser player reload showed saved Character context during reconnecting. A complete subsequent player UI reconnect was not accepted after the browser switch.
- At the owner's request, further checks use only Codex's in-app browser. Direct public URL navigation returned `ERR_BLOCKED_BY_CLIENT`; the same deployed origin was checked through the operator-only SSH tunnel `127.0.0.1:8350 → 127.0.0.1:8088`. In-app GM connected successfully and rendered portrait/landscape layouts without document overflow. This tunnel proof is distinct from direct public in-app-browser acceptance, which remains blocked.
- The dedicated public gameplay test Session `f47d9055-4173-46a1-9b0d-7f7e71fbf95c` was finished through the admin API after verification; no pre-existing Session was ended. The in-app GM demo Session remains available.
- GitHub repository exists under `teterynlab-v`, but complete source import/release publication and hosted CI remain pending. In-app GitHub authentication is required to continue; Chrome is no longer used per the owner's instruction.

## Official World cover deployment — 2026-10-18

Deployed at `2026-10-17T20:02:16Z` (2026-10-18 in Asia/Tbilisi), following the owner's request to deploy before pushing to GitHub.

- Web source `9fdef57` replaces the official-library card's hardcoded SVG background with the illustrated universe cover matched by Pack ID. It reuses the universe catalog's checksum-addressed cover URL and selected Realm. Packages without an illustrated collection retain their existing background.
- `/opt/masterhost/current` now points to `/opt/masterhost/releases/masterhost-0.1.4-covers-9fdef57`. Full source archive SHA256: `1ffb4467e1b701818b5cbea9ef58ce98cf3cad95af2676456c878c1d38ca4061`, checked after transfer. Web release marker: `0.1.4-covers+9fdef57`; Linux image: `sha256:6da94942988df4ea936de94c0907b49d2e0c59dfec7fb428c9b523c9a7796d7c`.
- Only `web` was recreated. API and PostgreSQL container IDs, image IDs and start timestamps matched their pre-update snapshots exactly; all three containers were healthy after deployment. The existing environment and Compose overrides were retained, with the web release marker updated.
- Pre-update database backup `/opt/masterhost/backups/before-covers-9fdef57.dump` is 199530 bytes with mode 600; `pg_restore --list` successfully read its inventory. This is backup validation, not a fresh restore drill.
- Public HTTPS served the new JavaScript bundle `/assets/index-CJr0xts7.js` and all twelve WebP covers with matching SHA256 checksums. Anonymous access still returned HTTP 401. The in-app browser checked the deployed HTML, scripts, API and images through an authenticated, read-only loopback proxy to the public HTTPS origin; this was not a locally rebuilt page.
- Local TypeScript and production build passed. Full Vitest rerun with two workers and a 30-second timeout passed 319 tests, with 10 PostgreSQL-gated tests skipped. The default worker run first hit five-second library-fixture timeouts. The new regression test checks Pack-ID matching independent of catalog order, Realm encoding and compatibility fallback.
- Rollback image `masterhost-web:rollback-before-covers-9fdef57` retains `sha256:49b1d205fb0913b91d01edc966a46ccde6316f90519e45c4a03d32e610f30092`. The previous release directory is retained. To roll back the web deployment, retag this image as `masterhost-web:latest`, run the previous release's Compose configuration with `up -d --no-deps --no-build web`, and restore the `current` symlink to the previous directory.
