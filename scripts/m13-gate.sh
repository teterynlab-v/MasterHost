#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; CONTAINER="masterhost-m13-gate-$$"; PG_PORT="${M13_PG_PORT:-55464}"; API_PORT="${M13_API_PORT:-8171}"; WEB_PORT="${M13_WEB_PORT:-8172}"; CDP_PORT="${M13_CDP_PORT:-9352}"
STATE_FILE="${TMPDIR:-/tmp}/masterhost-m13-gate-$$.json"; SERVER_LOG="${TMPDIR:-/tmp}/masterhost-m13-server-$$.log"; WEB_LOG="${TMPDIR:-/tmp}/masterhost-m13-web-$$.log"; SERVER_PID=""; WEB_PID=""
cleanup(){ if [[ -n "$WEB_PID" ]]; then kill "$WEB_PID" 2>/dev/null || true; wait "$WEB_PID" 2>/dev/null || true; fi; if [[ -n "$SERVER_PID" ]]; then kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; fi; rm -f "$STATE_FILE" "$SERVER_LOG" "$WEB_LOG"; docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; WEB_PID=""; SERVER_PID=""; }
trap cleanup EXIT; cd "$ROOT"
./node_modules/.bin/tsc --noEmit -p tsconfig.json
./node_modules/.bin/vitest run
(cd apps/web && ./node_modules/.bin/vite build)
docker run --rm --name "$CONTAINER" -e POSTGRES_USER=masterhost -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=masterhost_m13 -p "$PG_PORT:5432" -d postgres:17-alpine >/dev/null
for _ in {1..30}; do docker exec "$CONTAINER" pg_isready -U masterhost -d masterhost_m13 >/dev/null 2>&1 && break; sleep 1; done
docker exec "$CONTAINER" pg_isready -U masterhost -d masterhost_m13 >/dev/null
DATABASE_URL="postgresql://masterhost:masterhost@127.0.0.1:$PG_PORT/masterhost_m13"
TEST_DATABASE_URL="$DATABASE_URL" ./node_modules/.bin/vitest run tests/m10-game-descriptor-repository.test.ts tests/m6-pack-project-repository.test.ts
start_server(){ DATABASE_URL="$DATABASE_URL" PORT="$API_PORT" MASTERHOST_PLATFORM_KEY=m13-platform WORLD_PACK_PATH=worldpacks/space-opera ./node_modules/.bin/tsx apps/server/src/index.ts >"$SERVER_LOG" 2>&1 & SERVER_PID=$!; for _ in {1..30}; do curl -sf "http://127.0.0.1:$API_PORT/health" >/dev/null && return; sleep 1; done; cat "$SERVER_LOG" >&2; return 1; }
start_server
M13_STATE_FILE="$STATE_FILE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_PLATFORM_KEY=m13-platform node scripts/m13-acceptance.mjs
kill "$SERVER_PID"; wait "$SERVER_PID" 2>/dev/null || true; SERVER_PID=""; start_server
M13_PHASE=verify M13_STATE_FILE="$STATE_FILE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_PLATFORM_KEY=m13-platform node scripts/m13-acceptance.mjs
(cd apps/web && exec env VITE_API_URL="http://127.0.0.1:$API_PORT/api" VITE_WS_URL="ws://127.0.0.1:$API_PORT" ./node_modules/.bin/vite --host 127.0.0.1 --port "$WEB_PORT") >"$WEB_LOG" 2>&1 & WEB_PID=$!
for _ in {1..30}; do curl -sf "http://127.0.0.1:$WEB_PORT/?realm=m13-browser" >/dev/null && break; sleep 1; done
if ! curl -sf "http://127.0.0.1:$WEB_PORT/?realm=m13-browser" >/dev/null; then cat "$WEB_LOG" >&2; exit 1; fi
M13_STATE_FILE="$STATE_FILE" M13_WEB_URL="http://127.0.0.1:$WEB_PORT" M13_CDP_PORT="$CDP_PORT" node scripts/m13-browser-acceptance.mjs
FINAL_SERVER_PID="$SERVER_PID"; FINAL_WEB_PID="$WEB_PID"; cleanup; trap - EXIT
if kill -0 "$FINAL_SERVER_PID" 2>/dev/null || kill -0 "$FINAL_WEB_PID" 2>/dev/null || docker inspect "$CONTAINER" >/dev/null 2>&1; then echo "M13 gate cleanup left a child resource running." >&2; exit 1; fi
echo "M13 gate passed: typecheck, all tests, production build, clean PostgreSQL API/restart acceptance, full-custom headless browser acceptance and cleanup."
