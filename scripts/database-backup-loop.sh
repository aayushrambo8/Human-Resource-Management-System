#!/bin/sh
set -eu
umask 077

while true; do
  backup_name="hrms-$(date -u +%Y%m%dT%H%M%SZ).dump"
  temporary_path="/backups/${backup_name}.partial"
  final_path="/backups/${backup_name}"

  if pg_dump --format=custom --no-owner --no-acl --file="$temporary_path"; then
    mv "$temporary_path" "$final_path"
    find /backups -type f -name 'hrms-*.dump' -mtime +14 -delete
    echo "Created database backup: $backup_name"
    sleep 86400
  else
    rm -f "$temporary_path"
    echo "Database backup failed; retrying in one hour." >&2
    sleep 3600
  fi
done
