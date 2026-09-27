#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API=masterhost-collection-demo-api
PG=masterhost-universe-demo-pg
WEB=masterhost-collection-demo-web
NETWORK=masterhost-collection-demo
for container in "$PG" "$API"; do
  docker inspect "$container" >/dev/null 2>&1 || { echo "Retained demo container $container is missing; restore its existing data before starting." >&2; exit 1; }
  docker update --restart unless-stopped "$container" >/dev/null
  if [[ "$(docker inspect -f '{{.State.Running}}' "$container")" != true ]]; then docker start "$container" >/dev/null; fi
done
docker network inspect "$NETWORK" >/dev/null 2>&1 || docker network create "$NETWORK" >/dev/null
if [[ -z "$(docker inspect -f '{{if index .NetworkSettings.Networks "masterhost-collection-demo"}}attached{{end}}' "$API")" ]]; then
  docker network connect --alias api "$NETWORK" "$API"
fi
if ! docker inspect "$WEB" >/dev/null 2>&1; then
  docker build --target web -t masterhost-collection-demo-web:local "$ROOT"
  docker run -d --name "$WEB" --network "$NETWORK" --restart unless-stopped -p 127.0.0.1:8246:80 masterhost-collection-demo-web:local >/dev/null
else
  docker update --restart unless-stopped "$WEB" >/dev/null
  if [[ "$(docker inspect -f '{{.State.Running}}' "$WEB")" != true ]]; then docker start "$WEB" >/dev/null; fi
fi
for _ in {1..30}; do
  if curl -fsS http://127.0.0.1:8246/health >/dev/null; then
    echo 'Demo ready: http://127.0.0.1:8246/?realm=default&lang=ru#gm'
    exit 0
  fi
  sleep 1
done
docker logs --tail 30 "$WEB" >&2
exit 1
