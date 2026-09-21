#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/backups/masterhost-$(date -u +%Y%m%dT%H%M%SZ).dump}"
DB_USER="${MASTERHOST_DB_USER:-masterhost}"; DB_NAME="${MASTERHOST_DB_NAME:-masterhost}"
mkdir -p "$(dirname "$OUT")"; TMP="$OUT.partial"; rm -f "$TMP"
cd "$ROOT"
docker compose exec -T postgres pg_dump -U "$DB_USER" -d "$DB_NAME" --format=custom --no-owner --no-privileges > "$TMP"
test -s "$TMP"; mv "$TMP" "$OUT"
printf 'Backup written: %s\n' "$OUT"
