"""
Serializers for user-related models.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, Teacher, Student, UserPreferences


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name', 'role', 'phone']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create preferences
        UserPreferences.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Email ou mot de passe incorrect.")
            if not user.is_active:
                raise serializers.ValidationError("Ce compte est désactivé.")
            attrs['user'] = user
        else:
            raise serializers.ValidationError("Email et mot de passe requis.")
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display_french', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'full_name', 'role', 'role_display', 'phone', 'avatar', 
                 'is_email_verified', 'date_joined', 'last_login']
        read_only_fields = ['id', 'username', 'role', 'date_joined', 'last_login']


class TeacherProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for teacher profile.
    """
    user = UserProfileSerializer(read_only=True)
    teacher_type_display = serializers.CharField(source='get_teacher_type_display', read_only=True)
    
    class Meta:
        model = Teacher
        fields = ['id', 'user', 'employee_id', 'teacher_type', 'teacher_type_display',
                 'specialization', 'office_location', 'max_hours_per_week', 'is_active']


class StudentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for student profile.
    """
    user = UserProfileSerializer(read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    department_name = serializers.CharField(source='program.department.name', read_only=True)
    academic_year = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'student_id', 'program', 'program_name', 
                 'department_name', 'enrollment_year', 'current_semester',
                 'academic_year', 'is_active']


class UserPreferencesSerializer(serializers.ModelSerializer):
    """
    Serializer for user preferences.
    """
    language_display = serializers.CharField(source='get_language_display', read_only=True)
    theme_display = serializers.CharField(source='get_theme_display', read_only=True)
    
    class Meta:
        model = UserPreferences
        fields = ['language', 'language_display', 'theme', 'theme_display',
                 'timezone', 'email_notifications', 'sms_notifications']


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing password.
    """
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mot de passe actuel incorrect.")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Les nouveaux mots de passe ne correspondent pas.")
        return attrs
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user