#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

HRMS_DB_PASSWORD=offline-image-build \
HRMS_DEMO_DEVICE_TOKEN_HASH=0000000000000000000000000000000000000000000000000000000000000000 \
HRMS_JWT_SECRET=offline-image-build-secret-at-least-32-bytes \
HRMS_BOOTSTRAP_TOKEN=offline-image-build-token-at-least-32-bytes \
docker compose build
docker pull postgres:18
docker save \
  --output hrms-offline-images.tar \
  hrms-backend:local \
  hrms-frontend:local \
  postgres:18
echo "Created hrms-offline-images.tar. Transfer it securely with the project files to the offline host."
