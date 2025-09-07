"""
Admin configuration for notifications models.
"""
from django.contrib import admin
from .models import Notification, NotificationTemplate, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'recipient', 'notification_type', 'priority', 'is_read', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'recipient__first_name', 'recipient__last_name']
    readonly_fields = ['created_at', 'read_at']


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['notification_type', 'default_priority', 'send_email', 'send_sms', 'send_push']
    list_filter = ['default_priority', 'send_email', 'send_sms', 'send_push']
    search_fields = ['notification_type', 'title_template']


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_schedule_changes', 'sms_urgent_only', 'push_all']
    list_filter = ['email_schedule_changes', 'sms_urgent_only', 'push_all']
    search_fields = ['user__first_name', 'user__last_name']