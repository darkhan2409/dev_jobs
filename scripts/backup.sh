#!/bin/bash
set -euo pipefail

COMPOSE_DIR="/opt/dev_jobs"
BACKUP_DIR="$COMPOSE_DIR/backups"
KEEP_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

# Читаем переменные из .env
source "$COMPOSE_DIR/.env"

docker compose -f "$COMPOSE_DIR/docker-compose.yml" exec -T db \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_FILE"

echo "[$(date)] Backup saved: $BACKUP_FILE"

# Удаляем бэкапы старше KEEP_DAYS дней
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +$KEEP_DAYS -delete
echo "[$(date)] Old backups cleaned up (kept last $KEEP_DAYS days)"
