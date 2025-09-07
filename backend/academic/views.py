"""
Views for academic management.
"""
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from core.permissions import IsPedagogicalAdmin, IsDepartmentHead, CanManageDepartment

from .models import Department, Program, Subject, Room, SubjectTeacher, ProgramSubject, AcademicYear
from .serializers import (
    DepartmentSerializer, ProgramSerializer, SubjectSerializer, RoomSerializer,
    SubjectTeacherSerializer, ProgramSubjectSerializer, AcademicYearSerializer,
    SubjectDetailSerializer
)


class DepartmentListCreateView(generics.ListCreateAPIView):
    """
    List all departments or create a new department.
    """
    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer
    permission_classes = [IsPedagogicalAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a department.
    """
    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer
    permission_classes = [CanManageDepartment]
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    def perform_destroy(self, instance):
        # Soft delete
        instance.is_active = False
        instance.save()


class ProgramListCreateView(generics.ListCreateAPIView):
    """
    List all programs or create a new program.
    """
    queryset = Program.objects.filter(is_active=True)
    serializer_class = ProgramSerializer
    permission_classes = [IsDepartmentHead]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'level']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'level', 'created_at']
    ordering = ['department__name', 'level', 'name']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Program.objects.filter(is_active=True)
        
        if user.role == 'DEPT_HEAD':
            # Department heads can only see programs in their department
            try:
                department = user.teacher_profile.department_head
                queryset = queryset.filter(department=department)
            except:
                queryset = queryset.none()
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProgramDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a program.
    """
    queryset = Program.objects.filter(is_active=True)
    serializer_class = ProgramSerializer
    permission_classes = [IsDepartmentHead]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Program.objects.filter(is_active=True)
        
        if user.role == 'DEPT_HEAD':
            try:
                department = user.teacher_profile.department_head
                queryset = queryset.filter(department=department)
            except:
                queryset = queryset.none()
        
        return queryset
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class SubjectListCreateView(generics.ListCreateAPIView):
    """
    List all subjects or create a new subject.
    """
    queryset = Subject.objects.filter(is_active=True)
    serializer_class = SubjectSerializer
    permission_classes = [IsDepartmentHead]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'subject_type']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'credits', 'hours_per_week', 'created_at']
    ordering = ['department__name', 'name']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Subject.objects.filter(is_active=True)
        
        if user.role == 'DEPT_HEAD':
            try:
                department = user.teacher_profile.department_head
                queryset = queryset.filter(department=department)
            except:
                queryset = queryset.none()
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SubjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a subject.
    """
    queryset = Subject.objects.filter(is_active=True)
    serializer_class = SubjectDetailSerializer
    permission_classes = [IsDepartmentHead]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Subject.objects.filter(is_active=True)
        
        if user.role == 'DEPT_HEAD':
            try:
                department = user.teacher_profile.department_head
                queryset = queryset.filter(department=department)
            except:
                queryset = queryset.none()
        
        return queryset
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class RoomListCreateView(generics.ListCreateAPIView):
    """
    List all rooms or create a new room.
    """
    queryset = Room.objects.filter(is_active=True)
    serializer_class = RoomSerializer
    permission_classes = [IsPedagogicalAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'room_type', 'building', 'is_available']
    search_fields = ['name', 'code', 'building', 'equipment']
    ordering_fields = ['name', 'capacity', 'building', 'created_at']
    ordering = ['building', 'floor', 'name']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a room.
    """
    queryset = Room.objects.filter(is_active=True)
    serializer_class = RoomSerializer
    permission_classes = [IsPedagogicalAdmin]
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class AcademicYearListCreateView(generics.ListCreateAPIView):
    """
    List all academic years or create a new one.
    """
    queryset = AcademicYear.objects.filter(is_active=True)
    serializer_class = AcademicYearSerializer
    permission_classes = [IsPedagogicalAdmin]
    ordering = ['-start_date']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


@api_view(['GET'])
@permission_classes([IsDepartmentHead])
def department_statistics(request, department_id):
    """
    Get statistics for a specific department.
    """
    try:
        department = Department.objects.get(id=department_id, is_active=True)
        
        # Check permissions
        if (request.user.role == 'DEPT_HEAD' and 
            hasattr(request.user, 'teacher_profile') and
            request.user.teacher_profile.department_head != department):
            return Response(
                {'error': 'Vous n\'avez pas accès à ce département'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        stats = {
            'programs_count': department.programs.filter(is_active=True).count(),
            'subjects_count': department.subjects.filter(is_active=True).count(),
            'rooms_count': department.rooms.filter(is_active=True).count(),
            'students_count': sum(
                program.current_students_count 
                for program in department.programs.filter(is_active=True)
            ),
        }
        
        return Response(stats)
    
    except Department.DoesNotExist:
        return Response(
            {'error': 'Département non trouvé'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsDepartmentHead])
def available_rooms(request):
    """
    Get list of available rooms with optional filtering by capacity and date/time.
    """
    capacity = request.GET.get('capacity')
    date = request.GET.get('date')
    start_time = request.GET.get('start_time')
    end_time = request.GET.get('end_time')
    
    queryset = Room.objects.filter(is_active=True, is_available=True)
    
    if capacity:
        queryset = queryset.filter(capacity__gte=capacity)
    
    # TODO: Add time-based availability checking when we have the scheduling models
    
    serializer = RoomSerializer(queryset, many=True)
    return Response(serializer.data)