# Northstar Institute HRMS

Self-hosted human-resources workspace for an institution, with a React dashboard,
Spring Boot API, and PostgreSQL database. Database schema setup, seed data, and
first administrator creation are automated. Application runtime does not depend on
internet-hosted services or CDN assets.

## Recommended: offline deployment

An offline computer cannot download container images or Maven/npm packages. Prepare
the app images once on a computer that has internet and Docker:

```bash
scripts/export-offline-images.sh
```

This builds the frontend and backend container images and downloads the PostgreSQL
image. Securely transfer the project source and `hrms-offline-images.tar` to the
institution's self-hosted server. Do not transfer an existing `.env` file.

On the offline server, install Docker Engine and the Docker Compose plugin, copy the
project to its permanent location, and run:

```bash
scripts/setup-self-hosted.sh --offline
```

The setup creates strong private database/JWT/bootstrap secrets, starts PostgreSQL,
automatically applies Flyway schema migrations and seed records, starts the API and
frontend, and creates the first administrator account. It prints the administrator
password and the initial biometric device token once; store both in the institution's
password manager/device configuration. The private `.env` contains only the hash of
the biometric token, has mode `600`, and is not committed.

Open `http://<server-LAN-IP>:8080` from an allowed institution network. If the
institution needs another port, change `HRMS_HTTP_PORT` in `.env` and restart with
`docker compose up -d`. Permit that port only on the intended LAN/VLAN in the host
firewall. PostgreSQL is reachable only by the app containers and is not published
on the host. For access beyond a trusted LAN, put a self-hosted TLS reverse proxy
in front and do not expose plain HTTP to the internet.

## One-machine setup with internet available

Install Docker Engine and the Compose plugin, then run:

```bash
scripts/setup-self-hosted.sh
```

This builds the images locally, initializes the database, starts the app, and
prints the one-time administrator credentials. Internet is needed only to obtain
the images and build-time dependencies; the running stack is self-hosted.

## Operations

```bash
docker compose ps
docker compose logs -f
docker compose restart
docker compose down
```

`docker compose down` preserves the PostgreSQL data volume. **Do not** use
`docker compose down -v` unless you intend to permanently erase the database.
The database-backup service creates a compressed PostgreSQL backup immediately,
then once per day, retaining the last 14 days in the private `backups/` directory.
Copy backups to separate institution-managed storage regularly; a backup on the
same server is not protection against server or disk failure.

The frontend defaults to same-origin API requests behind the bundled Nginx proxy.
For development outside Docker, use `frontend/.env.example` and set
`VITE_API_BASE_URL=http://localhost:8080`; for direct browser access to another
origin, configure `HRMS_CORS_ALLOWED_ORIGINS` in the root `.env`.

See [backend/README.md](backend/README.md) and [docs/backend-plan.md](docs/backend-plan.md)
for API behavior and implementation notes. `.horilla-hr/` remains a local-only
reference and is not used by the application.
