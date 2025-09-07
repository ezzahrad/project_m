"""
URL configuration for users app.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/teacher/', views.TeacherProfileView.as_view(), name='teacher_profile'),
    path('profile/student/', views.StudentProfileView.as_view(), name='student_profile'),
    path('preferences/', views.UserPreferencesView.as_view(), name='preferences'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
]