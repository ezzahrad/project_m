"""
Utility functions for the application.
"""
import uuid
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError
from django.utils import timezone


def generate_unique_code(prefix="", length=8):
    """
    Generate a unique code with optional prefix.
    """
    code = str(uuid.uuid4()).replace('-', '')[:length].upper()
    return f"{prefix}{code}" if prefix else code


def validate_time_slot(start_time, end_time):
    """
    Validate that start time is before end time.
    """
    if start_time >= end_time:
        raise ValidationError("L'heure de début doit être antérieure à l'heure de fin.")


def calculate_duration(start_time, end_time):
    """
    Calculate duration between two times in minutes.
    """
    start_datetime = datetime.combine(datetime.today(), start_time)
    end_datetime = datetime.combine(datetime.today(), end_time)
    
    if end_datetime < start_datetime:
        end_datetime += timedelta(days=1)
    
    duration = end_datetime - start_datetime
    return int(duration.total_seconds() / 60)


def get_week_dates(date=None):
    """
    Get the start and end dates of the week for a given date.
    """
    if date is None:
        date = timezone.now().date()
    
    start_of_week = date - timedelta(days=date.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    
    return start_of_week, end_of_week


def check_time_conflict(start_time1, end_time1, start_time2, end_time2):
    """
    Check if two time periods conflict.
    """
    return not (end_time1 <= start_time2 or start_time1 >= end_time2)


class ConflictChecker:
    """
    Utility class for checking scheduling conflicts.
    """
    
    @staticmethod
    def check_room_conflict(room, time_slot, date, exclude_schedule=None):
        """
        Check if a room is available at a specific time slot and date.
        """
        from scheduling.models import Schedule
        
        conflicting_schedules = Schedule.objects.filter(
            room=room,
            time_slot__day_of_week=date.weekday(),
            start_date__lte=date,
            end_date__gte=date,
            is_active=True,
            is_cancelled=False
        )
        
        if exclude_schedule:
            conflicting_schedules = conflicting_schedules.exclude(id=exclude_schedule.id)
        
        for schedule in conflicting_schedules:
            if check_time_conflict(
                time_slot.start_time, 
                time_slot.end_time,
                schedule.time_slot.start_time,
                schedule.time_slot.end_time
            ):
                return False, f"Salle {room.name} déjà occupée de {schedule.time_slot.start_time} à {schedule.time_slot.end_time}"
        
        return True, "Salle disponible"
    
    @staticmethod
    def check_teacher_conflict(teacher, time_slot, date, exclude_schedule=None):
        """
        Check if a teacher is available at a specific time slot and date.
        """
        from scheduling.models import Schedule
        
        conflicting_schedules = Schedule.objects.filter(
            teacher=teacher,
            time_slot__day_of_week=date.weekday(),
            start_date__lte=date,
            end_date__gte=date,
            is_active=True,
            is_cancelled=False
        )
        
        if exclude_schedule:
            conflicting_schedules = conflicting_schedules.exclude(id=exclude_schedule.id)
        
        for schedule in conflicting_schedules:
            if check_time_conflict(
                time_slot.start_time,
                time_slot.end_time,
                schedule.time_slot.start_time,
                schedule.time_slot.end_time
            ):
                return False, f"Enseignant {teacher.user.get_full_name()} déjà occupé de {schedule.time_slot.start_time} à {schedule.time_slot.end_time}"
        
        return True, "Enseignant disponible"