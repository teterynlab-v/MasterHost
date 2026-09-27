#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_ID="$$"
PG_A="masterhost-m30-a-$RUN_ID"; PG_B="masterhost-m30-b-$RUN_ID"; SERVER="masterhost-m30-server-$RUN_ID"; IMAGE="masterhost-m30-server:gate-$RUN_ID"
PG_A_PORT="${M30_PG_A_PORT:-55514}"; PG_B_PORT="${M30_PG_B_PORT:-55515}"; API_PORT="${M30_API_PORT:-8361}"; WEB_PORT="${M30_WEB_PORT:-8362}"; CDP_PORT="${M30_CDP_PORT:-9462}"
STATE="${TMPDIR:-/tmp}/masterhost-m30-$RUN_ID.json"; TABLE_STATE="${TMPDIR:-/tmp}/masterhost-m30-table-$RUN_ID.json"; ARCHIVE="${TMPDIR:-/tmp}/masterhost-m30-$RUN_ID.mhgame"; WEB_LOG="${TMPDIR:-/tmp}/masterhost-m30-web-$RUN_ID.log"; WEB_PID=""; RELEASE_WORK=""
cleanup(){
  if [[ -n "$WEB_PID" ]]; then kill "$WEB_PID" 2>/dev/null || true; wait "$WEB_PID" 2>/dev/null || true; fi
  docker rm -f "$SERVER" "$PG_A" "$PG_B" >/dev/null 2>&1 || true
  if [[ -n "$RELEASE_WORK" ]]; then rm -rf "$RELEASE_WORK"; fi
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
RELEASE_WORK="$(mktemp -d "${TMPDIR:-/tmp}/masterhost-m30-release.XXXXXX")"
node scripts/build-release.mjs 0.2.0-collection "$RELEASE_WORK"
node scripts/verify-release.mjs "$RELEASE_WORK/masterhost-0.2.0-collection.tar.gz"
tar -xzf "$RELEASE_WORK/masterhost-0.2.0-collection.tar.gz" -C "$RELEASE_WORK"
docker build --target server -t "$IMAGE" "$RELEASE_WORK/masterhost-0.2.0-collection" >/dev/null
docker run --rm --name "$PG_A" -e POSTGRES_USER=masterhost -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=masterhost_m30_a -p "$PG_A_PORT:5432" -d postgres:17-alpine >/dev/null
docker run --rm --name "$PG_B" -e POSTGRES_USER=masterhost -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=masterhost_m30_b -p "$PG_B_PORT:5432" -d postgres:17-alpine >/dev/null
for name in "$PG_A" "$PG_B"; do for _ in {1..30}; do docker exec "$name" pg_isready -U masterhost >/dev/null 2>&1 && break; sleep 1; done; docker exec "$name" pg_isready -U masterhost >/dev/null; done
start_server(){
  local pg_port="$1" db="$2"
  docker run --rm -d --name "$SERVER" --add-host=host.docker.internal:host-gateway -p "$API_PORT:8080" -e DATABASE_URL="postgresql://masterhost:masterhost@host.docker.internal:$pg_port/$db" -e MASTERHOST_PLATFORM_KEY=m30-platform -e WORLD_PACK_PATH=worldpacks/mecha-kaiju "$IMAGE" >/dev/null
  for _ in {1..40}; do curl -sf "http://127.0.0.1:$API_PORT/health" >/dev/null && return; sleep 1; done
  docker logs "$SERVER" >&2; return 1
}
start_server "$PG_A_PORT" masterhost_m30_a
M30_PHASE=export M30_PROOF_DIR="$RELEASE_WORK/proof" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m30-acceptance.mjs
(cd apps/web && exec env VITE_API_URL="http://127.0.0.1:$API_PORT/api" VITE_WS_URL="ws://127.0.0.1:$API_PORT" ./node_modules/.bin/vite --host 127.0.0.1 --port "$WEB_PORT") >"$WEB_LOG" 2>&1 & WEB_PID=$!
for _ in {1..30}; do curl -sf "http://127.0.0.1:$WEB_PORT/?realm=default" >/dev/null && break; sleep 1; done
echo "API gate running; browser acceptance is verified separately through the browser tool."
M29_PHASE=export M29_STATE_FILE="$STATE" M29_ARCHIVE_FILE="$ARCHIVE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m29-acceptance.mjs
docker rm -f "$SERVER" >/dev/null
start_server "$PG_B_PORT" masterhost_m30_b
M30_PHASE=import M30_PROOF_DIR="$RELEASE_WORK/proof" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m30-acceptance.mjs
M29_PHASE=import M29_STATE_FILE="$STATE" M29_ARCHIVE_FILE="$ARCHIVE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m29-acceptance.mjs
M15_PHASE=setup M15_STATE_FILE="$TABLE_STATE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_WS_URL="ws://127.0.0.1:$API_PORT" node scripts/m15-acceptance.mjs
M29_PHASE=table-note M29_STATE_FILE="$STATE" M29_ARCHIVE_FILE="$ARCHIVE" M29_TABLE_STATE_FILE="$TABLE_STATE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m29-acceptance.mjs
M15_PHASE=complete M15_STATE_FILE="$TABLE_STATE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_WS_URL="ws://127.0.0.1:$API_PORT" node scripts/m15-acceptance.mjs
docker rm -f "$SERVER" >/dev/null
start_server "$PG_B_PORT" masterhost_m30_b
M30_PHASE=verify M30_PROOF_DIR="$RELEASE_WORK/proof" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m30-acceptance.mjs
M29_PHASE=verify M29_STATE_FILE="$STATE" M29_ARCHIVE_FILE="$ARCHIVE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/m29-acceptance.mjs
M15_PHASE=verify M15_STATE_FILE="$TABLE_STATE" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" MASTERHOST_WS_URL="ws://127.0.0.1:$API_PORT" node scripts/m15-acceptance.mjs
cleanup; trap - EXIT
echo "M30 API gate passed: source, tests, image, Advanced composition, two-installation .mhgame, complete table API and restart readback. Separate browser acceptance remains required."
