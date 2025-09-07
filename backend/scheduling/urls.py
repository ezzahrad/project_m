"""
URL configuration for scheduling app.
"""
from django.urls import path
from . import views

app_name = 'scheduling'

urlpatterns = [
    # Time Slots
    path('time-slots/', views.TimeSlotListCreateView.as_view(), name='timeslot-list'),
    
    # Schedules
    path('schedules/', views.ScheduleListCreateView.as_view(), name='schedule-list'),
    path('schedules/<int:pk>/', views.ScheduleDetailView.as_view(), name='schedule-detail'),
    path('schedules/<int:schedule_id>/cancel/', views.cancel_schedule, name='cancel-schedule'),
    path('schedules/weekly/', views.weekly_schedule, name='weekly-schedule'),
    path('schedules/conflicts/check/', views.check_conflicts, name='check-conflicts'),
    
    # Teacher specific
    path('teacher/schedule/', views.teacher_schedule, name='teacher-schedule'),
    path('teacher/unavailabilities/', views.TeacherUnavailabilityListCreateView.as_view(), name='teacher-unavailability'),
    
    # Student specific  
    path('student/schedule/', views.student_schedule, name='student-schedule'),
    
    # Makeup Sessions
    path('makeup-sessions/', views.MakeupSessionListCreateView.as_view(), name='makeup-list'),
    path('makeup-sessions/<int:makeup_id>/approve/', views.approve_makeup_session, name='approve-makeup'),
    
    # Conflicts
    path('conflicts/', views.ScheduleConflictListView.as_view(), name='conflict-list'),
    
    # Statistics
    path('statistics/', views.scheduling_statistics, name='scheduling-stats'),
]