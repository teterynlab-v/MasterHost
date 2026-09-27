#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_ID="$$"
PG_A="masterhost-m21-a-$RUN_ID"; PG_B="masterhost-m21-b-$RUN_ID"; SERVER="masterhost-m21-server-$RUN_ID"; IMAGE="masterhost-m21-server:gate-$RUN_ID"
PG_A_PORT="${M21_PG_A_PORT:-55488}"; PG_B_PORT="${M21_PG_B_PORT:-55489}"; API_PORT="${M21_API_PORT:-8261}"; WEB_PORT="${M21_WEB_PORT:-8262}"; CDP_PORT="${M21_CDP_PORT:-9381}"
STATE="${TMPDIR:-/tmp}/masterhost-m21-$RUN_ID.json"; TABLE_STATE="${TMPDIR:-/tmp}/masterhost-m21-table-$RUN_ID.json"; ARCHIVE="${TMPDIR:-/tmp}/masterhost-m21-$RUN_ID.mhgame"; WEB_LOG="${TMPDIR:-/tmp}/masterhost-m21-web-$RUN_ID.log"; WEB_PID=""
cleanup(){
  if [[ -n "$WEB_PID" ]]; then kill "$WEB_PID" 2>/dev/null || true; wait "$WEB_PID" 2>/dev/null || true; fi
  docker rm -f "$SERVER" "$PG_A" "$PG_B" >/dev/null 2>&1 || true
  docker image rm "$IMAGE" >/dev/null 2>&1 || true
  python3 - "$STATE" "$TABLE_STATE" "$ARCHIVE" "$WEB_LOG" <<'PY'
import os,sys
for p in sys.argv[1:]:
    try: os.unlink(p)
    except FileNotFoundError: pass
PY
}
trap cleanup EXIT
cd "$ROOT"
./node_modules/.bin/tsc --noEmit -p tsconfig.json
./node_modules/.bin/vitest run
(cd apps/web && ./node_modules/.bin/vite build)
docker build --target server -t "$IMAGE" . >/dev/null
docker run --rm --name "$PG_A" -e POSTGRES_USER=masterhost -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=masterhost_m21_a -p "$PG_A_PORT:5432" -d postgres:17-alpine >/dev/null
docker run --rm --name "$PG_B" -e POSTGRES_USER=masterhost -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=masterhost_m21_b -p "$PG_B_PORT:5432" -d postgres:17-alpine >/dev/null
for name in "$PG_A" "$PG_B"; do for _ in {1..30}; do docker exec "$name" pg_isready -U masterhost >/dev/null 2>&1 && break; sleep 1; done; docker exec "$name" pg_isready -U masterhost >/dev/null; done
start_server(){
  local pg_port="$1" db="$2"
  docker run --rm -d --name "$SERVER" --add-host=host.docker.internal:host-gateway -p "$API_PORT:8080" -e DATABASE_URL="postgresql://masterhost:masterhost@host.docker.internal:$pg_port/$db" -e MASTERHOST_PLATFORM_KEY=m21-platform -e WORLD_PACK_PATH=worldpacks/gothic-horror "$IMAGE" >/dev/null
  for _ in {1..40}; do curl -sf "http://127.0.0.1:$API_PORT/health" >/dev/null && return; sleep 1; done
  docker logs "$SERVER" >&2; return 1
}
start_server "$PG_A_PORT" masterhost_m21_a
(cd apps/web && exec env VITE_API_URL="http://127.0.0.1:$API_PORT/api" VITE_WS_URL="ws://127.0.0.1:$API_PORT" ./node_modules/.bin/vite --host 127.0.0.1 --port "$WEB_PORT") >"$WEB_LOG" 2>&1 & WEB_PID=$!
for _ in {1..30}; do curl -sf "http://127.0.0.1:$WEB_PORT/?realm=default" >/dev/null && break; sleep 1; done
echo "API gate running; browser acceptance is verified separately through the browser tool."
M21_PHASE=export M21_STATE_FILE="$STATE" M21_ARCHIVE_FILE="$ARCHIVE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m21-acceptance.mjs
docker rm -f "$SERVER" >/dev/null
start_server "$PG_B_PORT" masterhost_m21_b
M21_PHASE=import M21_STATE_FILE="$STATE" M21_ARCHIVE_FILE="$ARCHIVE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m21-acceptance.mjs
M15_PHASE=setup M15_STATE_FILE="$TABLE_STATE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_WS_URL="ws://127.0.0.1:$API_PORT" node scripts/m15-acceptance.mjs
M21_PHASE=table-note M21_STATE_FILE="$STATE" M21_ARCHIVE_FILE="$ARCHIVE" M21_TABLE_STATE_FILE="$TABLE_STATE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m21-acceptance.mjs
M15_PHASE=complete M15_STATE_FILE="$TABLE_STATE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_WS_URL="ws://127.0.0.1:$API_PORT" node scripts/m15-acceptance.mjs
docker rm -f "$SERVER" >/dev/null
start_server "$PG_B_PORT" masterhost_m21_b
M21_PHASE=verify M21_STATE_FILE="$STATE" M21_ARCHIVE_FILE="$ARCHIVE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m21-acceptance.mjs
M15_PHASE=verify M15_STATE_FILE="$TABLE_STATE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_WS_URL="ws://127.0.0.1:$API_PORT" node scripts/m15-acceptance.mjs
cleanup; trap - EXIT
echo "M21 API gate passed: source, tests, image, Advanced composition, two-installation .mhgame, complete table API and restart readback. Separate browser acceptance remains required."
