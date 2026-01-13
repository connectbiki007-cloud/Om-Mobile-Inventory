#!/usr/bin/env bash
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Convert static files (CSS/Images)
python manage.py collectstatic --no-input

# Update database tables
python manage.py migrate