#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; PORT="${MASTERHOST_PORT:-8088}"; cd "$ROOT"
echo "MasterHost diagnostics"
docker compose ps
docker compose exec -T postgres pg_isready -U "${MASTERHOST_DB_USER:-masterhost}" -d "${MASTERHOST_DB_NAME:-masterhost}"
docker compose exec -T api node -e "fetch('http://127.0.0.1:8080/health').then(async r=>{console.log('API',r.status,await r.text());process.exit(r.ok?0:1)}).catch(e=>{console.error(e.message);process.exit(1)})"
curl --fail --silent --show-error "http://127.0.0.1:$PORT/health" >/dev/null
curl --fail --silent --show-error "http://127.0.0.1:$PORT/?realm=default" >/dev/null
echo "Browser endpoint: healthy on http://127.0.0.1:$PORT"
