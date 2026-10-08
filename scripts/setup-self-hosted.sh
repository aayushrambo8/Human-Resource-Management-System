#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OFFLINE=false
if [[ "${1:-}" == "--offline" ]]; then
  OFFLINE=true
elif [[ $# -gt 0 ]]; then
  echo "Usage: $0 [--offline]" >&2
  exit 2
fi

if [[ -e .env ]]; then
  echo "A .env file already exists; refusing to overwrite it." >&2
  echo "Back it up and remove it only if you intentionally want a fresh installation." >&2
  exit 1
fi

for command_name in docker openssl curl; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required command not found: $command_name" >&2
    exit 1
  fi
done
if ! command -v sha256sum >/dev/null 2>&1; then
  echo "Required command not found: sha256sum" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is required." >&2
  exit 1
fi

if $OFFLINE; then
  if [[ ! -f hrms-offline-images.tar ]]; then
    echo "Offline image archive not found: hrms-offline-images.tar" >&2
    exit 1
  fi
  echo "Loading prebuilt images for the offline installation..."
  docker load --input hrms-offline-images.tar
fi

umask 077
DB_PASSWORD="$(openssl rand -hex 32)"
JWT_SECRET="$(openssl rand -hex 48)"
BOOTSTRAP_TOKEN="$(openssl rand -hex 48)"
ADMIN_PASSWORD="$(openssl rand -hex 16)"
DEVICE_TOKEN="$(openssl rand -hex 32)"
DEVICE_TOKEN_HASH="$(printf '%s' "$DEVICE_TOKEN" | sha256sum | cut -d ' ' -f 1)"

cat > .env <<EOF
HRMS_DB_NAME=hrms
HRMS_DB_USERNAME=hrms
HRMS_DB_PASSWORD=$DB_PASSWORD
HRMS_DEMO_DEVICE_TOKEN_HASH=$DEVICE_TOKEN_HASH
HRMS_DB_URL=jdbc:postgresql://localhost:5432/hrms
HRMS_SERVER_PORT=8080
HRMS_JWT_SECRET=$JWT_SECRET
HRMS_BOOTSTRAP_TOKEN=$BOOTSTRAP_TOKEN
HRMS_ACCESS_TOKEN_SECONDS=900
HRMS_CORS_ALLOWED_ORIGINS=http://localhost:8080
HRMS_HTTP_PORT=8080
EOF
mkdir -p backups
chmod 700 backups

echo "Created private database and application secrets in .env."
if $OFFLINE; then
  START_ARGS=(up -d --no-build --wait)
else
  echo "Building the self-hosted services and starting PostgreSQL..."
  START_ARGS=(up -d --build --wait)
fi

if ! docker compose "${START_ARGS[@]}"; then
  echo "Service startup failed. Review 'docker compose logs' and retry after fixing the issue." >&2
  echo "Initial administrator: admin@institution.local" >&2
  echo "Generated administrator password (save it now): $ADMIN_PASSWORD" >&2
  echo "Biometric device BIO-001 token (save it for device configuration): $DEVICE_TOKEN" >&2
  exit 1
fi

echo "Creating the initial administrator account..."
if ! curl --fail --silent --show-error \
  --retry 30 --retry-connrefused --retry-delay 2 --retry-max-time 90 \
  -o /dev/null \
  -X POST "http://127.0.0.1:${HRMS_HTTP_PORT:-8080}/api/auth/bootstrap" \
  -H "X-Bootstrap-Token: $BOOTSTRAP_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"admin@institution.local\",\"password\":\"$ADMIN_PASSWORD\"}"; then
  echo "Administrator setup failed. Services are running; inspect logs before retrying bootstrap." >&2
  echo "Initial administrator: admin@institution.local" >&2
  echo "Generated administrator password (save it now): $ADMIN_PASSWORD" >&2
  echo "Biometric device BIO-001 token (save it for device configuration): $DEVICE_TOKEN" >&2
  echo "Use HRMS_BOOTSTRAP_TOKEN from .env in the X-Bootstrap-Token request header." >&2
  exit 1
fi

printf '\nHRMS is ready at http://localhost:%s\n' "${HRMS_HTTP_PORT:-8080}"
echo "Initial administrator: admin@institution.local"
echo "Generated administrator password (save it now): $ADMIN_PASSWORD"
echo "Biometric device BIO-001 token (save it for device configuration): $DEVICE_TOKEN"
echo "The password is not stored in .env. Store it in your institution's password manager."
