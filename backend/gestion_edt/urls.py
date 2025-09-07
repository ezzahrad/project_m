"""
URL configuration for gestion_edt project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API Endpoints
    path('api/test/', include('api.urls')),  # Routes de test
    path('api/auth/', include('users.urls')),
    path('api/academic/', include('academic.urls')),
    path('api/scheduling/', include('scheduling.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/reports/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
