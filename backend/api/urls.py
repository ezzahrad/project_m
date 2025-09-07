from django.urls import path
from . import test_views

urlpatterns = [
    path('health/', test_views.health_check, name='health_check'),
    path('test-data/', test_views.test_data, name='test_data'),
]
