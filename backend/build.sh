#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run database migrations
python manage.py migrate

# Optional: Create superuser (uncomment if needed, but provide credentials via env vars)
# python manage.py createsuperuser --no-input --username $DJANGO_SUPERUSER_USERNAME --email $DJANGO_SUPERUSER_EMAIL
