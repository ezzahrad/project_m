"""
User models for authentication and role management.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import BaseModel

class User(AbstractUser):
    """
    Custom user model with role-based authentication.
    """
    ROLE_CHOICES = [
        ('ADMIN', 'Administrateur pédagogique'),
        ('DEPT_HEAD', 'Chef de département'),
        ('PROG_HEAD', 'Chef de filière'),
        ('TEACHER', 'Enseignant'),
        ('STUDENT', 'Étudiant'),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def get_role_display_french(self):
        return dict(self.ROLE_CHOICES).get(self.role, self.role)

    @property
    def is_admin(self):
        return self.role == 'ADMIN'

    @property
    def is_department_head(self):
        return self.role == 'DEPT_HEAD'

    @property
    def is_program_head(self):
        return self.role == 'PROG_HEAD'

    @property
    def is_teacher(self):
        return self.role == 'TEACHER'

    @property
    def is_student(self):
        return self.role == 'STUDENT'


class Teacher(BaseModel):
    """
    Extended profile for teachers.
    """
    TEACHER_TYPE_CHOICES = [
        ('FULL_TIME', 'Temps plein'),
        ('PART_TIME', 'Temps partiel'),
        ('VISITING', 'Vacataire'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    teacher_type = models.CharField(max_length=20, choices=TEACHER_TYPE_CHOICES, default='FULL_TIME')
    specialization = models.CharField(max_length=200, blank=True)
    office_location = models.CharField(max_length=100, blank=True)
    max_hours_per_week = models.PositiveIntegerField(default=40)

    class Meta:
        db_table = 'teachers'
        verbose_name = 'Enseignant'
        verbose_name_plural = 'Enseignants'

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"


class Student(BaseModel):
    """
    Extended profile for students.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=20, unique=True)
    enrollment_year = models.PositiveIntegerField()
    current_semester = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'students'
        verbose_name = 'Étudiant'
        verbose_name_plural = 'Étudiants'

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.student_id})"

    @property
    def academic_year(self):
        from datetime import datetime
        current_year = datetime.now().year
        return current_year - self.enrollment_year + 1


class UserPreferences(BaseModel):
    """
    User preferences for UI customization.
    """
    LANGUAGE_CHOICES = [
        ('fr', 'Français'),
        ('en', 'English'),
        ('ar', 'العربية'),
    ]

    THEME_CHOICES = [
        ('light', 'Clair'),
        ('dark', 'Sombre'),
        ('auto', 'Automatique'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='fr')
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    timezone = models.CharField(max_length=50, default='Europe/Paris')
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)

    class Meta:
        db_table = 'user_preferences'
        verbose_name = 'Préférences utilisateur'
        verbose_name_plural = 'Préférences utilisateurs'

    def __str__(self):
        return f"Préférences de {self.user.get_full_name()}"
