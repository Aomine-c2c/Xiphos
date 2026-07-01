from rest_framework import serializers
from .models import Account, Notification, Preference
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name"]

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ["id", "name", "parent", "industry", "billing_email", "created_at"]

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "user", "title", "message", "read", "created_at"]
        read_only_fields = ["user"]

class PreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preference
        fields = ["id", "user", "theme", "notifications_enabled", "locale"]
        read_only_fields = ["user"]
