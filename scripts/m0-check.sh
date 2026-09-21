#!/usr/bin/env bash
set -euo pipefail
if command -v corepack >/dev/null 2>&1; then
  corepack enable
  PNPM=(pnpm)
else
  PNPM=(npm exec --yes --package=pnpm@10.17.1 -- pnpm)
fi
"${PNPM[@]}" install
docker compose -f compose.dev.yaml up -d
"${PNPM[@]}" typecheck
"${PNPM[@]}" test
echo
echo "M0 static checks passed."
echo "Run: pnpm dev"
echo "Open: http://localhost:5173"
