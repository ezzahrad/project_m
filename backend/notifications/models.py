"""
Models for notifications system.
"""
from django.db import models
from core.models import BaseModel


class Notification(BaseModel):
    """
    Notification model for system-wide notifications.
    """
    NOTIFICATION_TYPE_CHOICES = [
        ('SCHEDULE_CREATED', 'Emploi du temps créé'),
        ('SCHEDULE_UPDATED', 'Emploi du temps modifié'),
        ('SCHEDULE_CANCELLED', 'Cours annulé'),
        ('MAKEUP_REQUESTED', 'Rattrapage demandé'),
        ('MAKEUP_APPROVED', 'Rattrapage approuvé'),
        ('MAKEUP_REJECTED', 'Rattrapage rejeté'),
        ('CONFLICT_DETECTED', 'Conflit détecté'),
        ('ROOM_CHANGED', 'Changement de salle'),
        ('TEACHER_UNAVAILABLE', 'Enseignant indisponible'),
        ('SYSTEM_MAINTENANCE', 'Maintenance système'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Faible'),
        ('MEDIUM', 'Moyenne'),
        ('HIGH', 'Élevée'),
        ('URGENT', 'Urgente'),
    ]
    
    recipient = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    
    # Related objects
    schedule = models.ForeignKey(
        'scheduling.Schedule', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='notifications'
    )
    makeup_session = models.ForeignKey(
        'scheduling.MakeupSession',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Delivery channels
    sent_email = models.BooleanField(default=False)
    sent_sms = models.BooleanField(default=False)
    sent_push = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.recipient.get_full_name()}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class NotificationTemplate(BaseModel):
    """
    Template for generating notifications.
    """
    notification_type = models.CharField(max_length=30, unique=True)
    title_template = models.CharField(max_length=200)
    message_template = models.TextField()
    default_priority = models.CharField(max_length=10, default='MEDIUM')
    
    # Delivery settings
    send_email = models.BooleanField(default=True)
    send_sms = models.BooleanField(default=False)
    send_push = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'notification_templates'
        verbose_name = 'Modèle de notification'
        verbose_name_plural = 'Modèles de notifications'
    
    def __str__(self):
        return f"Template: {self.notification_type}"


class NotificationPreference(BaseModel):
    """
    User notification preferences.
    """
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email preferences
    email_schedule_changes = models.BooleanField(default=True)
    email_cancellations = models.BooleanField(default=True)
    email_makeups = models.BooleanField(default=True)
    email_conflicts = models.BooleanField(default=False)
    
    # SMS preferences
    sms_urgent_only = models.BooleanField(default=True)
    sms_cancellations = models.BooleanField(default=False)
    
    # Push preferences
    push_all = models.BooleanField(default=True)
    push_schedule_changes = models.BooleanField(default=True)
    push_reminders = models.BooleanField(default=True)
    
    # Timing preferences
    reminder_minutes_before = models.PositiveIntegerField(default=30)
    quiet_hours_start = models.TimeField(default='22:00')
    quiet_hours_end = models.TimeField(default='08:00')
    
    class Meta:
        db_table = 'notification_preferences'
        verbose_name = 'Préférences de notification'
        verbose_name_plural = 'Préférences de notifications'
    
    def __str__(self):
        return f"Préférences de {self.user.get_full_name()}"