from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from academic.models import Department
from scheduling.models import TimeSlot

User = get_user_model()

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Endpoint pour vérifier que l'API fonctionne"""
    try:
        # Tester la base de données
        user_count = User.objects.count()
        
        return Response({
            'status': 'OK',
            'message': 'API GestionEDT fonctionne correctement',
            'version': '1.0.0',
            'database': 'Connected',
            'users_count': user_count,
            'endpoints': {
                'auth': '/api/auth/',
                'users': '/api/users/',
                'academic': '/api/academic/',
                'scheduling': '/api/scheduling/',
                'admin': '/admin/',
                'docs': '/api/docs/'
            }
        })
    except Exception as e:
        return Response({
            'status': 'ERROR',
            'message': f'Erreur de base de données: {str(e)}',
            'version': '1.0.0'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def test_data(request):
    """Endpoint pour créer des données de test"""
    try:
        # Créer des utilisateurs de test s'ils n'existent pas
        if not User.objects.filter(email='admin@gestionedt.com').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@gestionedt.com',
                password='password',
                first_name='Admin',
                last_name='System',
                role='ADMIN'
            )
        
        if not User.objects.filter(email='dept@gestionedt.com').exists():
            User.objects.create_user(
                username='dept_head',
                email='dept@gestionedt.com',
                password='password',
                first_name='Jean',
                last_name='Dupont',
                role='DEPT_HEAD'
            )
        
        if not User.objects.filter(email='teacher@gestionedt.com').exists():
            User.objects.create_user(
                username='teacher',
                email='teacher@gestionedt.com',
                password='password',
                first_name='Marie',
                last_name='Martin',
                role='TEACHER'
            )
        
        if not User.objects.filter(email='student@gestionedt.com').exists():
            User.objects.create_user(
                username='student',
                email='student@gestionedt.com',
                password='password',
                first_name='Pierre',
                last_name='Durand',
                role='STUDENT'
            )
        
        return Response({
            'status': 'OK',
            'message': 'Données de test créées avec succès',
            'test_accounts': [
                {'email': 'admin@gestionedt.com', 'password': 'password', 'role': 'ADMIN'},
                {'email': 'dept@gestionedt.com', 'password': 'password', 'role': 'DEPT_HEAD'},
                {'email': 'teacher@gestionedt.com', 'password': 'password', 'role': 'TEACHER'},
                {'email': 'student@gestionedt.com', 'password': 'password', 'role': 'STUDENT'},
            ]
        })
    except Exception as e:
        return Response({
            'status': 'ERROR',
            'message': f'Erreur lors de la création des données de test: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
