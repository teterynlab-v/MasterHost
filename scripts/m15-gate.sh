#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; CONTAINER="masterhost-m15-gate-$$"; PG_PORT="${M15_PG_PORT:-55475}"; API_PORT="${M15_API_PORT:-8191}"; WEB_PORT="${M15_WEB_PORT:-8192}"; CDP_PORT="${M15_CDP_PORT:-9355}"
STATE="${TMPDIR:-/tmp}/masterhost-m15-state-$$.json"; SERVER_LOG="${TMPDIR:-/tmp}/masterhost-m15-server-$$.log"; WEB_LOG="${TMPDIR:-/tmp}/masterhost-m15-web-$$.log"; SERVER_PID=""; WEB_PID=""
cleanup(){ [[ -z "$WEB_PID" ]] || { kill "$WEB_PID" 2>/dev/null || true; wait "$WEB_PID" 2>/dev/null || true; }; [[ -z "$SERVER_PID" ]] || { kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; }; docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; rm -f "$STATE" "$SERVER_LOG" "$WEB_LOG"; }
trap cleanup EXIT; cd "$ROOT"; ./node_modules/.bin/tsc --noEmit -p tsconfig.json; ./node_modules/.bin/vitest run; (cd apps/web && ./node_modules/.bin/vite build)
docker run --rm --name "$CONTAINER" -e POSTGRES_USER=masterhost -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=m15 -p "$PG_PORT:5432" -d postgres:17-alpine >/dev/null; for _ in {1..30}; do docker exec "$CONTAINER" pg_isready -U masterhost -d m15 >/dev/null 2>&1 && break; sleep 1; done; docker exec "$CONTAINER" createdb -U masterhost m15_tests
TEST_DATABASE_URL="postgresql://masterhost:masterhost@127.0.0.1:$PG_PORT/m15_tests" ./node_modules/.bin/vitest run tests/m15-table-repository.test.ts
start_server(){ DATABASE_URL="postgresql://masterhost:masterhost@127.0.0.1:$PG_PORT/m15" PORT="$API_PORT" WORLD_PACK_PATH="worldpacks/space-opera" MASTERHOST_DEFAULT_REALM_ADMIN=local-default-realm-admin ./node_modules/.bin/tsx apps/server/src/index.ts >"$SERVER_LOG" 2>&1 & SERVER_PID=$!; for _ in {1..30}; do curl -sf "http://127.0.0.1:$API_PORT/health" >/dev/null && return; sleep 1; done; cat "$SERVER_LOG" >&2; return 1; }
run_phase(){ M15_PHASE="$1" M15_STATE_FILE="$STATE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_WS_URL="ws://127.0.0.1:$API_PORT" node scripts/m15-acceptance.mjs; }
start_server; run_phase setup
(cd apps/web && exec env VITE_API_URL="http://127.0.0.1:$API_PORT/api" VITE_WS_URL="ws://127.0.0.1:$API_PORT" ./node_modules/.bin/vite --host 127.0.0.1 --port "$WEB_PORT") >"$WEB_LOG" 2>&1 & WEB_PID=$!; for _ in {1..30}; do curl -sf "http://127.0.0.1:$WEB_PORT/?realm=default" >/dev/null && break; sleep 1; done
M15_STATE_FILE="$STATE" M15_WEB_URL="http://127.0.0.1:$WEB_PORT" M15_CDP_PORT="$CDP_PORT" node scripts/m15-browser-acceptance.mjs; run_phase complete
kill "$WEB_PID" 2>/dev/null || true; wait "$WEB_PID" 2>/dev/null || true; WEB_PID=""; kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; SERVER_PID=""; start_server; run_phase verify
echo "M15 gate passed: tests, build, clean PostgreSQL rehearsal, authorization/redaction, GM/player browser flow, completion and restart readback."
