"""
Celery tasks for scheduling operations.
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Schedule, ScheduleConflict, TeacherUnavailability
from notifications.models import Notification
from core.utils import ConflictChecker


@shared_task
def detect_schedule_conflicts():
    """
    Periodic task to detect scheduling conflicts.
    """
    conflicts_found = 0
    
    # Get active schedules for the next 30 days
    start_date = timezone.now().date()
    end_date = start_date + timedelta(days=30)
    
    schedules = Schedule.objects.filter(
        is_active=True,
        is_cancelled=False,
        start_date__lte=end_date,
        end_date__gte=start_date
    )
    
    for schedule in schedules:
        # Check room conflicts
        room_available, room_message = ConflictChecker.check_room_conflict(
            schedule.room, 
            schedule.time_slot, 
            schedule.start_date,
            exclude_schedule=schedule
        )
        
        if not room_available:
            # Create conflict record
            ScheduleConflict.objects.get_or_create(
                schedule1=schedule,
                conflict_type='ROOM_DOUBLE_BOOKING',
                defaults={
                    'severity': 'HIGH',
                    'description': room_message
                }
            )
            conflicts_found += 1
        
        # Check teacher conflicts
        teacher_available, teacher_message = ConflictChecker.check_teacher_conflict(
            schedule.teacher,
            schedule.time_slot,
            schedule.start_date,
            exclude_schedule=schedule
        )
        
        if not teacher_available:
            ScheduleConflict.objects.get_or_create(
                schedule1=schedule,
                conflict_type='TEACHER_DOUBLE_BOOKING',
                defaults={
                    'severity': 'CRITICAL',
                    'description': teacher_message
                }
            )
            conflicts_found += 1
    
    return f"Détection terminée. {conflicts_found} conflits trouvés."


@shared_task
def send_schedule_reminders():
    """
    Send reminders for upcoming classes.
    """
    from notifications.utils import NotificationService
    
    # Get schedules starting in the next hour
    now = timezone.now()
    one_hour_later = now + timedelta(hours=1)
    
    # This is a simplified version - in reality, you'd need to calculate
    # which specific class instances are happening today
    upcoming_schedules = Schedule.objects.filter(
        is_active=True,
        is_cancelled=False,
        start_date__lte=now.date(),
        end_date__gte=now.date()
    )
    
    reminders_sent = 0
    
    for schedule in upcoming_schedules:
        # Send to students in the programs
        for program_schedule in schedule.scheduleprogram_set.all():
            students = program_schedule.program.students.filter(is_active=True)
            
            for student in students:
                # Check if user wants reminders
                if (hasattr(student.user, 'notification_preferences') and 
                    student.user.notification_preferences.push_reminders):
                    
                    NotificationService.send_notification(
                        recipient=student.user,
                        notification_type='SCHEDULE_REMINDER',
                        title=f"Rappel: {schedule.subject.name}",
                        message=f"Cours dans 1 heure - {schedule.room.name}",
                        schedule=schedule
                    )
                    reminders_sent += 1
    
    return f"Rappels envoyés: {reminders_sent}"


@shared_task
def cleanup_old_notifications():
    """
    Clean up old notifications (older than 30 days).
    """
    cutoff_date = timezone.now() - timedelta(days=30)
    
    deleted_count = Notification.objects.filter(
        created_at__lt=cutoff_date,
        is_read=True
    ).delete()[0]
    
    return f"Nettoyage terminé. {deleted_count} notifications supprimées."


@shared_task
def generate_weekly_reports():
    """
    Generate weekly summary reports.
    """
    from django.core.mail import send_mail
    from django.conf import settings
    
    # Get stats for the past week
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=7)
    
    total_schedules = Schedule.objects.filter(
        start_date__gte=start_date,
        end_date__lte=end_date,
        is_active=True
    ).count()
    
    cancelled_schedules = Schedule.objects.filter(
        start_date__gte=start_date,
        end_date__lte=end_date,
        is_active=True,
        is_cancelled=True
    ).count()
    
    conflicts = ScheduleConflict.objects.filter(
        created_at__gte=start_date,
        is_resolved=False
    ).count()
    
    # Send email to administrators
    subject = f"Rapport hebdomadaire - {start_date.strftime('%d/%m/%Y')} au {end_date.strftime('%d/%m/%Y')}"
    message = f"""
    Rapport hebdomadaire de GestionEDT:
    
    - Total des cours: {total_schedules}
    - Cours annulés: {cancelled_schedules}
    - Conflits non résolus: {conflicts}
    
    Cordialement,
    Système GestionEDT
    """
    
    # Get admin emails
    admin_emails = list(
        User.objects.filter(role='ADMIN', is_active=True)
        .values_list('email', flat=True)
    )
    
    if admin_emails:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            admin_emails,
            fail_silently=True
        )
    
    return f"Rapport envoyé à {len(admin_emails)} administrateurs"