# Operations and recovery

## Health and diagnostics

`./scripts/diagnose.sh` checks Compose state, PostgreSQL readiness, the internal API, the public proxy and the browser shell. It does not print configured passwords or tokens.

```bash
docker compose ps
docker compose logs --tail=200 api
docker compose logs --tail=200 web
docker compose logs --tail=200 postgres
```

## Backup

```bash
./scripts/backup.sh
./scripts/backup.sh /secure/location/masterhost.dump
```

The script writes a PostgreSQL custom-format dump through a temporary file and publishes it only after `pg_dump` succeeds. Backups contain private campaign, Character and Session data. Store them as secrets.

## Restore

```bash
./scripts/restore.sh /secure/location/masterhost.dump --confirm-replace
```

Restore validates the archive, stops API writes, replaces the configured database, starts the API and waits for health. It is destructive and requires the exact confirmation flag.

## Failure handling

- Database unhealthy: inspect PostgreSQL logs; verify free disk and `.env` values.
- API unhealthy: inspect API logs; migration or Pack validation failures appear before the listener starts.
- Browser healthy but actions fail: run diagnostics, then inspect API logs and the browser network panel.
- Upgrade failure: retain logs, restore the backup on the earlier source version, and verify an existing World and Session.

PostgreSQL is authoritative for Worlds, Packs, Campaigns, Characters, Sessions and runtime events. `.mhgame` transfers authored games; it does not replace an operational backup for active play history.
