"""
WSGI config for gestion_edt project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestion_edt.settings')
application = get_wsgi_application()