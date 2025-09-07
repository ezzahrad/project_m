"""
Models for scheduling and timetable management.
"""
from django.db import models
from django.core.exceptions import ValidationError
from core.models import BaseModel, AuditModel
from core.utils import validate_time_slot, calculate_duration, ConflictChecker


class TimeSlot(BaseModel):
    """
    Time slot model for defining class periods.
    """
    DAY_CHOICES = [
        (0, 'Lundi'),
        (1, 'Mardi'),
        (2, 'Mercredi'),
        (3, 'Jeudi'),
        (4, 'Vendredi'),
        (5, 'Samedi'),
        (6, 'Dimanche'),
    ]
    
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(blank=True)
    name = models.CharField(max_length=100, blank=True, help_text="Ex: Créneau 1, Matin, etc.")
    
    class Meta:
        db_table = 'time_slots'
        verbose_name = 'Créneau horaire'
        verbose_name_plural = 'Créneaux horaires'
        ordering = ['day_of_week', 'start_time']
        unique_together = ['day_of_week', 'start_time', 'end_time']
    
    def __str__(self):
        day_name = dict(self.DAY_CHOICES)[self.day_of_week]
        return f"{day_name} {self.start_time.strftime('%H:%M')}-{self.end_time.strftime('%H:%M')}"
    
    def clean(self):
        validate_time_slot(self.start_time, self.end_time)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        if not self.duration_minutes:
            self.duration_minutes = calculate_duration(self.start_time, self.end_time)
        super().save(*args, **kwargs)


class Schedule(AuditModel):
    """
    Main schedule model linking subjects, teachers, rooms, and time slots.
    """
    title = models.CharField(max_length=200, blank=True)
    subject = models.ForeignKey('academic.Subject', on_delete=models.CASCADE, related_name='schedules')
    teacher = models.ForeignKey('users.Teacher', on_delete=models.CASCADE, related_name='schedules')
    room = models.ForeignKey('academic.Room', on_delete=models.CASCADE, related_name='schedules')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='schedules')
    programs = models.ManyToManyField('academic.Program', through='ScheduleProgram')
    
    start_date = models.DateField(help_text="Date de début de ce cours")
    end_date = models.DateField(help_text="Date de fin de ce cours")
    
    student_count = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    
    is_cancelled = models.BooleanField(default=False)
    cancellation_reason = models.CharField(max_length=500, blank=True)
    
    class Meta:
        db_table = 'schedules'
        verbose_name = 'Emploi du temps'
        verbose_name_plural = 'Emplois du temps'
        ordering = ['start_date', 'time_slot__day_of_week', 'time_slot__start_time']
    
    def __str__(self):
        return (f"{self.subject.name} - {self.teacher.user.get_full_name()} - "
                f"{self.room.name} - {self.time_slot}")
    
    def clean(self):
        if self.end_date < self.start_date:
            raise ValidationError("La date de fin doit être postérieure à la date de début.")
        
        # Check for conflicts
        if hasattr(self, 'room') and hasattr(self, 'time_slot'):
            # Check room availability
            room_available, room_message = ConflictChecker.check_room_conflict(
                self.room, self.time_slot, self.start_date, exclude_schedule=self
            )
            if not room_available:
                raise ValidationError(f"Conflit de salle: {room_message}")
            
            # Check teacher availability
            teacher_available, teacher_message = ConflictChecker.check_teacher_conflict(
                self.teacher, self.time_slot, self.start_date, exclude_schedule=self
            )
            if not teacher_available:
                raise ValidationError(f"Conflit d'enseignant: {teacher_message}")
    
    def save(self, *args, **kwargs):
        if not self.title:
            self.title = f"{self.subject.name} - {self.time_slot}"
        self.full_clean()
        super().save(*args, **kwargs)
    
    @property
    def is_recurring(self):
        """Check if this is a recurring schedule."""
        return (self.end_date - self.start_date).days > 7


class ScheduleProgram(BaseModel):
    """
    Many-to-many relationship between schedules and programs.
    """
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    program = models.ForeignKey('academic.Program', on_delete=models.CASCADE)
    is_mandatory = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'schedule_programs'
        verbose_name = 'Programme d\'emploi du temps'
        verbose_name_plural = 'Programmes d\'emploi du temps'
        unique_together = ['schedule', 'program']
    
    def __str__(self):
        return f"{self.schedule.subject.name} - {self.program.name}"


