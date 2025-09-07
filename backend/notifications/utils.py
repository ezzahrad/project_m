"""
Notification utilities and services.
"""
from django.utils import timezone
from .models import Notification, NotificationTemplate, NotificationPreference


class NotificationService:
    """
    Service for sending notifications.
    """
    
    @staticmethod
    def send_notification(recipient, notification_type, title, message, **kwargs):
        """
        Send a notification to a user.
        """
        # Get or create notification template
        template, created = NotificationTemplate.objects.get_or_create(
            notification_type=notification_type,
            defaults={
                'title_template': title,
                'message_template': message,
                'default_priority': 'MEDIUM'
            }
        )
        
        # Get user preferences
        preferences, created = NotificationPreference.objects.get_or_create(
            user=recipient
        )
        
        # Create notification
        notification = Notification.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            message=message,
            priority=template.default_priority,
            schedule=kwargs.get('schedule'),
            makeup_session=kwargs.get('makeup_session')
        )
        
        # Send via different channels based on preferences
        if template.send_email and preferences.email_schedule_changes:
            NotificationService._send_email(notification)
        
        if template.send_sms and preferences.sms_urgent_only and notification.priority == 'URGENT':
            NotificationService._send_sms(notification)
        
        if template.send_push and preferences.push_all:
            NotificationService._send_push(notification)
        
        return notification
    
    @staticmethod
    def _send_email(notification):
        """
        Send email notification.
        """
        from django.core.mail import send_mail
        from django.conf import settings
        
        try:
            send_mail(
                subject=notification.title,
                message=notification.message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[notification.recipient.email],
                fail_silently=True
            )
            notification.sent_email = True
            notification.save()
        except Exception as e:
            print(f"Error sending email: {e}")
    
    @staticmethod
    def _send_sms(notification):
        """
        Send SMS notification.
        """
        # Implement SMS sending logic here
        # This would integrate with an SMS service like Twilio
        notification.sent_sms = True
        notification.save()
    
    @staticmethod
    def _send_push(notification):
        """
        Send push notification.
        """
        # Implement push notification logic here
        # This would integrate with Firebase Cloud Messaging
        notification.sent_push = True
        notification.save()
    
    @staticmethod
    def notify_schedule_change(schedule, change_type='UPDATED'):
        """
        Notify relevant users about schedule changes.
        """
        if change_type == 'CANCELLED':
            title = f"Cours annulé: {schedule.subject.name}"
            message = f"Le cours de {schedule.subject.name} prévu le {schedule.time_slot} a été annulé."
            notification_type = 'SCHEDULE_CANCELLED'
        else:
            title = f"Emploi du temps modifié: {schedule.subject.name}"
            message = f"Le cours de {schedule.subject.name} a été modifié."
            notification_type = 'SCHEDULE_UPDATED'
        
        # Notify students in affected programs
        for program_schedule in schedule.scheduleprogram_set.all():
            students = program_schedule.program.students.filter(is_active=True)
            
            for student in students:
                NotificationService.send_notification(
                    recipient=student.user,
                    notification_type=notification_type,
                    title=title,
                    message=message,
                    schedule=schedule
                )
        
        # Notify the teacher
        NotificationService.send_notification(
            recipient=schedule.teacher.user,
            notification_type=notification_type,
            title=title,
            message=message,
            schedule=schedule
        )
    
    @staticmethod
    def notify_conflict_detected(conflict):
        """
        Notify administrators about detected conflicts.
        """
        from users.models import User
        
        title = f"Conflit détecté: {conflict.get_conflict_type_display()}"
        message = conflict.description
        
        # Notify department heads and admins
        admins = User.objects.filter(
            role__in=['ADMIN', 'DEPT_HEAD'],
            is_active=True
        )
        
        for admin in admins:
            NotificationService.send_notification(
                recipient=admin,
                notification_type='CONFLICT_DETECTED',
                title=title,
                message=message,
                schedule=conflict.schedule1
            )
    
    @staticmethod
    def notify_makeup_request(makeup_session):
        """
        Notify about makeup session requests.
        """
        from users.models import User
        
        title = f"Demande de rattrapage: {makeup_session.original_schedule.subject.name}"
        message = f"Nouvelle demande de rattrapage pour le {makeup_session.proposed_date}"
        
        # Notify department heads and admins
        admins = User.objects.filter(
            role__in=['ADMIN', 'DEPT_HEAD'],
            is_active=True
        )
        
        for admin in admins:
            NotificationService.send_notification(
                recipient=admin,
                notification_type='MAKEUP_REQUESTED',
                title=title,
                message=message,
                makeup_session=makeup_session
            )