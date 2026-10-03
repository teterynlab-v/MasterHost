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

Release application source is commit `57b843e`, deployed at `/opt/masterhost/releases/masterhost-0.1.0-57b843e`; `/opt/masterhost/current` points there. macOS-generated AppleDouble sidecars were removed before the successful Linux image rebuild; actual application files match the release checksum manifest. Packaging correction is in the accompanying source commit, not a new deployed application version.

SSH uses `/Users/viktarteteryn/.ssh/masterhost_lightsail_rsa`, user `ubuntu`. Firewall allows TCP 22 only from `150.228.49.182/32` (update when the operator address changes); 80/443 are public. Bootstrap initially failed because Lightsail ran its wrapper under `sh`; installation was completed explicitly using Bash. Docker, Compose and Caddy are installed and verified; historical cloud-init error is not an application health signal.

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
