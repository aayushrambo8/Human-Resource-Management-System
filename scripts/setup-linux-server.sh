#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OFFLINE=false
PORT=8080

usage() {
  cat <<'EOF'
Usage: scripts/setup-linux-server.sh [--offline] [--port PORT]

Installs Docker on Debian/Ubuntu when needed, starts the HRMS stack, initializes
PostgreSQL, and creates the initial administrator.

Options:
  --offline     Use hrms-offline-images.tar; Docker must already be installed.
  --port PORT   LAN web port to publish (default: 8080).
  -h, --help    Show this help.
EOF
}

while (($#)); do
  case "$1" in
    --offline)
      OFFLINE=true
      shift
      ;;
    --port)
      if (($# < 2)); then
        echo "--port requires a port number." >&2
        exit 2
      fi
      PORT="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ ! "$PORT" =~ ^[0-9]+$ ]] || (( PORT < 1 || PORT > 65535 )); then
  echo "Port must be an integer between 1 and 65535." >&2
  exit 2
fi
PORT=$((10#$PORT))

if (( EUID == 0 )); then
  echo "Run this script as your normal Linux login, not with sudo." >&2
  echo "The script uses sudo only for Docker installation and service setup." >&2
  exit 1
fi

if [[ -e "$ROOT_DIR/.env" ]]; then
  echo "A .env file already exists; refusing to overwrite an existing installation." >&2
  echo "Use the existing installation instead of rerunning first-time setup." >&2
  exit 1
fi

RUN_USER="$(id -un)"
if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required to install/start Docker. Install Docker manually, then rerun." >&2
  exit 1
fi

has_docker_access() {
  command -v docker >/dev/null 2>&1 &&
    docker info >/dev/null 2>&1 &&
    docker compose version >/dev/null 2>&1
}

if ! command -v docker >/dev/null 2>&1; then
  if $OFFLINE; then
    echo "Offline mode requires Docker Engine and the Docker Compose plugin to be preinstalled." >&2
    exit 1
  fi

  if [[ ! -r /etc/os-release ]]; then
    echo "Cannot identify this Linux distribution. Install Docker Engine and Compose manually." >&2
    exit 1
  fi
  . /etc/os-release
  if [[ "${ID:-}" != "debian" && "${ID:-}" != "ubuntu" ]]; then
    echo "Automatic Docker installation supports Debian and Ubuntu only." >&2
    echo "Install Docker Engine and the Docker Compose plugin, then rerun this script." >&2
    exit 1
  fi

  echo "Installing Docker Engine and Compose from the ${PRETTY_NAME:-Linux} package repositories..."
  sudo apt-get update
  sudo apt-get install -y docker.io docker-compose-v2 ca-certificates curl openssl
fi

if ! $OFFLINE && ! docker compose version >/dev/null 2>&1; then
  if [[ -r /etc/os-release ]]; then
    . /etc/os-release
  fi
  if [[ "${ID:-}" == "debian" || "${ID:-}" == "ubuntu" ]]; then
    echo "Installing the Docker Compose v2 plugin..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-v2
  else
    echo "Docker Compose v2 is missing. Install the Compose plugin and rerun." >&2
    exit 1
  fi
fi

if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl enable --now docker
fi

if ! has_docker_access; then
  if ! getent group docker >/dev/null 2>&1; then
    echo "Docker is installed, but its 'docker' group is missing." >&2
    exit 1
  fi
  echo "Enabling Docker access for $RUN_USER (Docker group access is root-equivalent)..."
  sudo usermod -aG docker "$RUN_USER"
  if ! command -v runuser >/dev/null 2>&1; then
    echo "runuser is required to continue with the updated Docker group." >&2
    echo "Log out and back in, then run scripts/setup-self-hosted.sh directly." >&2
    exit 1
  fi
  RUN_SETUP=(runuser -u "$RUN_USER" -g docker --)
else
  RUN_SETUP=()
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is unavailable. Install Docker Compose v2 and rerun." >&2
  exit 1
fi

cd "$ROOT_DIR"
if $OFFLINE; then
  SETUP_ARGS=(--offline)
else
  SETUP_ARGS=()
fi

echo "Setting up HRMS on port $PORT..."
"${RUN_SETUP[@]}" env HRMS_HTTP_PORT="$PORT" \
  bash "$ROOT_DIR/scripts/setup-self-hosted.sh" "${SETUP_ARGS[@]}"

echo
echo "LAN addresses detected on this server:"
if command -v ip >/dev/null 2>&1; then
  ip -4 -o addr show scope global | awk -v port="$PORT" '{split($4, address, "/"); print "  http://" address[1] ":" port}'
else
  hostname -I | tr ' ' '\n' | sed '/^$/d' | while read -r address; do
    printf '  http://%s:%s\n' "$address" "$PORT"
  done
fi
echo
echo "Network action required: allow TCP port $PORT from trusted LAN/VLAN clients only."
echo "Do not expose this HTTP port or the server directly to the public internet."
echo "The PostgreSQL port is private to Docker and is not opened on the LAN."
