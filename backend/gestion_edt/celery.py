"""
Celery configuration for gestion_edt project.
"""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestion_edt.settings')

app = Celery('gestion_edt')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()