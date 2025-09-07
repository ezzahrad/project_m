"""
Admin configuration for scheduling models.
"""
from django.contrib import admin
from .models import TimeSlot, Schedule, TeacherUnavailability, MakeupSession, ScheduleConflict, TimetableGeneration


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['day_of_week', 'start_time', 'end_time', 'duration_minutes', 'name', 'is_active']
    list_filter = ['day_of_week', 'is_active']
    search_fields = ['name']
    readonly_fields = ['duration_minutes', 'created_at', 'updated_at']


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['title', 'subject', 'teacher', 'room', 'time_slot', 'start_date', 'end_date', 'is_cancelled']
    list_filter = ['is_cancelled', 'is_active', 'start_date', 'time_slot__day_of_week']
    search_fields = ['title', 'subject__name', 'teacher__user__first_name', 'teacher__user__last_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TeacherUnavailability)
class TeacherUnavailabilityAdmin(admin.ModelAdmin):
    list_display = ['teacher', 'start_date', 'end_date', 'unavailability_type', 'is_all_day']
    list_filter = ['unavailability_type', 'is_all_day', 'is_active']
    search_fields = ['teacher__user__first_name', 'teacher__user__last_name', 'reason']


@admin.register(MakeupSession)
class MakeupSessionAdmin(admin.ModelAdmin):
    list_display = ['original_schedule', 'proposed_date', 'status', 'approved_by', 'approval_date']
    list_filter = ['status', 'is_active']
    search_fields = ['original_schedule__subject__name', 'reason']


@admin.register(ScheduleConflict)
class ScheduleConflictAdmin(admin.ModelAdmin):
    list_display = ['schedule1', 'conflict_type', 'severity', 'is_resolved', 'resolved_by']
    list_filter = ['conflict_type', 'severity', 'is_resolved']
    search_fields = ['description']


@admin.register(TimetableGeneration)
class TimetableGenerationAdmin(admin.ModelAdmin):
    list_display = ['academic_year', 'department', 'status', 'start_time', 'end_time']
    list_filter = ['status', 'academic_year']
    readonly_fields = ['start_time', 'end_time']