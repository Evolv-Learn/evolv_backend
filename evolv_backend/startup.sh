#!/bin/bash
# Azure App Service Startup Script for Django

echo "Starting EvolvLearn Backend..."

# Install dependencies
echo "Installing Python dependencies..."
pip install -r ../requirements.txt

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn
echo "Starting Gunicorn server..."
gunicorn --bind=0.0.0.0:8000 --workers=4 --timeout=600 --access-logfile '-' --error-logfile '-' evolv_backend.wsgi:application
