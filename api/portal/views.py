from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Account, Notification, Preference
from .serializers import AccountSerializer, NotificationSerializer, PreferenceSerializer, UserSerializer

User = get_user_model()

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAdminUser]

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        notif = get_object_or_404(Notification, pk=pk, user=request.user)
        notif.read = True
        notif.save()
        return Response({"status": "ok"})

class PreferenceViewSet(viewsets.GenericViewSet):
    serializer_class = PreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        pref, _ = Preference.objects.get_or_create(user=self.request.user)
        return pref

    def list(self, request, *args, **kwargs):
        return Response(self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        ser = self.get_serializer(instance, data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)
