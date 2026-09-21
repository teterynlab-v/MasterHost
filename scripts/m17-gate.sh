#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTAINER="masterhost-m17-gate-$$"
PG_PORT="${M17_PG_PORT:-55477}"
API_PORT="${M17_API_PORT:-8211}"
WEB_PORT="${M17_WEB_PORT:-8212}"
CDP_PORT="${M17_CDP_PORT:-9367}"
STATE_FILE="${TMPDIR:-/tmp}/masterhost-m17-gate-$$.json"
SERVER_LOG="${TMPDIR:-/tmp}/masterhost-m17-server-$$.log"
WEB_LOG="${TMPDIR:-/tmp}/masterhost-m17-web-$$.log"
SERVER_PID=""
WEB_PID=""
cleanup(){
  if [[ -n "$WEB_PID" ]]; then kill "$WEB_PID" 2>/dev/null || true; wait "$WEB_PID" 2>/dev/null || true; fi
  if [[ -n "$SERVER_PID" ]]; then kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; fi
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  rm -f "$STATE_FILE" "$SERVER_LOG" "$WEB_LOG"
}
trap cleanup EXIT
cd "$ROOT"
./node_modules/.bin/tsc --noEmit -p tsconfig.json
./node_modules/.bin/vitest run
(cd apps/web && ./node_modules/.bin/vite build)
docker run --rm --name "$CONTAINER" -e POSTGRES_USER=masterhost -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=masterhost_m17 -p "$PG_PORT:5432" -d postgres:17-alpine >/dev/null
for _ in {1..30}; do docker exec "$CONTAINER" pg_isready -U masterhost -d masterhost_m17 >/dev/null 2>&1 && break; sleep 1; done
docker exec "$CONTAINER" pg_isready -U masterhost -d masterhost_m17 >/dev/null
DATABASE_URL="postgresql://masterhost:masterhost@127.0.0.1:$PG_PORT/masterhost_m17"
start_server(){
  DATABASE_URL="$DATABASE_URL" PORT="$API_PORT" MASTERHOST_PLATFORM_KEY=m17-platform WORLD_PACK_PATH=worldpacks/classic-fantasy-test ./node_modules/.bin/tsx apps/server/src/index.ts >"$SERVER_LOG" 2>&1 & SERVER_PID=$!
  for _ in {1..30}; do curl -sf "http://127.0.0.1:$API_PORT/health" >/dev/null && return; sleep 1; done
  cat "$SERVER_LOG" >&2
  return 1
}
start_server
M17_STATE_FILE="$STATE_FILE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m17-acceptance.mjs
(cd apps/web && exec env VITE_API_URL="http://127.0.0.1:$API_PORT/api" VITE_WS_URL="ws://127.0.0.1:$API_PORT" ./node_modules/.bin/vite --host 127.0.0.1 --port "$WEB_PORT") >"$WEB_LOG" 2>&1 & WEB_PID=$!
for _ in {1..30}; do curl -sf "http://127.0.0.1:$WEB_PORT/?realm=default" >/dev/null && break; sleep 1; done
PROJECT_ID="$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.argv[1])).projectId)" "$STATE_FILE")"
M17_WEB_URL="http://127.0.0.1:$WEB_PORT" M17_CDP_PORT="$CDP_PORT" M17_PROJECT_ID="$PROJECT_ID" node scripts/m17-browser-acceptance.mjs
kill "$SERVER_PID"
wait "$SERVER_PID" 2>/dev/null || true
SERVER_PID=""
start_server
M17_PHASE=verify M17_STATE_FILE="$STATE_FILE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m17-acceptance.mjs
FINAL_SERVER_PID="$SERVER_PID"
FINAL_WEB_PID="$WEB_PID"
cleanup
trap - EXIT
if kill -0 "$FINAL_SERVER_PID" 2>/dev/null || kill -0 "$FINAL_WEB_PID" 2>/dev/null || docker inspect "$CONTAINER" >/dev/null 2>&1; then
  echo "M17 gate cleanup left a child resource running." >&2
  exit 1
fi
echo "M17 gate passed: typecheck, tests, production build, clean PostgreSQL API/restart and headless browser catalog/Pack Creator acceptance."
