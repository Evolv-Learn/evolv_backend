#!/usr/bin/env bash
set -e

# Wait for DB (optional small loop can be added)
# echo "Waiting for DB..."
# python manage.py wait_for_db  # if you implement a wait_for_db management command

echo "Apply database migrations"
python manage.py migrate --noinput

echo "Collect static files"
python manage.py collectstatic --noinput

echo "Starting Gunicorn"
# adjust module path if your project entry point differs
exec gunicorn evolv_backend.wsgi:application \
  --bind 0.0.0.0:${PORT:-8000} \
  --workers 3 \
  --timeout 120
