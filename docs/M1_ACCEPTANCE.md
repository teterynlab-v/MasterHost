# M1 Playable Lobby Acceptance

Prerequisite: M0 checks pass.

1. Generate a World.
2. Click **Start campaign**.
3. Enter campaign name and create lobby.
4. GM screen displays a numeric PIN (six digits after the M7 global resolver upgrade).
5. Open a second browser/private window at `http://localhost:5173/#join`.
6. Enter PIN.
7. Session/campaign resolves.
8. Enter player nickname and Join.
9. GM sees player without refresh.
10. Player sees party list.
11. Player toggles Ready; GM sees Ready.
12. GM clicks START GAME.
13. Both clients show Session LIVE.
14. Refresh player browser; WebSocket snapshot restores current lobby/session state.
15. Repeat with two players.

Character creation is the next gate and is not yet part of this acceptance version.
