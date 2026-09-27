# Retained local collection demo

## Entry

http://127.0.0.1:8246/?realm=default&lang=ru#gm

The retained Collection Rescue Tonight GM table has code 109098. The collection route is `#universes`. Existing worlds, sessions and PostgreSQL data are retained.

## Runtime

- `masterhost-collection-demo-web`: production Nginx/web image, localhost8246.
- `masterhost-collection-demo-api`: retained API8245, network alias `api` on `masterhost-collection-demo`.
- `masterhost-universe-demo-pg`: retained PostgreSQL55482.

The web image uses same-origin `/api` and `/ws` forwarding through Nginx. All three retained containers use `unless-stopped`; Docker must be running. Explicitly stopped containers remain stopped until resumed.

From the repository run `./scripts/resume-demo.sh` to resume this existing demo. It does not create or replace the database. A missing retained API/PG container requires recovering its original configuration/data. An existing web container serves its built image; it is not a source hot-reload server.

## Recovery evidence, 2026-09-27

The previous temporary Vite process had exited while API and PostgreSQL remained healthy. Replaced that frontend with the production Docker image. Health through the web proxy returned200 and the catalog returned12 ready universes. Browser recovered the saved GM campaign/code, six scenes, Pack map and connected WebSocket. Stopped the web container, ran resume-demo.sh, then reloaded the browser and confirmed recovery. No application/database replacement or external deployment.
