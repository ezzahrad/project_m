"""
Serializers for scheduling models.
"""
from rest_framework import serializers
from django.utils import timezone
from .models import TimeSlot, Schedule, ScheduleProgram, TeacherUnavailability, MakeupSession, ScheduleConflict
from academic.serializers import SubjectSerializer, RoomSerializer
from users.serializers import TeacherProfileSerializer


class TimeSlotSerializer(serializers.ModelSerializer):
    """
    Serializer for TimeSlot model.
    """
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = TimeSlot
        fields = ['id', 'day_of_week', 'day_display', 'start_time', 'end_time', 
                 'duration_minutes', 'name', 'is_active', 'created_at']
        read_only_fields = ['id', 'duration_minutes', 'created_at']


class ScheduleProgramSerializer(serializers.ModelSerializer):
    """
    Serializer for ScheduleProgram model.
    """
    program_name = serializers.CharField(source='program.name', read_only=True)
    
    class Meta:
        model = ScheduleProgram
        fields = ['id', 'program', 'program_name', 'is_mandatory', 'is_active']


class ScheduleSerializer(serializers.ModelSerializer):
    """
    Serializer for Schedule model.
    """
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    time_slot_display = serializers.CharField(source='time_slot.__str__', read_only=True)
    programs_list = ScheduleProgramSerializer(source='scheduleprogram_set', many=True, read_only=True)
    
    class Meta:
        model = Schedule
        fields = ['id', 'title', 'subject', 'subject_name', 'teacher', 'teacher_name',
                 'room', 'room_name', 'time_slot', 'time_slot_display', 'programs_list',
                 'start_date', 'end_date', 'student_count', 'notes', 'is_cancelled',
                 'cancellation_reason', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ScheduleDetailSerializer(ScheduleSerializer):
    """
    Detailed serializer for Schedule with full related objects.
    """
    subject = SubjectSerializer(read_only=True)
    teacher = TeacherProfileSerializer(read_only=True)
    room = RoomSerializer(read_only=True)
    time_slot = TimeSlotSerializer(read_only=True)
    
    class Meta(ScheduleSerializer.Meta):
        fields = ScheduleSerializer.Meta.fields


class TeacherUnavailabilitySerializer(serializers.ModelSerializer):
    """
    Serializer for TeacherUnavailability model.
    """
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    unavailability_type_display = serializers.CharField(source='get_unavailability_type_display', read_only=True)
    
    class Meta:
        model = TeacherUnavailability
        fields = ['id', 'teacher', 'teacher_name', 'start_date', 'end_date',
                 'start_time', 'end_time', 'unavailability_type', 'unavailability_type_display',
                 'reason', 'is_all_day', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class MakeupSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for MakeupSession model.
    """
    original_subject = serializers.CharField(source='original_schedule.subject.name', read_only=True)
    original_teacher = serializers.CharField(source='original_schedule.teacher.user.get_full_name', read_only=True)
    proposed_time_display = serializers.CharField(source='proposed_time_slot.__str__', read_only=True)
    proposed_room_name = serializers.CharField(source='proposed_room.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = MakeupSession
        fields = ['id', 'original_schedule', 'original_subject', 'original_teacher',
                 'proposed_date', 'proposed_time_slot', 'proposed_time_display',
                 'proposed_room', 'proposed_room_name', 'status', 'status_display',
                 'reason', 'approved_by', 'approved_by_name', 'approval_date',
                 'is_active', 'created_at']
        read_only_fields = ['id', 'approved_by', 'approval_date', 'created_at']


class ScheduleConflictSerializer(serializers.ModelSerializer):
    """
    Serializer for ScheduleConflict model.
    """
    schedule1_title = serializers.CharField(source='schedule1.title', read_only=True)
    schedule2_title = serializers.CharField(source='schedule2.title', read_only=True)
    conflict_type_display = serializers.CharField(source='get_conflict_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    
    class Meta:
        model = ScheduleConflict
        fields = ['id', 'schedule1', 'schedule1_title', 'schedule2', 'schedule2_title',
                 'conflict_type', 'conflict_type_display', 'severity', 'severity_display',
                 'description', 'is_resolved', 'resolution_notes', 'resolved_by',
                 'resolved_by_name', 'resolved_at', 'created_at']
        read_only_fields = ['id', 'resolved_by', 'resolved_at', 'created_at']


class ScheduleCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating schedules with program assignments.
    """
    programs = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        help_text="Liste des IDs des filières"
    )
    
    class Meta:
        model = Schedule
        fields = ['subject', 'teacher', 'room', 'time_slot', 'start_date', 'end_date',
                 'student_count', 'notes', 'programs']
    
    def create(self, validated_data):
        programs_ids = validated_data.pop('programs', [])
        schedule = Schedule.objects.create(**validated_data)
        
        # Assign programs
        for program_id in programs_ids:
            ScheduleProgram.objects.create(
                schedule=schedule,
                program_id=program_id
            )
        
        return schedule