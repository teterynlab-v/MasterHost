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
12. Export `.mhworld`; verify a ZIP-like binary file is downloaded.
13. Switch `WORLD_PACK_PATH` to `worldpacks/cyberpunk-test`, restart server, and generate Cyberpunk.
14. Confirm same UI/compiler produces city/district/gang/megacorp concepts.
15. Run tests including 100-seed conformance.

M0 is not considered closed until these steps pass on the target macOS development machine.
