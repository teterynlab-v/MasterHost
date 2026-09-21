#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTAINER="masterhost-m11-gate-$$"
PG_PORT="${M11_PG_PORT:-55452}"
API_PORT="${M11_API_PORT:-8151}"
WEB_PORT="${M11_WEB_PORT:-8152}"
CDP_PORT="${M11_CDP_PORT:-9341}"
STATE_FILE="${TMPDIR:-/tmp}/masterhost-m11-gate-$$.json"
SERVER_LOG="${TMPDIR:-/tmp}/masterhost-m11-server-$$.log"
WEB_LOG="${TMPDIR:-/tmp}/masterhost-m11-web-$$.log"
SERVER_PID=""; WEB_PID=""
cleanup(){ if [[ -n "$WEB_PID" ]]; then kill "$WEB_PID" 2>/dev/null || true; wait "$WEB_PID" 2>/dev/null || true; fi; if [[ -n "$SERVER_PID" ]]; then kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; fi; rm -f "$STATE_FILE" "$SERVER_LOG" "$WEB_LOG"; docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; WEB_PID=""; SERVER_PID=""; }
trap cleanup EXIT
cd "$ROOT"
./node_modules/.bin/tsc --noEmit -p tsconfig.json
./node_modules/.bin/vitest run
(cd apps/web && ./node_modules/.bin/vite build)
docker run --rm --name "$CONTAINER" -e POSTGRES_USER=masterhost -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=masterhost_m11 -p "$PG_PORT:5432" -d postgres:17-alpine >/dev/null
for _ in {1..30}; do docker exec "$CONTAINER" pg_isready -U masterhost -d masterhost_m11 >/dev/null 2>&1 && break; sleep 1; done
docker exec "$CONTAINER" pg_isready -U masterhost -d masterhost_m11 >/dev/null
DATABASE_URL="postgresql://masterhost:masterhost@127.0.0.1:$PG_PORT/masterhost_m11"
start_server(){ DATABASE_URL="$DATABASE_URL" PORT="$API_PORT" MASTERHOST_PLATFORM_KEY=m11-platform WORLD_PACK_PATH=worldpacks/space-opera ./node_modules/.bin/tsx apps/server/src/index.ts >"$SERVER_LOG" 2>&1 & SERVER_PID=$!; for _ in {1..30}; do curl -sf "http://127.0.0.1:$API_PORT/health" >/dev/null && return; sleep 1; done; cat "$SERVER_LOG" >&2; return 1; }
start_server
M11_STATE_FILE="$STATE_FILE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_PLATFORM_KEY=m11-platform node scripts/m11-acceptance.mjs
kill "$SERVER_PID"; wait "$SERVER_PID" 2>/dev/null || true; SERVER_PID=""; start_server
M11_PHASE=verify M11_STATE_FILE="$STATE_FILE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_PLATFORM_KEY=m11-platform node scripts/m11-acceptance.mjs
(cd apps/web && exec env VITE_API_URL="http://127.0.0.1:$API_PORT/api" VITE_WS_URL="ws://127.0.0.1:$API_PORT" ./node_modules/.bin/vite --host 127.0.0.1 --port "$WEB_PORT") >"$WEB_LOG" 2>&1 & WEB_PID=$!
for _ in {1..30}; do curl -sf "http://127.0.0.1:$WEB_PORT/?realm=m11-assets" >/dev/null && break; sleep 1; done
if ! curl -sf "http://127.0.0.1:$WEB_PORT/?realm=m11-assets" >/dev/null; then cat "$WEB_LOG" >&2; exit 1; fi
M11_STATE_FILE="$STATE_FILE" M11_WEB_URL="http://127.0.0.1:$WEB_PORT" M11_CDP_PORT="$CDP_PORT" node scripts/m11-browser-acceptance.mjs
FINAL_SERVER_PID="$SERVER_PID"; FINAL_WEB_PID="$WEB_PID"; cleanup; trap - EXIT
if kill -0 "$FINAL_SERVER_PID" 2>/dev/null || kill -0 "$FINAL_WEB_PID" 2>/dev/null; then echo "M11 gate cleanup left a child process running." >&2; exit 1; fi
if docker inspect "$CONTAINER" >/dev/null 2>&1; then echo "M11 gate cleanup left the PostgreSQL container running." >&2; exit 1; fi
echo "M11 gate passed: source checks, full tests, production web build, clean PostgreSQL acceptance, restart media readback, headless browser acceptance and cleanup."
