#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTAINER="masterhost-m9-gate-$$"
PG_PORT="${M9_PG_PORT:-55449}"
API_PORT="${M9_API_PORT:-8131}"
WEB_PORT="${M9_WEB_PORT:-8132}"
CDP_PORT="${M9_CDP_PORT:-9339}"
STATE_FILE="${TMPDIR:-/tmp}/masterhost-m9-gate-$$.json"
SERVER_LOG="${TMPDIR:-/tmp}/masterhost-m9-server-$$.log"
WEB_LOG="${TMPDIR:-/tmp}/masterhost-m9-web-$$.log"
SERVER_PID=""
WEB_PID=""

cleanup(){
  if [[ -n "$WEB_PID" ]]; then kill "$WEB_PID" 2>/dev/null || true; wait "$WEB_PID" 2>/dev/null || true; fi
  if [[ -n "$SERVER_PID" ]]; then kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; fi
  rm -f "$STATE_FILE" "$SERVER_LOG" "$WEB_LOG"
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

cd "$ROOT"
./node_modules/.bin/tsc --noEmit -p tsconfig.json
./node_modules/.bin/vitest run
(cd apps/web && ../../node_modules/.bin/vite build)

docker run --rm --name "$CONTAINER" -e POSTGRES_USER=masterhost -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=masterhost_m9 -p "$PG_PORT:5432" -d postgres:17-alpine >/dev/null
for _ in {1..30}; do docker exec "$CONTAINER" pg_isready -U masterhost -d masterhost_m9 >/dev/null 2>&1 && break; sleep 1; done
docker exec "$CONTAINER" pg_isready -U masterhost -d masterhost_m9 >/dev/null

start_server(){
  DATABASE_URL="postgresql://masterhost:masterhost@127.0.0.1:$PG_PORT/masterhost_m9" PORT="$API_PORT" MASTERHOST_PLATFORM_KEY=m9-platform WORLD_PACK_PATH=worldpacks/classic-fantasy npm exec -- tsx apps/server/src/index.ts >"$SERVER_LOG" 2>&1 &
  SERVER_PID=$!
  for _ in {1..30}; do curl -sf "http://127.0.0.1:$API_PORT/health" >/dev/null && return; sleep 1; done
  cat "$SERVER_LOG" >&2
  return 1
}

start_server
M9_STATE_FILE="$STATE_FILE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_PLATFORM_KEY=m9-platform node scripts/m9-acceptance.mjs
kill "$SERVER_PID"; wait "$SERVER_PID" 2>/dev/null || true; SERVER_PID=""
start_server
M9_PHASE=verify M9_STATE_FILE="$STATE_FILE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_PLATFORM_KEY=m9-platform node scripts/m9-acceptance.mjs
(cd apps/web && exec env VITE_API_URL="http://127.0.0.1:$API_PORT/api" VITE_WS_URL="ws://127.0.0.1:$API_PORT" ../../node_modules/.bin/vite --host 127.0.0.1 --port "$WEB_PORT") >"$WEB_LOG" 2>&1 &
WEB_PID=$!
for _ in {1..30}; do curl -sf "http://127.0.0.1:$WEB_PORT/?realm=m9-advanced" >/dev/null && break; sleep 1; done
if ! curl -sf "http://127.0.0.1:$WEB_PORT/?realm=m9-advanced" >/dev/null; then cat "$WEB_LOG" >&2; exit 1; fi
M9_STATE_FILE="$STATE_FILE" M9_WEB_URL="http://127.0.0.1:$WEB_PORT" M9_CDP_PORT="$CDP_PORT" node scripts/m9-browser-acceptance.mjs
echo "M9 gate passed: source checks, clean PostgreSQL acceptance, restart readback and headless browser acceptance."
