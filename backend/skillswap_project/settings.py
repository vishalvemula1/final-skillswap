#backend/skillswap_project/settings.py

import os
import pymysql
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize PyMySQL
pymysql.install_as_MySQLdb()

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-demo-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
# Handle DEBUG as string (case-insensitive) to avoid issues with different platforms
DEBUG_ENV = os.environ.get('DEBUG', 'True').lower()
DEBUG = DEBUG_ENV in ('true', '1', 'yes')
print(f"🔧 Django DEBUG mode: {DEBUG} (from env: {DEBUG_ENV})")

# Parse ALLOWED_HOSTS from environment variable (comma-separated)
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Add support for Render.com deployment
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',  # For React frontend
    'skillswap_app',  # Our main app
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # For serving static files in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'skillswap_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'skillswap_project.wsgi.application'

# Database - MySQL configuration
# Support for both environment variables and DATABASE_URL (for Render)
DATABASES = {
    'default': {
        'ENGINE': os.environ.get('DB_ENGINE', 'django.db.backends.mysql'),
        'NAME': os.environ.get('DB_NAME', 'skillswap'),
        'USER': os.environ.get('DB_USER', 'root'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '3306'),
        'OPTIONS': {
            'sql_mode': 'traditional',
        }
    }
}

# Parse DATABASE_URL if provided (for services like Render)
import dj_database_url
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES['default'] = dj_database_url.parse(DATABASE_URL) # type: ignore

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'  # Indian timezone
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# WhiteNoise configuration for serving static files
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS settings for React frontend
# Parse from environment variable (comma-separated) or use defaults
CORS_ORIGINS_STRING = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,https://skillswap-frontend-31tg.onrender.com')
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_STRING.split(',')]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

# CSRF Trusted Origins - Required for Django 4.x cross-origin POST requests
# Must include the frontend domain for cookies to work properly
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://skillswap-frontend-31tg.onrender.com',
    'https://skillswap-backend-8k91.onrender.com',  # Backend itself
]

# Headers to allow
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
]

# HTTP methods to allow for CORS
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Session settings
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_SAVE_EVERY_REQUEST = True

# Session cookie settings for cross-origin requests (frontend on different domain)
# These are CRITICAL for Render deployment where frontend and backend are on different subdomains
if not DEBUG:
    # Production settings (Render)
    SESSION_COOKIE_SAMESITE = 'None'  # Allow cross-site cookies
    SESSION_COOKIE_SECURE = True      # Required when SameSite=None (HTTPS only)
    SESSION_COOKIE_HTTPONLY = True    # Prevent JavaScript access
    CSRF_COOKIE_SAMESITE = 'None'
    CSRF_COOKIE_SECURE = True
else:
    # Development settings (localhost)
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_HTTPONLY = True

# Test database configuration - Use SQLite for faster tests
import sys
if 'test' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }