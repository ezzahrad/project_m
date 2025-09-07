"""
URL configuration for academic app.
"""
from django.urls import path
from . import views

app_name = 'academic'

urlpatterns = [
    # Departments
    path('departments/', views.DepartmentListCreateView.as_view(), name='department-list'),
    path('departments/<int:pk>/', views.DepartmentDetailView.as_view(), name='department-detail'),
    path('departments/<int:department_id>/stats/', views.department_statistics, name='department-stats'),
    
    # Programs
    path('programs/', views.ProgramListCreateView.as_view(), name='program-list'),
    path('programs/<int:pk>/', views.ProgramDetailView.as_view(), name='program-detail'),
    
    # Subjects
    path('subjects/', views.SubjectListCreateView.as_view(), name='subject-list'),
    path('subjects/<int:pk>/', views.SubjectDetailView.as_view(), name='subject-detail'),
    
    # Rooms
    path('rooms/', views.RoomListCreateView.as_view(), name='room-list'),
    path('rooms/<int:pk>/', views.RoomDetailView.as_view(), name='room-detail'),
    path('rooms/available/', views.available_rooms, name='available-rooms'),
    
    # Academic Years
    path('academic-years/', views.AcademicYearListCreateView.as_view(), name='academic-year-list'),
]