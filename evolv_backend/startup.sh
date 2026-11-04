#!/bin/bash
# Render Startup Script for EvolvLearn Django Backend

set -e  # Exit immediately if any command fails

echo "=== EvolvLearn Backend Starting ==="

# ── Run database migrations ───────────────────────────────────────────────────
echo "Applying database migrations..."
python manage.py migrate --no-input

# ── Collect static files ──────────────────────────────────────────────────────
echo "Collecting static files..."
python manage.py collectstatic --no-input

# ── Start Gunicorn ────────────────────────────────────────────────────────────
echo "Starting Gunicorn server..."
gunicorn \
  --bind 0.0.0.0:$PORT \
  --workers 4 \
  --timeout 120 \
  --access-logfile '-' \
  --error-logfile '-' \
  evolv_backend.wsgi:application
