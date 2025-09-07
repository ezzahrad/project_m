"""
Admin configuration for academic models.
"""
from django.contrib import admin
from .models import Department, Program, AcademicYear, Subject, Room


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['code', 'created_at', 'updated_at']


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'level', 'department', 'is_active']
    list_filter = ['level', 'department', 'is_active']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['code', 'created_at', 'updated_at']


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'subject_type', 'credits', 'hours_per_week', 'department', 'is_active']
    list_filter = ['subject_type', 'department', 'is_active']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['code', 'created_at', 'updated_at']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'room_type', 'capacity', 'building', 'floor', 'is_available', 'is_active']
    list_filter = ['room_type', 'building', 'is_available', 'is_active']
    search_fields = ['name', 'code', 'building', 'equipment']
    readonly_fields = ['code', 'created_at', 'updated_at']


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_date', 'end_date', 'is_current', 'is_active']
    list_filter = ['is_current', 'is_active']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']