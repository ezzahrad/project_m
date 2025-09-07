"""
Views for user authentication and profile management.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

from .models import Teacher, Student, UserPreferences
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    TeacherProfileSerializer, StudentProfileSerializer, UserPreferencesSerializer,
    ChangePasswordSerializer
)

User = get_user_model()


@method_decorator(ratelimit(key='ip', rate='5/m', method='POST'), name='post')
class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        return Response({
            'message': 'Inscription réussie',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'access': access_token,
                'refresh': refresh_token,
            }
        }, status=status.HTTP_201_CREATED)


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')
class LoginView(TokenObtainPairView):
    """
    Enhanced login view with rate limiting.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        return Response({
            'message': 'Connexion réussie',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'access': access_token,
                'refresh': refresh_token,
            }
        })


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    User profile view for retrieving and updating profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class TeacherProfileView(generics.RetrieveUpdateAPIView):
    """
    Teacher profile view.
    """
    serializer_class = TeacherProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        try:
            return self.request.user.teacher_profile
        except Teacher.DoesNotExist:
            return None
    
    def get(self, request, *args, **kwargs):
        teacher = self.get_object()
        if not teacher:
            return Response(
                {'error': 'Profil enseignant non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(teacher)
        return Response(serializer.data)


class StudentProfileView(generics.RetrieveUpdateAPIView):
    """
    Student profile view.
    """
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        try:
            return self.request.user.student_profile
        except Student.DoesNotExist:
            return None
    
    def get(self, request, *args, **kwargs):
        student = self.get_object()
        if not student:
            return Response(
                {'error': 'Profil étudiant non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(student)
        return Response(serializer.data)


class UserPreferencesView(generics.RetrieveUpdateAPIView):
    """
    User preferences view.
    """
    serializer_class = UserPreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        preferences, created = UserPreferences.objects.get_or_create(
            user=self.request.user
        )
        return preferences


class ChangePasswordView(generics.GenericAPIView):
    """
    Change password view.
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @method_decorator(ratelimit(key='user', rate='5/h', method='POST'))
    def post(self, request):
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Mot de passe modifié avec succès'
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    Logout view to blacklist refresh token.
    """
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'message': 'Déconnexion réussie'
        })
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la déconnexion'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics based on user role.
    """
    user = request.user
    stats = {}
    
    if user.is_admin:
        stats = {
            'total_users': User.objects.filter(is_active=True).count(),
            'total_teachers': Teacher.objects.filter(is_active=True).count(),
            'total_students': Student.objects.filter(is_active=True).count(),
        }
        
        # Add more admin-specific stats
        from academic.models import Department, Program
        from scheduling.models import Schedule
        
        stats.update({
            'total_departments': Department.objects.filter(is_active=True).count(),
            'total_programs': Program.objects.filter(is_active=True).count(),
            'active_schedules': Schedule.objects.filter(is_active=True, is_cancelled=False).count(),
        })
    
    elif user.is_teacher:
        # Teacher-specific stats
        from scheduling.models import Schedule
        
        try:
            teacher = user.teacher_profile
            stats = {
                'weekly_hours': Schedule.objects.filter(
                    teacher=teacher,
                    is_active=True,
                    is_cancelled=False
                ).count() * 2,  # Assuming 2 hours per session
                'total_subjects': teacher.subject_assignments.filter(is_active=True).count(),
            }
        except Teacher.DoesNotExist:
            stats = {'error': 'Profil enseignant non trouvé'}
    
    elif user.is_student:
        # Student-specific stats
        try:
            student = user.student_profile
            stats = {
                'current_semester': student.current_semester,
                'academic_year': student.academic_year,
                'program': student.program.name,
                'department': student.program.department.name,
            }
        except Student.DoesNotExist:
            stats = {'error': 'Profil étudiant non trouvé'}
    
    return Response(stats)