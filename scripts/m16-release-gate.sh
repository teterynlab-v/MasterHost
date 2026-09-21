#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT="${M16_COMPOSE_PROJECT:-masterhost-m16-gate-$$}"
PORT="${M16_PORT:-$((8300 + $$ % 300))}"
CDP_PORT="${M16_CDP_BASE_PORT:-$((9500 + $$ % 200))}"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/masterhost-m16-gate.XXXXXX")"
BACKUP="$WORK/masterhost.dump"
RELEASE_DIR="$WORK/release"
STATE="$WORK/worlds.json"
M15_STATE="$WORK/m15-state.json"

export COMPOSE_PROJECT_NAME="$PROJECT"
export MASTERHOST_PORT="$PORT"
export MASTERHOST_DB_USER=masterhost
export MASTERHOST_DB_PASSWORD="m16-gate-db-$PROJECT"
export MASTERHOST_DB_NAME=masterhost
export MASTERHOST_ADMIN_TOKEN="m16-gate-admin-$PROJECT"
export MASTERHOST_WORLD_PACK=worldpacks/space-opera

cleanup() {
  docker compose -f "$ROOT/compose.yaml" down -v --remove-orphans >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT
cd "$ROOT"

./node_modules/.bin/tsc --noEmit -p tsconfig.json
./node_modules/.bin/vitest run
(cd apps/web && ./node_modules/.bin/vite build)

docker compose up --build -d
for _ in {1..60}; do
  if curl --fail --silent "http://127.0.0.1:$PORT/health" >/dev/null 2>&1; then break; fi
  sleep 1
done
./scripts/diagnose.sh

run_m15_phase() {
  M15_PHASE="$1" M15_STATE_FILE="$M15_STATE" MASTERHOST_API_URL="http://127.0.0.1:$PORT/api" MASTERHOST_WS_URL="ws://127.0.0.1:$PORT" node scripts/m15-acceptance.mjs
}
run_m15_phase setup
M15_STATE_FILE="$M15_STATE" M15_WEB_URL="http://127.0.0.1:$PORT" M15_CDP_PORT="$CDP_PORT" node scripts/m15-browser-acceptance.mjs
M16_STATE_FILE="$M15_STATE" M16_WEB_URL="http://127.0.0.1:$PORT" M16_CDP_PORT="$((CDP_PORT + 1))" node scripts/m16-browser-acceptance.mjs
run_m15_phase complete
M16_STATE="$STATE" M15_STATE="$M15_STATE" node --input-type=module <<'NODE'
import { readFile, writeFile } from "node:fs/promises";
const m15 = JSON.parse(await readFile(process.env.M15_STATE, "utf8"));
await writeFile(process.env.M16_STATE, JSON.stringify({ first: m15.worldId }));
console.log(`Created durable playable World ${m15.worldId}.`);
NODE

./scripts/backup.sh "$BACKUP"

M16_URL="http://127.0.0.1:$PORT" M16_STATE="$STATE" node --input-type=module <<'NODE'
import { readFile, writeFile } from "node:fs/promises";
const state = JSON.parse(await readFile(process.env.M16_STATE, "utf8"));
const response = await fetch(`${process.env.M16_URL}/api/worlds`, { method: "POST", headers: { "content-type": "application/json", "x-realm-slug": "default" }, body: JSON.stringify({ seed: "m16-release-discarded", choices: {} }) });
if (!response.ok) throw Error(`second World: ${response.status} ${await response.text()}`);
state.second = (await response.json()).id;
await writeFile(process.env.M16_STATE, JSON.stringify(state));
console.log(`Created post-backup World ${state.second}.`);
NODE

./scripts/restore.sh "$BACKUP" --confirm-replace

M16_URL="http://127.0.0.1:$PORT" M16_STATE="$STATE" node --input-type=module <<'NODE'
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const state = JSON.parse(await readFile(process.env.M16_STATE, "utf8"));
const response = await fetch(`${process.env.M16_URL}/api/worlds`, { headers: { "x-realm-slug": "default" } });
assert.equal(response.status, 200);
const ids = (await response.json()).map(value => value.id);
assert.ok(ids.includes(state.first), "pre-backup World was not restored");
assert.ok(!ids.includes(state.second), "post-backup World survived destructive restore");
console.log("Backup/restore verified: preserved pre-backup data and removed post-backup data.");
NODE

./scripts/diagnose.sh
run_m15_phase verify
M16_WEB_URL="http://127.0.0.1:$PORT" M16_A11Y_CDP_PORT="$((CDP_PORT + 2))" node scripts/m16-accessibility.mjs
node scripts/build-release.mjs 0.1.0-gate "$RELEASE_DIR"
node scripts/verify-release.mjs "$RELEASE_DIR/masterhost-0.1.0-gate.tar.gz"

echo "M16 release gate passed: checks, build, clean Compose, same-origin gameplay/WebSocket browser regression, diagnostics, durable PostgreSQL, backup/restore, accessibility and verified release archive."
