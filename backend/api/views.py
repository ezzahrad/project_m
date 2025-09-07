"""
Views for API utilities and reports.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.core.exceptions import ValidationError
from core.permissions import IsPedagogicalAdmin, IsDepartmentHead
from users.models import User, Teacher, Student
from academic.models import Department, Program, Subject, Room
from scheduling.models import Schedule, TimeSlot
from utils.export import (
    ScheduleExporter, 
    TeacherWorkloadExporter,
    generate_schedule_pdf_response,
    generate_schedule_excel_response,
    generate_schedule_csv_response
)
from utils.import_data import ExcelImporter
import io
import json


@api_view(['POST'])
@permission_classes([IsDepartmentHead])
def export_schedules(request):
    """
    Export schedules to various formats.
    """
    try:
        format_type = request.data.get('format', 'pdf')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        department_id = request.data.get('department_id')
        program_id = request.data.get('program_id')
        teacher_id = request.data.get('teacher_id')
        
        # Build queryset
        queryset = Schedule.objects.filter(is_active=True)
        
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        if department_id:
            queryset = queryset.filter(subject__department_id=department_id)
        if program_id:
            queryset = queryset.filter(programs=program_id)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        
        schedules = queryset.select_related(
            'subject', 'teacher__user', 'room', 'time_slot'
        ).prefetch_related('scheduleprogram_set__program')
        
        if format_type == 'pdf':
            buffer = ScheduleExporter.export_to_pdf(schedules)
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="emploi_du_temps.pdf"'
        elif format_type == 'excel':
            buffer = ScheduleExporter.export_to_excel(schedules)
            response = HttpResponse(
                buffer.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="emploi_du_temps.xlsx"'
        else:  # csv
            buffer = ScheduleExporter.export_to_csv(schedules)
            response = HttpResponse(buffer.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="emploi_du_temps.csv"'
        
        return response
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de l\'export: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsPedagogicalAdmin])
def export_teacher_workload(request):
    """
    Export teacher workload report.
    """
    try:
        format_type = request.data.get('format', 'pdf')
        department_id = request.data.get('department_id')
        
        # Get teachers
        teachers = Teacher.objects.filter(is_active=True).select_related('user')
        
        if department_id:
            # Filter by department through subject assignments
            teachers = teachers.filter(
                subject_assignments__subject__department_id=department_id
            ).distinct()
        
        if format_type == 'pdf':
            buffer = TeacherWorkloadExporter._export_pdf(teachers)
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="charge_enseignants.pdf"'
        elif format_type == 'excel':
            buffer = TeacherWorkloadExporter._export_excel(teachers)
            response = HttpResponse(
                buffer.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="charge_enseignants.xlsx"'
        else:  # csv
            buffer = TeacherWorkloadExporter._export_csv(teachers)
            response = HttpResponse(buffer.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="charge_enseignants.csv"'
        
        return response
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de l\'export: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsPedagogicalAdmin])
def import_excel_data(request):
    """
    Import data from Excel file.
    """
    try:
        if 'file' not in request.FILES:
            return Response(
                {'error': 'Aucun fichier fourni'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        import_type = request.data.get('type', 'teachers')
        
        # Save file temporarily
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_file:
            for chunk in file.chunks():
                tmp_file.write(chunk)
            tmp_file_path = tmp_file.name
        
        try:
            importer = ExcelImporter()
            
            if import_type == 'teachers':
                result = importer.import_teachers(tmp_file_path)
            elif import_type == 'students':
                result = importer.import_students(tmp_file_path)
            elif import_type == 'schedules':
                result = importer.import_schedules(tmp_file_path)
            else:
                return Response(
                    {'error': 'Type d\'import invalide'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(result)
            
        finally:
            # Clean up temporary file
            os.unlink(tmp_file_path)
            
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de l\'import: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsPedagogicalAdmin])
def get_import_template(request):
    """
    Download import template.
    """
    try:
        import_type = request.GET.get('type', 'teachers')
        
        # Create a simple Excel template
        from openpyxl import Workbook
        
        wb = Workbook()
        ws = wb.active
        
        if import_type == 'teachers':
            ws.title = "Template Enseignants"
            headers = ['first_name', 'last_name', 'email', 'employee_id', 'specialization', 'department_code']
            ws.append(headers)
            # Add sample data
            ws.append(['Jean', 'Dupont', 'jean.dupont@univ.fr', 'EMP001', 'Mathématiques', 'DEPT001'])
            
        elif import_type == 'students':
            ws.title = "Template Étudiants"
            headers = ['first_name', 'last_name', 'email', 'student_id', 'program_code', 'enrollment_year']
            ws.append(headers)
            ws.append(['Marie', 'Martin', 'marie.martin@etud.univ.fr', 'STU001', 'PROG001', '2024'])
            
        elif import_type == 'schedules':
            ws.title = "Template Emplois du temps"
            headers = ['subject_code', 'teacher_email', 'room_code', 'day_of_week', 'start_time', 'end_time', 'start_date', 'end_date']
            ws.append(headers)
            ws.append(['SUBJ001', 'jean.dupont@univ.fr', 'ROOM001', '0', '08:00', '10:00', '2024-01-15', '2024-06-15'])
        
        # Save to buffer
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="template_{import_type}.xlsx"'
        return response
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la génération du template: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_analytics(request):
    """
    Get dashboard analytics data.
    """
    try:
        user = request.user
        analytics = {}
        
        if user.role == 'ADMIN':
            analytics = {
                'total_users': User.objects.filter(is_active=True).count(),
                'total_teachers': Teacher.objects.filter(is_active=True).count(),
                'total_students': Student.objects.filter(is_active=True).count(),
                'total_departments': Department.objects.filter(is_active=True).count(),
                'total_programs': Program.objects.filter(is_active=True).count(),
                'total_subjects': Subject.objects.filter(is_active=True).count(),
                'total_rooms': Room.objects.filter(is_active=True).count(),
                'active_schedules': Schedule.objects.filter(is_active=True, is_cancelled=False).count(),
            }
        elif user.role == 'DEPT_HEAD':
            try:
                department = user.teacher_profile.department_head
                analytics = {
                    'department_programs': department.programs.filter(is_active=True).count(),
                    'department_subjects': department.subjects.filter(is_active=True).count(),
                    'department_rooms': department.rooms.filter(is_active=True).count(),
                    'department_schedules': Schedule.objects.filter(
                        subject__department=department,
                        is_active=True
                    ).count(),
                }
            except:
                analytics = {'error': 'Profil chef de département non trouvé'}
        
        return Response(analytics)
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors du chargement des analytics: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )