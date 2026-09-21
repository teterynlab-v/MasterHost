#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_ID="$$"
PG_A="masterhost-m18-a-$RUN_ID"; PG_B="masterhost-m18-b-$RUN_ID"; SERVER="masterhost-m18-server-$RUN_ID"; IMAGE="masterhost-m18-server:gate-$RUN_ID"
PG_A_PORT="${M18_PG_A_PORT:-55478}"; PG_B_PORT="${M18_PG_B_PORT:-55479}"; API_PORT="${M18_API_PORT:-8221}"; WEB_PORT="${M18_WEB_PORT:-8222}"; CDP_PORT="${M18_CDP_PORT:-9368}"
STATE="${TMPDIR:-/tmp}/masterhost-m18-$RUN_ID.json"; TABLE_STATE="${TMPDIR:-/tmp}/masterhost-m18-table-$RUN_ID.json"; ARCHIVE="${TMPDIR:-/tmp}/masterhost-m18-$RUN_ID.mhgame"; WEB_LOG="${TMPDIR:-/tmp}/masterhost-m18-web-$RUN_ID.log"; WEB_PID=""
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
docker run --rm --name "$PG_A" -e POSTGRES_USER=masterhost -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=masterhost_m18_a -p "$PG_A_PORT:5432" -d postgres:17-alpine >/dev/null
docker run --rm --name "$PG_B" -e POSTGRES_USER=masterhost -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=masterhost_m18_b -p "$PG_B_PORT:5432" -d postgres:17-alpine >/dev/null
for name in "$PG_A" "$PG_B"; do for _ in {1..30}; do docker exec "$name" pg_isready -U masterhost >/dev/null 2>&1 && break; sleep 1; done; docker exec "$name" pg_isready -U masterhost >/dev/null; done
start_server(){
  local pg_port="$1" db="$2"
  docker run --rm -d --name "$SERVER" --add-host=host.docker.internal:host-gateway -p "$API_PORT:8080" -e DATABASE_URL="postgresql://masterhost:masterhost@host.docker.internal:$pg_port/$db" -e MASTERHOST_PLATFORM_KEY=m18-platform -e WORLD_PACK_PATH=worldpacks/classic-fantasy "$IMAGE" >/dev/null
  for _ in {1..40}; do curl -sf "http://127.0.0.1:$API_PORT/health" >/dev/null && return; sleep 1; done
  docker logs "$SERVER" >&2; return 1
}
start_server "$PG_A_PORT" masterhost_m18_a
(cd apps/web && exec env VITE_API_URL="http://127.0.0.1:$API_PORT/api" VITE_WS_URL="ws://127.0.0.1:$API_PORT" ./node_modules/.bin/vite --host 127.0.0.1 --port "$WEB_PORT") >"$WEB_LOG" 2>&1 & WEB_PID=$!
for _ in {1..30}; do curl -sf "http://127.0.0.1:$WEB_PORT/?realm=default" >/dev/null && break; sleep 1; done
M18_WEB_URL="http://127.0.0.1:$WEB_PORT" M18_CDP_PORT="$CDP_PORT" node scripts/m18-browser-acceptance.mjs
M18_PHASE=export M18_STATE_FILE="$STATE" M18_ARCHIVE_FILE="$ARCHIVE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m18-acceptance.mjs
docker rm -f "$SERVER" >/dev/null
start_server "$PG_B_PORT" masterhost_m18_b
M18_PHASE=import M18_STATE_FILE="$STATE" M18_ARCHIVE_FILE="$ARCHIVE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m18-acceptance.mjs
M15_PHASE=setup M15_STATE_FILE="$TABLE_STATE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_WS_URL="ws://127.0.0.1:$API_PORT" node scripts/m15-acceptance.mjs
M15_STATE_FILE="$TABLE_STATE" M15_WEB_URL="http://127.0.0.1:$WEB_PORT" M15_CDP_PORT="$((CDP_PORT+1))" node scripts/m15-browser-acceptance.mjs
M15_PHASE=complete M15_STATE_FILE="$TABLE_STATE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_WS_URL="ws://127.0.0.1:$API_PORT" node scripts/m15-acceptance.mjs
docker rm -f "$SERVER" >/dev/null
start_server "$PG_B_PORT" masterhost_m18_b
M18_PHASE=verify M18_STATE_FILE="$STATE" M18_ARCHIVE_FILE="$ARCHIVE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m18-acceptance.mjs
M15_PHASE=verify M15_STATE_FILE="$TABLE_STATE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_WS_URL="ws://127.0.0.1:$API_PORT" node scripts/m15-acceptance.mjs
cleanup; trap - EXIT
echo "M18 gate passed: source, tests, image, catalog/Quick browser, Advanced composition, two-installation .mhgame, complete table browser/API and restart readback."
