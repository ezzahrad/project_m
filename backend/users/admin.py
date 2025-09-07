"""
Admin configuration for user models.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Teacher, Student, UserPreferences


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active', 'is_email_verified', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['date_joined']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informations supplémentaires', {
            'fields': ('role', 'phone', 'avatar', 'is_email_verified')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Informations supplémentaires', {
            'fields': ('email', 'first_name', 'last_name', 'role', 'phone')
        }),
    )


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['user', 'employee_id', 'teacher_type', 'specialization', 'max_hours_per_week', 'is_active']
    list_filter = ['teacher_type', 'is_active']
    search_fields = ['user__first_name', 'user__last_name', 'employee_id', 'specialization']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['user', 'student_id', 'enrollment_year', 'current_semester', 'is_active']
    list_filter = ['enrollment_year', 'current_semester', 'is_active']
    search_fields = ['user__first_name', 'user__last_name', 'student_id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = ['user', 'language', 'theme', 'email_notifications', 'sms_notifications']
    list_filter = ['language', 'theme', 'email_notifications', 'sms_notifications']
    search_fields = ['user__first_name', 'user__last_name']