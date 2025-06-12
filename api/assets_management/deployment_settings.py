import os
import dj_database_url
from .settings import *

# Override settings for Render deployment
DEBUG = False

# Security settings
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-c&9c$g6%7e(wf3&-fspvzv**)&miqd+ey9ls_&niuhlva@76#f')

# Allowed hosts for Render
ALLOWED_HOSTS = [
    '.onrender.com',  # Render domain
    'localhost',
    '127.0.0.1',
    '*',  # Allow all for Render (can be restricted later)
]

# Database configuration for Render PostgreSQL
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Static files configuration for Render
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Use WhiteNoise for serving static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Add WhiteNoise middleware
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# CORS settings for Render deployment
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Local development
    "http://127.0.0.1:3000",  # Local development alternative
    "https://localhost:3000", # HTTPS local development
    "https://asset-classification-frontend.onrender.com",  # Production frontend
]

# Add Render frontend domain dynamically
if os.environ.get('FRONTEND_URL'):
    CORS_ALLOWED_ORIGINS.append(os.environ.get('FRONTEND_URL'))

# For Render deployment, get frontend URL from service
render_frontend_host = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if render_frontend_host:
    CORS_ALLOWED_ORIGINS.extend([
        f"https://{render_frontend_host}",
        f"http://{render_frontend_host}",
    ])

# Allow CORS for development and staging
CORS_ALLOW_ALL_ORIGINS = os.environ.get('ALLOW_ALL_CORS', 'False').lower() == 'true'
CORS_ALLOW_CREDENTIALS = True

# Additional CORS settings for API communication
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding', 
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'cache-control',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Security headers for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# SSL settings for Render
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'True').lower() == 'true'

# Logging configuration for Render
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'assets_management': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# File upload settings for Render
FILE_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50MB

# Cache configuration (optional)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# Email configuration (if needed)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Time zone for production
USE_TZ = True
TIME_ZONE = 'UTC'
