"""
Views for notifications management.
"""
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, NotificationPreferenceSerializer


class NotificationListView(generics.ListAPIView):
    """
    List user's notifications.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user,
            is_active=True
        ).order_by('-created_at')


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """
    Get and update notification preferences.
    """
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        preferences, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preferences


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """
    Mark a notification as read.
    """
    try:
        notification = Notification.objects.get(
            id=notification_id,
            recipient=request.user,
            is_active=True
        )
        notification.mark_as_read()
        
        return Response({
            'message': 'Notification marquée comme lue',
            'notification': NotificationSerializer(notification).data
        })
    
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """
    Mark all notifications as read for the current user.
    """
    notifications = Notification.objects.filter(
        recipient=request.user,
        is_read=False,
        is_active=True
    )
    
    count = notifications.count()
    notifications.update(is_read=True, read_at=timezone.now())
    
    return Response({
        'message': f'{count} notifications marquées comme lues'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """
    Get count of unread notifications.
    """
    count = Notification.objects.filter(
        recipient=request.user,
        is_read=False,
        is_active=True
    ).count()
    
    return Response({'unread_count': count})