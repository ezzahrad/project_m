"""
Academic models for departments, programs, subjects, and rooms.
"""
from django.db import models
from django.conf import settings
from core.models import BaseModel, AuditModel
from core.utils import generate_unique_code


class Department(AuditModel):
    """
    Academic department model.
    """
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    head = models.ForeignKey(          # ✅ nouveau champ
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, blank=True,
        related_name="departments_headed",
        verbose_name="Responsable"
    )

    class Meta:
        db_table = 'departments'
        verbose_name = 'Département'
        verbose_name_plural = 'Départements'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = generate_unique_code("DEPT", 6)
        super().save(*args, **kwargs)


class Program(AuditModel):
    """
    Academic program/filière model.
    """
    LEVEL_CHOICES = [
        ('L1', 'Licence 1'),
        ('L2', 'Licence 2'), 
        ('L3', 'Licence 3'),
        ('M1', 'Master 1'),
        ('M2', 'Master 2'),
        ('D1', 'Doctorat 1'),
        ('D2', 'Doctorat 2'),
        ('D3', 'Doctorat 3'),
    ]
    
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    level = models.CharField(max_length=5, choices=LEVEL_CHOICES)
    duration_years = models.PositiveIntegerField(default=3)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs')
    max_students = models.PositiveIntegerField(default=50)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'programs'
        verbose_name = 'Filière'
        verbose_name_plural = 'Filières'
        ordering = ['department__name', 'level', 'name']
        unique_together = ['code', 'department']
    
    def __str__(self):
        return f"{self.name} - {self.get_level_display()}"
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = generate_unique_code("PROG", 6)
        super().save(*args, **kwargs)
    
    @property
    def current_students_count(self):
        """Count of currently enrolled students."""
        from users.models import Student
        return Student.objects.filter(program=self, is_active=True).count()


class Subject(AuditModel):
    """
    Subject/matière model.
    """
    SUBJECT_TYPE_CHOICES = [
        ('COURSE', 'Cours magistral'),
        ('TD', 'Travaux dirigés'),
        ('TP', 'Travaux pratiques'),
        ('PROJECT', 'Projet'),
        ('SEMINAR', 'Séminaire'),
    ]
    
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    subject_type = models.CharField(max_length=20, choices=SUBJECT_TYPE_CHOICES, default='COURSE')
    credits = models.PositiveIntegerField(default=3)
    hours_per_week = models.PositiveIntegerField(default=2)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='subjects')
    
    class Meta:
        db_table = 'subjects'
        verbose_name = 'Matière'
        verbose_name_plural = 'Matières'
        ordering = ['department__name', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = generate_unique_code("SUBJ", 6)
        super().save(*args, **kwargs)


class Room(AuditModel):
    """
    Classroom/room model.
    """
    ROOM_TYPE_CHOICES = [
        ('AMPHITHEATER', 'Amphithéâtre'),
        ('CLASSROOM', 'Salle de classe'),
        ('LAB', 'Laboratoire'),
        ('COMPUTER_LAB', 'Salle informatique'),
        ('CONFERENCE', 'Salle de conférence'),
        ('WORKSHOP', 'Atelier'),
    ]
    
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, default='CLASSROOM')
    capacity = models.PositiveIntegerField()
    building = models.CharField(max_length=100)
    floor = models.CharField(max_length=10)
    equipment = models.TextField(blank=True, help_text="Liste des équipements disponibles")
    department = models.ForeignKey(
        Department, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='rooms',
        help_text="Département responsable de la salle"
    )
    is_available = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'rooms'
        verbose_name = 'Salle'
        verbose_name_plural = 'Salles'
        ordering = ['building', 'floor', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.building}"
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = generate_unique_code("ROOM", 6)
        super().save(*args, **kwargs)


class AcademicYear(BaseModel):
    """
    Academic year model for managing different academic periods.
    """
    name = models.CharField(max_length=20, unique=True, help_text="Format: 2023-2024")
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'academic_years'
        verbose_name = 'Année académique'
        verbose_name_plural = 'Années académiques'
        ordering = ['-start_date']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Ensure only one academic year is current
        if self.is_current:
            AcademicYear.objects.filter(is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class SubjectTeacher(AuditModel):
    """
    Many-to-many relationship between subjects and teachers.
    """
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teacher_assignments')
    teacher = models.ForeignKey('users.Teacher', on_delete=models.CASCADE, related_name='subject_assignments')
    semester = models.PositiveIntegerField(default=1)
    academic_year = models.CharField(max_length=9, help_text="Format: 2023-2024")
    
    class Meta:
        db_table = 'subject_teachers'
        verbose_name = 'Attribution matière-enseignant'
        verbose_name_plural = 'Attributions matière-enseignant'
        unique_together = ['subject', 'teacher', 'semester', 'academic_year']
    
    def __str__(self):
        return f"{self.teacher.user.get_full_name()} - {self.subject.name}"


class ProgramSubject(AuditModel):
    """
    Many-to-many relationship between programs and subjects.
    """
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='subject_assignments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='program_assignments')
    semester = models.PositiveIntegerField()
    is_mandatory = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'program_subjects'
        verbose_name = 'Matière de filière'
        verbose_name_plural = 'Matières de filières'
        unique_together = ['program', 'subject', 'semester']
    
    def __str__(self):
        return f"{self.program.name} - {self.subject.name} (S{self.semester})"