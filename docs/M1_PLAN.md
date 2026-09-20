# M1 — Realm / Campaign / Session / PIN

## Implemented baseline

- Realm domain model.
- Campaign domain model.
- Session state machine.
- 5-digit PIN allocation and active Realm-scoped uniqueness.
- PIN expiry.
- Guest participant model.
- PostgreSQL tables for realms/campaigns/sessions/participants.
- Campaign creation API.
- Start-lobby API.
- PIN resolver API.
- Guest join API.
- Session state transition API.
- WebSocket session event channel.
- Browser client helpers for PIN resolution, guest join, and realtime session events.

## Next after M0 verification

1. Integrate Realm/Campaign controls into UI.
2. Add visible GM lobby screen with large PIN.
3. Add player `/join` experience.
4. Add participant ready state broadcasting.
5. Add reconnect snapshot on WebSocket connect.
6. Add authentication/RBAC around GM endpoints.
7. Add pack-defined Character Builder before player becomes ready.
8. Add global PIN resolver mode for hosted deployment.

## Target player flow

    Realm home
       ↓
    [ 74291 ]
       ↓
    Session resolved
       ↓
    Nickname
       ↓
    Character
       ↓
    Lobby

## Target GM flow

    World
      ↓
    Create/Continue Campaign
      ↓
    Start Session
      ↓
    74291
      ↓
    Wait for players
      ↓
    LIVE
