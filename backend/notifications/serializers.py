"""
Serializers for notifications.
"""
from rest_framework import serializers
from .models import Notification, NotificationTemplate, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model.
    """
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    schedule_title = serializers.CharField(source='schedule.title', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'notification_type_display', 'title', 
                 'message', 'priority', 'priority_display', 'schedule', 'schedule_title',
                 'makeup_session', 'is_read', 'read_at', 'created_at']
        read_only_fields = ['id', 'read_at', 'created_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for NotificationPreference model.
    """
    class Meta:
        model = NotificationPreference
        fields = ['email_schedule_changes', 'email_cancellations', 'email_makeups',
                 'email_conflicts', 'sms_urgent_only', 'sms_cancellations',
                 'push_all', 'push_schedule_changes', 'push_reminders',
                 'reminder_minutes_before', 'quiet_hours_start', 'quiet_hours_end']