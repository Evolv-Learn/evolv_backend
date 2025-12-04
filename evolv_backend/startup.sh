#!/bin/bash
# Azure App Service Startup Script for Django

echo "Starting EvolvLearn Backend..."

# Change to the evolv_backend directory
cd "$(dirname "$0")"

# Start Gunicorn
echo "Starting Gunicorn server..."
gunicorn --bind=0.0.0.0:8000 --workers=4 --timeout=600 --access-logfile '-' --error-logfile '-' evolv_backend.wsgi:application
