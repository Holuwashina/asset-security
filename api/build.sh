#!/bin/bash

# Build script for Vercel deployment
echo "Starting build process..."

# Install Python dependencies
pip install -r requirements.txt

# Set Django settings module
export DJANGO_SETTINGS_MODULE=assets_management.deployment_settings

# Collect static files
python manage.py collectstatic --noinput --clear

# Run migrations
python manage.py migrate --noinput

# Create superuser if it doesn't exist (optional)
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created')
else:
    print('Superuser already exists')
"

echo "Build process completed successfully!"
