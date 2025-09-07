"""
Serializers for academic models.
"""
from rest_framework import serializers
from .models import Department, Program, Subject, Room, SubjectTeacher, ProgramSubject, AcademicYear


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Department model.
    """
    head_name = serializers.CharField(source='head.user.get_full_name', read_only=True)
    programs_count = serializers.IntegerField(source='programs.count', read_only=True)
    teachers_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'head', 'head_name', 
                 'programs_count', 'teachers_count', 'is_active', 'created_at']
        read_only_fields = ['id', 'code', 'created_at']
    
    def get_teachers_count(self, obj):
        """Count teachers in department through subject assignments."""
        return obj.subjects.values('teacher_assignments__teacher').distinct().count()


class ProgramSerializer(serializers.ModelSerializer):
    """
    Serializer for Program model.
    """
    department_name = serializers.CharField(source='department.name', read_only=True)
    head_name = serializers.CharField(source='head.user.get_full_name', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    current_students_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Program
        fields = ['id', 'name', 'code', 'level', 'level_display', 'duration_years',
                 'department', 'department_name', 'head', 'head_name', 'max_students',
                 'current_students_count', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'code', 'created_at']


class SubjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Subject model.
    """
    department_name = serializers.CharField(source='department.name', read_only=True)
    subject_type_display = serializers.CharField(source='get_subject_type_display', read_only=True)
    assigned_teachers = serializers.SerializerMethodField()
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'description', 'subject_type', 
                 'subject_type_display', 'credits', 'hours_per_week',
                 'department', 'department_name', 'assigned_teachers', 
                 'is_active', 'created_at']
        read_only_fields = ['id', 'code', 'created_at']
    
    def get_assigned_teachers(self, obj):
        """Get list of assigned teachers."""
        assignments = obj.teacher_assignments.filter(is_active=True)
        return [
            {
                'id': assignment.teacher.id,
                'name': assignment.teacher.user.get_full_name(),
                'employee_id': assignment.teacher.employee_id,
            }
            for assignment in assignments
        ]


class RoomSerializer(serializers.ModelSerializer):
    """
    Serializer for Room model.
    """
    department_name = serializers.CharField(source='department.name', read_only=True)
    room_type_display = serializers.CharField(source='get_room_type_display', read_only=True)
    
    class Meta:
        model = Room
        fields = ['id', 'name', 'code', 'room_type', 'room_type_display',
                 'capacity', 'building', 'floor', 'equipment', 'department',
                 'department_name', 'is_available', 'is_active', 'created_at']
        read_only_fields = ['id', 'code', 'created_at']


class SubjectTeacherSerializer(serializers.ModelSerializer):
    """
    Serializer for SubjectTeacher assignments.
    """
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    
    class Meta:
        model = SubjectTeacher
        fields = ['id', 'subject', 'subject_name', 'teacher', 'teacher_name',
                 'semester', 'academic_year', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProgramSubjectSerializer(serializers.ModelSerializer):
    """
    Serializer for ProgramSubject assignments.
    """
    program_name = serializers.CharField(source='program.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_credits = serializers.IntegerField(source='subject.credits', read_only=True)
    
    class Meta:
        model = ProgramSubject
        fields = ['id', 'program', 'program_name', 'subject', 'subject_name',
                 'subject_credits', 'semester', 'is_mandatory', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class AcademicYearSerializer(serializers.ModelSerializer):
    """
    Serializer for AcademicYear model.
    """
    class Meta:
        model = AcademicYear
        fields = ['id', 'name', 'start_date', 'end_date', 'is_current', 
                 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate(self, attrs):
        """Validate that end_date is after start_date."""
        if attrs.get('end_date') and attrs.get('start_date'):
            if attrs['end_date'] <= attrs['start_date']:
                raise serializers.ValidationError(
                    "La date de fin doit être postérieure à la date de début."
                )
        return attrs


class SubjectDetailSerializer(SubjectSerializer):
    """
    Detailed serializer for Subject with programs and teachers.
    """
    programs = serializers.SerializerMethodField()
    teachers = serializers.SerializerMethodField()
    
    class Meta(SubjectSerializer.Meta):
        fields = SubjectSerializer.Meta.fields + ['programs', 'teachers']
    
    def get_programs(self, obj):
        """Get programs where this subject is taught."""
        assignments = obj.program_assignments.filter(is_active=True)
        return [
            {
                'id': assignment.program.id,
                'name': assignment.program.name,
                'level': assignment.program.level,
                'semester': assignment.semester,
                'is_mandatory': assignment.is_mandatory,
            }
            for assignment in assignments
        ]
    
    def get_teachers(self, obj):
        """Get teachers assigned to this subject."""
        assignments = obj.teacher_assignments.filter(is_active=True)
        return [
            {
                'id': assignment.teacher.id,
                'name': assignment.teacher.user.get_full_name(),
                'employee_id': assignment.teacher.employee_id,
                'semester': assignment.semester,
                'academic_year': assignment.academic_year,
            }
            for assignment in assignments
        ]