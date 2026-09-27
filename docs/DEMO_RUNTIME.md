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

## Illustrated collection refresh, 2026-09-27

All twelve illustrated asset collections are installed. API/web containers now use the illustration preview images; the PostgreSQL container, existing records, environment, exact port bindings, network aliases and restart policies were preserved. The retained catalogue loaded all twelve generated covers in the browser. A new Urban Fantasy game was created through Quick Builder with 151 included media, then its six scenes, illustrated exploration map and connected GM table were checked after reload. Its code is 792245. Old immutable Worlds still use their old media; create a new game from the collection for the illustrated versions.

Source gallery: http://127.0.0.1:8247/. Evidence is in `artwork/runtime-evidence.json` and `artwork/evidence/retained-urban-gm.png`. Full-resolution art review and M30 human acceptance remain separate.

Final server image was built from the checked extracted illustrated release, including exact published Pack lookups in runtime, Realm context and Descriptor flows. The same retained campaign restored after this API replacement. Clean portability/live-session/restart engineering proof is separate in `artwork/evidence/verification-summary.json`; it passed on 2026-09-28.
