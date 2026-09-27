#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_ID="$$"
PG_A="masterhost-illustrated-gate-a-$RUN_ID"; PG_B="masterhost-illustrated-gate-b-$RUN_ID"; SERVER="masterhost-illustrated-gate-server-$RUN_ID"; IMAGE="masterhost-illustrated-gate-server:gate-$RUN_ID"
NETWORK="masterhost-illustrated-gate-$RUN_ID"
API_PORT="${ARTWORK_API_PORT:-8371}"
RELEASE_WORK=""
cleanup(){
  docker rm -f "$SERVER" "$PG_A" "$PG_B" >/dev/null 2>&1 || true
  if [[ -n "$RELEASE_WORK" ]]; then rm -rf "$RELEASE_WORK"; fi
  docker image rm "$IMAGE" >/dev/null 2>&1 || true
  docker network rm "$NETWORK" >/dev/null 2>&1 || true
}
trap cleanup EXIT
cd "$ROOT"
node --input-type=module <<'JS'
import fs from 'node:fs';
import assert from 'node:assert/strict';
const inventory=JSON.parse(fs.readFileSync('artwork/manifest.json'));
assert.equal(inventory.entries.length,1812);
assert.ok(inventory.entries.every(e=>e.status==='generated'));
assert.equal(new Set(inventory.entries.map(e=>e.checksum)).size,1812);
const catalog=JSON.parse(fs.readFileSync('universe-catalog/catalog.json'));
for(const universe of catalog){const collection=JSON.parse(fs.readFileSync(`artwork/${universe.id}-integration.json`));assert.equal(collection.sourceImages,151);assert.equal(collection.runtimeImages,151);}
JS
./node_modules/.bin/tsc --noEmit -p tsconfig.json
./node_modules/.bin/vitest run
(cd apps/web && ./node_modules/.bin/vite build)
RELEASE_WORK="$(mktemp -d "${TMPDIR:-/tmp}/masterhost-illustrated-gate-release.XXXXXX")"
node scripts/build-release.mjs 0.2.0-illustrated "$RELEASE_WORK"
node scripts/verify-release.mjs "$RELEASE_WORK/masterhost-0.2.0-illustrated.tar.gz"
tar -xzf "$RELEASE_WORK/masterhost-0.2.0-illustrated.tar.gz" -C "$RELEASE_WORK"
docker build --target server -t "$IMAGE" "$RELEASE_WORK/masterhost-0.2.0-illustrated" >/dev/null
docker network create "$NETWORK" >/dev/null
docker run --rm --network "$NETWORK" --name "$PG_A" -e POSTGRES_USER=masterhost -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=masterhost_illustrated_a -d postgres:17-alpine >/dev/null
docker run --rm --network "$NETWORK" --name "$PG_B" -e POSTGRES_USER=masterhost -e POSTGRES_PASSWORD=masterhost -e POSTGRES_DB=masterhost_illustrated_b -d postgres:17-alpine >/dev/null
for name in "$PG_A" "$PG_B"; do for _ in {1..30}; do docker exec "$name" pg_isready -U masterhost >/dev/null 2>&1 && break; sleep 1; done; docker exec "$name" pg_isready -U masterhost >/dev/null; done
start_server(){
  local pg_host="$1" db="$2"
  docker run -d --network "$NETWORK" --name "$SERVER" -p "127.0.0.1:$API_PORT:8080" -e DATABASE_URL="postgresql://masterhost:masterhost@$pg_host:5432/$db" -e MASTERHOST_PLATFORM_KEY=illustrated-platform -e WORLD_PACK_PATH=worldpacks/mecha-kaiju "$IMAGE" >/dev/null
  for _ in {1..40}; do curl -sf "http://127.0.0.1:$API_PORT/health" >/dev/null && return; sleep 1; done
  docker logs "$SERVER" >&2; return 1
}
start_server "$PG_A" masterhost_illustrated_a
ARTWORK_PHASE=export ARTWORK_PROOF_DIR="$RELEASE_WORK/proof" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/illustrated-portability.mjs
docker rm -f "$SERVER" >/dev/null
start_server "$PG_B" masterhost_illustrated_b
ARTWORK_PHASE=import ARTWORK_PROOF_DIR="$RELEASE_WORK/proof" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/illustrated-portability.mjs
ARTWORK_API_URL="http://127.0.0.1:$API_PORT" ARTWORK_REALM_TOKEN=local-default-realm-admin ARTWORK_CREDENTIAL_DIR="$RELEASE_WORK/credentials" ARTWORK_EVIDENCE_PATH=artwork/evidence/clean-runtime.json node scripts/verify-illustrated-runtime.mjs
docker rm -f "$SERVER" >/dev/null
start_server "$PG_B" masterhost_illustrated_b
ARTWORK_PHASE=verify ARTWORK_PROOF_DIR="$RELEASE_WORK/proof" MASTERHOST_API_URL="http://127.0.0.1:$API_PORT/api" node scripts/illustrated-portability.mjs
node --input-type=module - "$RELEASE_WORK/proof/collection.json" <<'JS'
import fs from 'node:fs';
const entries=JSON.parse(fs.readFileSync(process.argv[2]));
fs.writeFileSync('artwork/evidence/clean-portability.json',JSON.stringify({checkedAt:new Date().toISOString(),installations:2,compiledKitWorlds:36,portableGames:12,restartVerified:true,collections:entries.map(e=>({universe:e.universe,assetVersion:e.assetVersion,images:e.media.length,media:e.media}))},null,2)+'\n');
JS
cleanup; trap - EXIT
echo "Illustrated engineering gate passed: source, tests, release archive, 36 Worlds, 12 self-contained game imports, all image checksums, generic live sessions and restart. Browser and visual review remain separate."
