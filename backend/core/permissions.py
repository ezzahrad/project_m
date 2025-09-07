"""
Custom permissions for the application.
"""
from rest_framework.permissions import BasePermission


class IsPedagogicalAdmin(BasePermission):
    """
    Permission class for pedagogical administrators.
    """
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role == 'ADMIN')


class IsDepartmentHead(BasePermission):
    """
    Permission class for department heads.
    """
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role in ['ADMIN', 'DEPT_HEAD'])


class IsProgramHead(BasePermission):
    """
    Permission class for program heads.
    """
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role in ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD'])


class IsTeacher(BasePermission):
    """
    Permission class for teachers.
    """
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role in ['ADMIN', 'DEPT_HEAD', 'PROG_HEAD', 'TEACHER'])


class IsStudent(BasePermission):
    """
    Permission class for students.
    """
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role == 'STUDENT')


class CanManageDepartment(BasePermission):
    """
    Permission class for department management.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        
        if request.user.role == 'DEPT_HEAD':
            return (hasattr(request.user, 'department_head') and 
                   request.user.department_head == obj)
        
        return False


class CanManageProgram(BasePermission):
    """
    Permission class for program management.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['ADMIN', 'DEPT_HEAD']:
            return True
        
        if request.user.role == 'PROG_HEAD':
            return (hasattr(request.user, 'program_head') and 
                   request.user.program_head == obj)
        
        return False