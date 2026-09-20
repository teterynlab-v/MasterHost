# M1 Status — playable local baseline (2026-09-20)

The two-browser Fantasy lobby and character flow passed through LIVE and reconnect. Campaign GM control now uses a separate hashed token; PIN does not authorize GM commands. Guest identity, participant commands and read permissions still require production-grade authentication. See `PROJECT_STATUS.md`.

## Implemented

- Realm, Campaign, Session, Participant.
- Session lifecycle and 5-digit PIN.
- Guest join and realtime lobby.
- Reconnect `session.snapshot`.
- Ready state and LIVE transition.
- GM Lobby UI and Player PIN UI.
- Pack-defined Character Creation DSL baseline.
- Persistent `characters` table.
- Anonymous browser `ownerKey` stored locally for saved-character lookup without mandatory registration.
- Character creation API.
- Compatible saved-character listing by exact World Pack ID/version.
- Character selection attached to SessionParticipant.
- Generic Character Builder UI rendered from World Pack steps/fields.
- Fantasy and Cyberpunk define different creation flows.

## Current player flow

    Realm / #join
      ↓
    PIN
      ↓
    nickname
      ↓
    saved compatible characters
       OR
    pack-defined Character Builder
      ↓
    select character
      ↓
    Ready
      ↓
    GM starts
      ↓
    LIVE

## Next

- Character compatibility/migration policies beyond exact pack version.
- Realm authentication and participant authorization for untrusted hosting.
- Presence heartbeat.
- Real-device and two-player acceptance on a clean database.
