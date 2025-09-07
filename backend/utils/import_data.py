"""
Data import utilities for Excel/CSV files.
"""
import pandas as pd
from django.core.exceptions import ValidationError
from django.db import transaction
from users.models import User, Teacher, Student
from academic.models import Department, Program, Subject, Room
from scheduling.models import TimeSlot, Schedule


class ExcelImporter:
    """
    Import data from Excel files with validation.
    """
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.success_count = 0
    
    def import_teachers(self, file_path):
        """
        Import teachers from Excel file.
        Expected columns: first_name, last_name, email, employee_id, specialization, department_code
        """
        try:
            df = pd.read_excel(file_path)
            required_columns = ['first_name', 'last_name', 'email', 'employee_id']
            
            # Validate columns
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValidationError(f"Colonnes manquantes: {', '.join(missing_columns)}")
            
            with transaction.atomic():
                for index, row in df.iterrows():
                    try:
                        # Create user
                        user = User.objects.create_user(
                            username=row['email'].split('@')[0],
                            email=row['email'],
                            first_name=row['first_name'],
                            last_name=row['last_name'],
                            role='TEACHER'
                        )
                        
                        # Get department if specified
                        department = None
                        if 'department_code' in row and pd.notna(row['department_code']):
                            try:
                                department = Department.objects.get(code=row['department_code'])
                            except Department.DoesNotExist:
                                self.warnings.append(f"Ligne {index + 2}: Département {row['department_code']} non trouvé")
                        
                        # Create teacher profile
                        Teacher.objects.create(
                            user=user,
                            employee_id=row['employee_id'],
                            specialization=row.get('specialization', ''),
                            teacher_type=row.get('teacher_type', 'FULL_TIME')
                        )
                        
                        self.success_count += 1
                        
                    except Exception as e:
                        self.errors.append(f"Ligne {index + 2}: {str(e)}")
                        
        except Exception as e:
            self.errors.append(f"Erreur générale: {str(e)}")
        
        return {
            'success_count': self.success_count,
            'errors': self.errors,
            'warnings': self.warnings
        }
    
    def import_students(self, file_path):
        """
        Import students from Excel file.
        Expected columns: first_name, last_name, email, student_id, program_code, enrollment_year
        """
        try:
            df = pd.read_excel(file_path)
            required_columns = ['first_name', 'last_name', 'email', 'student_id', 'program_code']
            
            # Validate columns
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValidationError(f"Colonnes manquantes: {', '.join(missing_columns)}")
            
            with transaction.atomic():
                for index, row in df.iterrows():
                    try:
                        # Get program
                        try:
                            program = Program.objects.get(code=row['program_code'])
                        except Program.DoesNotExist:
                            self.errors.append(f"Ligne {index + 2}: Filière {row['program_code']} non trouvée")
                            continue
                        
                        # Create user
                        user = User.objects.create_user(
                            username=row['email'].split('@')[0],
                            email=row['email'],
                            first_name=row['first_name'],
                            last_name=row['last_name'],
                            role='STUDENT'
                        )
                        
                        # Create student profile
                        Student.objects.create(
                            user=user,
                            student_id=row['student_id'],
                            program=program,
                            enrollment_year=row.get('enrollment_year', datetime.now().year),
                            current_semester=row.get('current_semester', 1)
                        )
                        
                        self.success_count += 1
                        
                    except Exception as e:
                        self.errors.append(f"Ligne {index + 2}: {str(e)}")
                        
        except Exception as e:
            self.errors.append(f"Erreur générale: {str(e)}")
        
        return {
            'success_count': self.success_count,
            'errors': self.errors,
            'warnings': self.warnings
        }
    
    def import_schedules(self, file_path):
        """
        Import schedules from Excel file.
        Expected columns: subject_code, teacher_email, room_code, day_of_week, start_time, end_time, start_date, end_date, program_codes
        """
        try:
            df = pd.read_excel(file_path)
            required_columns = ['subject_code', 'teacher_email', 'room_code', 'day_of_week', 'start_time', 'end_time', 'start_date', 'end_date']
            
            # Validate columns
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValidationError(f"Colonnes manquantes: {', '.join(missing_columns)}")
            
            with transaction.atomic():
                for index, row in df.iterrows():
                    try:
                        # Get related objects
                        subject = Subject.objects.get(code=row['subject_code'])
                        teacher = Teacher.objects.get(user__email=row['teacher_email'])
                        room = Room.objects.get(code=row['room_code'])
                        
                        # Get or create time slot
                        time_slot, created = TimeSlot.objects.get_or_create(
                            day_of_week=row['day_of_week'],
                            start_time=row['start_time'],
                            end_time=row['end_time']
                        )
                        
                        # Create schedule
                        schedule = Schedule.objects.create(
                            subject=subject,
                            teacher=teacher,
                            room=room,
                            time_slot=time_slot,
                            start_date=pd.to_datetime(row['start_date']).date(),
                            end_date=pd.to_datetime(row['end_date']).date()
                        )
                        
                        # Add programs if specified
                        if 'program_codes' in row and pd.notna(row['program_codes']):
                            program_codes = str(row['program_codes']).split(',')
                            for code in program_codes:
                                try:
                                    program = Program.objects.get(code=code.strip())
                                    schedule.programs.add(program)
                                except Program.DoesNotExist:
                                    self.warnings.append(f"Ligne {index + 2}: Filière {code.strip()} non trouvée")
                        
                        self.success_count += 1
                        
                    except Exception as e:
                        self.errors.append(f"Ligne {index + 2}: {str(e)}")
                        
        except Exception as e:
            self.errors.append(f"Erreur générale: {str(e)}")
        
        return {
            'success_count': self.success_count,
            'errors': self.errors,
            'warnings': self.warnings
        }


def generate_schedule_pdf_response(schedules, filename="emploi_du_temps.pdf"):
    """
    Generate HTTP response with PDF schedule.
    """
    buffer = ScheduleExporter.export_to_pdf(schedules)
    
    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


def generate_schedule_excel_response(schedules, filename="emploi_du_temps.xlsx"):
    """
    Generate HTTP response with Excel schedule.
    """
    buffer = ScheduleExporter.export_to_excel(schedules)
    
    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


def generate_schedule_csv_response(schedules, filename="emploi_du_temps.csv"):
    """
    Generate HTTP response with CSV schedule.
    """
    buffer = ScheduleExporter.export_to_csv(schedules)
    
    response = HttpResponse(buffer.getvalue(), content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response