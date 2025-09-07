"""
Views for scheduling management.
"""
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import datetime, timedelta
from core.permissions import IsPedagogicalAdmin, IsDepartmentHead, IsProgramHead, IsTeacher

from .models import TimeSlot, Schedule, TeacherUnavailability, MakeupSession, ScheduleConflict
from .serializers import (
    TimeSlotSerializer, ScheduleSerializer, ScheduleDetailSerializer,
    TeacherUnavailabilitySerializer, MakeupSessionSerializer, 
    ScheduleConflictSerializer, ScheduleCreateSerializer
)


class TimeSlotListCreateView(generics.ListCreateAPIView):
    """
    List all time slots or create a new time slot.
    """
    queryset = TimeSlot.objects.filter(is_active=True)
    serializer_class = TimeSlotSerializer
    permission_classes = [IsPedagogicalAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['day_of_week']
    ordering_fields = ['day_of_week', 'start_time']
    ordering = ['day_of_week', 'start_time']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ScheduleListCreateView(generics.ListCreateAPIView):
    """
    List all schedules or create a new schedule.
    """
    queryset = Schedule.objects.filter(is_active=True)
    permission_classes = [IsDepartmentHead]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['subject', 'teacher', 'room', 'time_slot__day_of_week', 'is_cancelled']
    search_fields = ['title', 'subject__name', 'teacher__user__first_name', 'teacher__user__last_name']
    ordering_fields = ['start_date', 'time_slot__day_of_week', 'time_slot__start_time']
    ordering = ['start_date', 'time_slot__day_of_week', 'time_slot__start_time']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ScheduleCreateSerializer
        return ScheduleSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Schedule.objects.filter(is_active=True)
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        
        # Role-based filtering
        if user.role == 'DEPT_HEAD':
            try:
                department = user.teacher_profile.department_head
                queryset = queryset.filter(subject__department=department)
            except:
                queryset = queryset.none()
        elif user.role == 'PROG_HEAD':
            try:
                program = user.teacher_profile.program_head
                queryset = queryset.filter(programs=program)
            except:
                queryset = queryset.none()
        elif user.role == 'TEACHER':
            try:
                teacher = user.teacher_profile
                queryset = queryset.filter(teacher=teacher)
            except:
                queryset = queryset.none()
        elif user.role == 'STUDENT':
            try:
                student = user.student_profile
                queryset = queryset.filter(programs=student.program)
            except:
                queryset = queryset.none()
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a schedule.
    """
    queryset = Schedule.objects.filter(is_active=True)
    serializer_class = ScheduleDetailSerializer
    permission_classes = [IsDepartmentHead]
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class TeacherUnavailabilityListCreateView(generics.ListCreateAPIView):
    """
    List teacher unavailabilities or create a new one.
    """
    queryset = TeacherUnavailability.objects.filter(is_active=True)
    serializer_class = TeacherUnavailabilitySerializer
    permission_classes = [IsTeacher]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['teacher', 'unavailability_type', 'is_all_day']
    ordering = ['-start_date']
    
    def get_queryset(self):
        user = self.request.user
        queryset = TeacherUnavailability.objects.filter(is_active=True)
        
        if user.role == 'TEACHER':
            try:
                teacher = user.teacher_profile
                queryset = queryset.filter(teacher=teacher)
            except:
                queryset = queryset.none()
        
        return queryset
    
    def perform_create(self, serializer):
        if self.request.user.role == 'TEACHER':
            serializer.save(
                teacher=self.request.user.teacher_profile,
                created_by=self.request.user
            )
        else:
            serializer.save(created_by=self.request.user)


class MakeupSessionListCreateView(generics.ListCreateAPIView):
    """
    List makeup sessions or create a new one.
    """
    queryset = MakeupSession.objects.filter(is_active=True)
    serializer_class = MakeupSessionSerializer
    permission_classes = [IsTeacher]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'original_schedule__teacher']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        queryset = MakeupSession.objects.filter(is_active=True)
        
        if user.role == 'TEACHER':
            try:
                teacher = user.teacher_profile
                queryset = queryset.filter(original_schedule__teacher=teacher)
            except:
                queryset = queryset.none()
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ScheduleConflictListView(generics.ListAPIView):
    """
    List all scheduling conflicts.
    """
    queryset = ScheduleConflict.objects.filter(is_resolved=False)
    serializer_class = ScheduleConflictSerializer
    permission_classes = [IsDepartmentHead]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['conflict_type', 'severity', 'is_resolved']
    ordering = ['-severity', '-created_at']


@api_view(['GET'])
@permission_classes([IsDepartmentHead])
def weekly_schedule(request):
    """
    Get weekly schedule for a specific week.
    """
    week_start = request.GET.get('week_start')
    program_id = request.GET.get('program_id')
    teacher_id = request.GET.get('teacher_id')
    room_id = request.GET.get('room_id')
    
    if not week_start:
        # Default to current week
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
    else:
        week_start = datetime.strptime(week_start, '%Y-%m-%d').date()
    
    week_end = week_start + timedelta(days=6)
    
    # Base queryset
    queryset = Schedule.objects.filter(
        is_active=True,
        is_cancelled=False,
        start_date__lte=week_end,
        end_date__gte=week_start
    )
    
    # Apply filters
    if program_id:
        queryset = queryset.filter(programs=program_id)
    if teacher_id:
        queryset = queryset.filter(teacher_id=teacher_id)
    if room_id:
        queryset = queryset.filter(room_id=room_id)
    
    # Organize by day and time
    weekly_data = {}
    for day in range(7):  # Monday to Sunday
        day_date = week_start + timedelta(days=day)
        day_schedules = queryset.filter(
            time_slot__day_of_week=day,
            start_date__lte=day_date,
            end_date__gte=day_date
        ).order_by('time_slot__start_time')
        
        weekly_data[day] = {
            'date': day_date.isoformat(),
            'day_name': day_date.strftime('%A'),
            'schedules': ScheduleSerializer(day_schedules, many=True).data
        }
    
    return Response({
        'week_start': week_start.isoformat(),
        'week_end': week_end.isoformat(),
        'schedule': weekly_data
    })


@api_view(['POST'])
@permission_classes([IsDepartmentHead])
def check_conflicts(request):
    """
    Check for scheduling conflicts.
    """
    schedule_data = request.data
    
    conflicts = []
    
    # Check room conflicts
    room_conflicts = Schedule.objects.filter(
        room_id=schedule_data.get('room'),
        time_slot_id=schedule_data.get('time_slot'),
        start_date__lte=schedule_data.get('end_date'),
        end_date__gte=schedule_data.get('start_date'),
        is_active=True,
        is_cancelled=False
    )
    
    if schedule_data.get('id'):
        room_conflicts = room_conflicts.exclude(id=schedule_data['id'])
    
    if room_conflicts.exists():
        conflicts.append({
            'type': 'ROOM_CONFLICT',
            'message': f"Salle déjà occupée pendant ce créneau",
            'conflicting_schedules': ScheduleSerializer(room_conflicts, many=True).data
        })
    
    # Check teacher conflicts
    teacher_conflicts = Schedule.objects.filter(
        teacher_id=schedule_data.get('teacher'),
        time_slot_id=schedule_data.get('time_slot'),
        start_date__lte=schedule_data.get('end_date'),
        end_date__gte=schedule_data.get('start_date'),
        is_active=True,
        is_cancelled=False
    )
    
    if schedule_data.get('id'):
        teacher_conflicts = teacher_conflicts.exclude(id=schedule_data['id'])
    
    if teacher_conflicts.exists():
        conflicts.append({
            'type': 'TEACHER_CONFLICT',
            'message': f"Enseignant déjà occupé pendant ce créneau",
            'conflicting_schedules': ScheduleSerializer(teacher_conflicts, many=True).data
        })
    
    return Response({
        'has_conflicts': len(conflicts) > 0,
        'conflicts': conflicts
    })


@api_view(['POST'])
@permission_classes([IsDepartmentHead])
def approve_makeup_session(request, makeup_id):
    """
    Approve or reject a makeup session.
    """
    try:
        makeup = MakeupSession.objects.get(id=makeup_id, is_active=True)
        action = request.data.get('action')  # 'approve' or 'reject'
        
        if action == 'approve':
            makeup.status = 'APPROVED'
            makeup.approved_by = request.user
            makeup.approval_date = timezone.now()
        elif action == 'reject':
            makeup.status = 'REJECTED'
            makeup.approved_by = request.user
            makeup.approval_date = timezone.now()
        else:
            return Response(
                {'error': 'Action invalide. Utilisez "approve" ou "reject"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        makeup.save()
        
        return Response({
            'message': f'Séance de rattrapage {"approuvée" if action == "approve" else "rejetée"}',
            'makeup_session': MakeupSessionSerializer(makeup).data
        })
    
    except MakeupSession.DoesNotExist:
        return Response(
            {'error': 'Séance de rattrapage non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsTeacher])
def teacher_schedule(request):
    """
    Get teacher's personal schedule.
    """
    try:
        teacher = request.user.teacher_profile
        
        # Get date range
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        if not start_date or not end_date:
            # Default to current week
            today = timezone.now().date()
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        schedules = Schedule.objects.filter(
            teacher=teacher,
            start_date__lte=end_date,
            end_date__gte=start_date,
            is_active=True
        ).order_by('time_slot__day_of_week', 'time_slot__start_time')
        
        # Get unavailabilities
        unavailabilities = TeacherUnavailability.objects.filter(
            teacher=teacher,
            start_date__lte=end_date,
            end_date__gte=start_date,
            is_active=True
        )
        
        return Response({
            'schedules': ScheduleSerializer(schedules, many=True).data,
            'unavailabilities': TeacherUnavailabilitySerializer(unavailabilities, many=True).data,
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        })
    
    except:
        return Response(
            {'error': 'Profil enseignant non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
def student_schedule(request):
    """
    Get student's program schedule.
    """
    try:
        student = request.user.student_profile
        
        # Get date range
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        if not start_date or not end_date:
            # Default to current week
            today = timezone.now().date()
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        schedules = Schedule.objects.filter(
            programs=student.program,
            start_date__lte=end_date,
            end_date__gte=start_date,
            is_active=True,
            is_cancelled=False
        ).order_by('time_slot__day_of_week', 'time_slot__start_time')
        
        return Response({
            'schedules': ScheduleSerializer(schedules, many=True).data,
            'program': {
                'id': student.program.id,
                'name': student.program.name,
                'level': student.program.level
            },
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        })
    
    except:
        return Response(
            {'error': 'Profil étudiant non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsTeacher])
def cancel_schedule(request, schedule_id):
    """
    Cancel a schedule and optionally create a makeup session.
    """
    try:
        schedule = Schedule.objects.get(id=schedule_id, is_active=True)
        
        # Check if user can cancel this schedule
        if (request.user.role == 'TEACHER' and 
            schedule.teacher != request.user.teacher_profile):
            return Response(
                {'error': 'Vous ne pouvez annuler que vos propres cours'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        cancellation_reason = request.data.get('reason', '')
        create_makeup = request.data.get('create_makeup', False)
        
        schedule.is_cancelled = True
        schedule.cancellation_reason = cancellation_reason
        schedule.save()
        
        response_data = {
            'message': 'Cours annulé avec succès',
            'schedule': ScheduleSerializer(schedule).data
        }
        
        # Create makeup session if requested
        if create_makeup:
            makeup_data = request.data.get('makeup_data', {})
            if makeup_data:
                makeup = MakeupSession.objects.create(
                    original_schedule=schedule,
                    proposed_date=makeup_data.get('proposed_date'),
                    proposed_time_slot_id=makeup_data.get('proposed_time_slot'),
                    proposed_room_id=makeup_data.get('proposed_room'),
                    reason=f"Rattrapage pour: {cancellation_reason}",
                    created_by=request.user
                )
                response_data['makeup_session'] = MakeupSessionSerializer(makeup).data
        
        return Response(response_data)
    
    except Schedule.DoesNotExist:
        return Response(
            {'error': 'Emploi du temps non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsDepartmentHead])
def scheduling_statistics(request):
    """
    Get scheduling statistics.
    """
    user = self.request.user
    
    # Base statistics
    stats = {
        'total_schedules': Schedule.objects.filter(is_active=True).count(),
        'active_schedules': Schedule.objects.filter(is_active=True, is_cancelled=False).count(),
        'cancelled_schedules': Schedule.objects.filter(is_active=True, is_cancelled=True).count(),
        'pending_makeups': MakeupSession.objects.filter(status='PENDING', is_active=True).count(),
        'unresolved_conflicts': ScheduleConflict.objects.filter(is_resolved=False).count(),
    }
    
    # Role-based filtering
    if user.role == 'DEPT_HEAD':
        try:
            department = user.teacher_profile.department_head
            base_filter = {'subject__department': department}
            
            stats.update({
                'department_schedules': Schedule.objects.filter(is_active=True, **base_filter).count(),
                'department_conflicts': ScheduleConflict.objects.filter(
                    schedule1__subject__department=department,
                    is_resolved=False
                ).count(),
            })
        except:
            pass
    
    return Response(stats)