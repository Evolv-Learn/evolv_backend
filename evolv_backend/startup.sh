#!/usr/bin/env bash
set -e


set -x

echo "Starting Evolv Django application..."

echo "Applying database migrations"
python manage.py migrate --noinput

echo "Collect static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn server..."
exec gunicorn evolv_backend.wsgi:application \
  --bind 0.0.0.0:${PORT:-8000} \
  --workers 3 \
  --timeout 120 \
  --log-level info

echo "Evolv backend started successfully!"