"""
WSGI config for mini project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

import shutil

if os.environ.get('VERCEL') == '1':
    source_db = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'db.sqlite3')
    dest_db = '/tmp/db.sqlite3'
    if os.path.exists(source_db) and not os.path.exists(dest_db):
        shutil.copy2(source_db, dest_db)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mini.settings')

application = get_wsgi_application()
app = application
