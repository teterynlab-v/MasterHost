#!/usr/bin/env bash
set -euo pipefail
if [[ $# -ne 2 || "$2" != "--confirm-replace" ]]; then echo "Usage: $0 BACKUP.dump --confirm-replace" >&2; exit 2; fi
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; BACKUP="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
DB_USER="${MASTERHOST_DB_USER:-masterhost}"; DB_NAME="${MASTERHOST_DB_NAME:-masterhost}"
test -s "$BACKUP"; cd "$ROOT"
docker compose exec -T postgres pg_restore --list < "$BACKUP" >/dev/null
docker compose stop api
docker compose exec -T postgres dropdb -U "$DB_USER" --if-exists --force "$DB_NAME"
docker compose exec -T postgres createdb -U "$DB_USER" "$DB_NAME"
docker compose exec -T postgres pg_restore -U "$DB_USER" -d "$DB_NAME" --no-owner --no-privileges --exit-on-error < "$BACKUP"
docker compose start api
for _ in {1..30}; do docker compose exec -T api node -e "fetch('http://127.0.0.1:8080/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" && { echo "Restore completed: $BACKUP"; exit 0; }; sleep 1; done
echo "API did not recover after restore" >&2; exit 1
