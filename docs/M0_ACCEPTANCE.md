# M0 Browser Acceptance

1. `./scripts/m0-check.sh`
2. `pnpm dev`
3. Open `http://localhost:5173`.
4. Generate Classic Fantasy world.
5. Confirm Generation Report contains multiple regions/settlements.
6. Open **Why?** for a generated value and verify source/sourceRef/seed are visible.
7. Edit a generated settlement value with **Edit + lock**.
8. Click **Preview regeneration** and inspect changed/created/removed/preserved/locked counts.
9. Click **Snapshot + regenerate**.
10. Confirm the custom locked value survived.
11. Create a manual snapshot.
12. Restore the manual snapshot and verify a new revision with the saved seed/values. Fork the World and verify an independent ID; reopen it from the saved World picker after a reload.
13. Export `.mhworld`; verify a ZIP-like binary file is downloaded. Import that `.mhworld` from Quick World, verify it appears as an independent World with preserved values and paths.
14. Switch `WORLD_PACK_PATH` to `worldpacks/cyberpunk-test`, restart server, and generate Cyberpunk.
15. Confirm same UI/compiler produces city/district/gang/megacorp concepts.
16. Run tests including 100-seed conformance.

M0 is not considered closed until these steps pass on a clean target database and custom asset persistence is verified where assets are used.
