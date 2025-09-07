"""
ASGI config for gestion_edt project.
"""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestion_edt.settings')
application = get_asgi_application()