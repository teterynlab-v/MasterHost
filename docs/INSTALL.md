# Install MasterHost

## Requirements

- Docker Engine 24+ with Docker Compose v2
- 4 GB free memory and 5 GB free disk space
- A current Chrome, Firefox, Safari or Edge browser

## First start

```bash
git clone https://github.com/teterynlab-v/MasterHost.git
cd MasterHost
cp .env.example .env
```

Replace `MASTERHOST_DB_PASSWORD` and `MASTERHOST_ADMIN_TOKEN` in `.env` with independent URL-safe random values. `openssl rand -hex 32` produces a suitable value for each setting. The product stack refuses to start when either value is absent. Then run:

```bash
docker compose up --build -d
./scripts/diagnose.sh
```

Open `http://localhost:8088`. A new installation starts with no saved games; choose **Create a game**. All bundled official World Packs are available in the universe catalog without changing `.env` or restarting. Each game has one base World Pack. **Advanced tools → World editor and import** installs an existing `.mhgame` or `.mhworld` file.

Stop with `docker compose stop` and restart with `docker compose start`. `docker compose down` removes containers while retaining the named PostgreSQL volume. Do not use `docker compose down -v` unless permanent data deletion is intended.

## Local network

Set `MASTERHOST_PORT` in `.env`, allow that TCP port through the host firewall, and share `http://HOST_ADDRESS:PORT`. TLS and public internet exposure require a trusted reverse proxy and production identity controls outside this local baseline.

## Upgrade

1. Run `./scripts/backup.sh`.
2. Fetch or unpack the new source release.
3. Run `docker compose up --build -d`.
4. Run `./scripts/diagnose.sh` and open an existing game.

Database migrations are additive and run under a PostgreSQL advisory lock during API startup. There is no automatic downgrade. Restore the pre-upgrade backup to return to an earlier release.