class TeacherUnavailability(AuditModel):
    """
    Teacher unavailability periods.
    """
    UNAVAILABILITY_TYPE_CHOICES = [
        ('SICK_LEAVE', 'Congé maladie'),
        ('VACATION', 'Vacances'),
        ('CONFERENCE', 'Conférence'),
        ('MEETING', 'Réunion'),
        ('PERSONAL', 'Personnel'),
        ('OTHER', 'Autre'),
    ]
    
    teacher = models.ForeignKey('users.Teacher', on_delete=models.CASCADE, related_name='unavailabilities')
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    unavailability_type = models.CharField(max_length=20, choices=UNAVAILABILITY_TYPE_CHOICES)
    reason = models.TextField()
    is_all_day = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'teacher_unavailabilities'
        verbose_name = 'Indisponibilité enseignant'
        verbose_name_plural = 'Indisponibilités enseignants'
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.teacher.user.get_full_name()} - {self.start_date} to {self.end_date}"
    
    def clean(self):
        if self.end_date < self.start_date:
            raise ValidationError("La date de fin doit être postérieure à la date de début.")
        
        if not self.is_all_day:
            if not self.start_time or not self.end_time:
                raise ValidationError("Les heures de début et fin sont requises pour les indisponibilités partielles.")
            validate_time_slot(self.start_time, self.end_time)


class MakeupSession(AuditModel):
    """
    Makeup/catch-up sessions for cancelled classes.
    """
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('APPROVED', 'Approuvée'),
        ('REJECTED', 'Rejetée'),
        ('COMPLETED', 'Terminée'),
    ]
    
    original_schedule = models.ForeignKey(
        Schedule, 
        on_delete=models.CASCADE, 
        related_name='makeup_sessions',
        help_text="Cours original à rattraper"
    )
    
    proposed_date = models.DateField()
    proposed_time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    proposed_room = models.ForeignKey('academic.Room', on_delete=models.CASCADE)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    reason = models.TextField(help_text="Raison du rattrapage")
    
    approved_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_makeups'
    )
    approval_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'makeup_sessions'
        verbose_name = 'Séance de rattrapage'
        verbose_name_plural = 'Séances de rattrapage'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Rattrapage: {self.original_schedule.subject.name} - {self.proposed_date}"


class ScheduleConflict(BaseModel):
    """
    Track scheduling conflicts for resolution.
    """
    CONFLICT_TYPE_CHOICES = [
        ('ROOM_DOUBLE_BOOKING', 'Double réservation de salle'),
        ('TEACHER_DOUBLE_BOOKING', 'Enseignant sur plusieurs créneaux'),
        ('STUDENT_GROUP_CONFLICT', 'Conflit de groupe d\'étudiants'),
        ('CAPACITY_EXCEEDED', 'Capacité de salle dépassée'),
        ('TEACHER_UNAVAILABLE', 'Enseignant indisponible'),
    ]
    
    SEVERITY_CHOICES = [
        ('LOW', 'Faible'),
        ('MEDIUM', 'Moyenne'),
        ('HIGH', 'Élevée'),
        ('CRITICAL', 'Critique'),
    ]
    
    schedule1 = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='conflicts_as_first')
    schedule2 = models.ForeignKey(
        Schedule, 
        on_delete=models.CASCADE, 
        related_name='conflicts_as_second',
        null=True,
        blank=True
    )
    
    conflict_type = models.CharField(max_length=30, choices=CONFLICT_TYPE_CHOICES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='MEDIUM')
    description = models.TextField()
    
    is_resolved = models.BooleanField(default=False)
    resolution_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_conflicts'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'schedule_conflicts'
        verbose_name = 'Conflit d\'emploi du temps'
        verbose_name_plural = 'Conflits d\'emploi du temps'
        ordering = ['-severity', '-created_at']
    
    def __str__(self):
        return f"{self.get_conflict_type_display()} - {self.schedule1.subject.name}"


class TimetableGeneration(AuditModel):
    """
    Track automatic timetable generation attempts.
    """
    STATUS_CHOICES = [
        ('RUNNING', 'En cours'),
        ('COMPLETED', 'Terminée'),
        ('FAILED', 'Échouée'),
        ('CANCELLED', 'Annulée'),
    ]
    
    academic_year = models.ForeignKey('academic.AcademicYear', on_delete=models.CASCADE)
    department = models.ForeignKey('academic.Department', on_delete=models.CASCADE, null=True, blank=True)
    programs = models.ManyToManyField('academic.Program', blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='RUNNING')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    parameters = models.JSONField(
        default=dict,
        help_text="Paramètres utilisés pour la génération"
    )
    results = models.JSONField(
        default=dict,
        help_text="Résultats et statistiques de la génération"
    )
    
    error_message = models.TextField(blank=True)
    
    class Meta:
        db_table = 'timetable_generations'
        verbose_name = 'Génération d\'emploi du temps'
        verbose_name_plural = 'Générations d\'emploi du temps'
        ordering = ['-start_time']
    
    def __str__(self):
        return f"Génération {self.academic_year.name} - {self.status}"