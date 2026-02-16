#!/bin/sh
set -e

# Wait for DB to accept connections (belt-and-suspenders after depends_on healthcheck)
echo "Waiting for database..."
tries=0
until python -c "
from sqlalchemy import create_engine, text
engine = create_engine('$DATABASE_URL')
with engine.connect() as conn:
    conn.execute(text('SELECT 1'))
" 2>/dev/null; do
  tries=$((tries + 1))
  if [ "$tries" -ge 15 ]; then
    echo "ERROR: Database not reachable after 15 attempts"
    exit 1
  fi
  echo "  DB not ready (attempt $tries/15), retrying in 2s..."
  sleep 2
done
echo "Database is ready."

echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
