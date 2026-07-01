from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Account(models.Model):
    name = models.CharField(max_length=255)
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="children")
    industry = models.CharField(max_length=255, blank=True)
    billing_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Preference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="preference")
    theme = models.CharField(max_length=32, default="dark")
    notifications_enabled = models.BooleanField(default=True)
    locale = models.CharField(max_length=10, default="en")

    def __str__(self):
        return f"Preferences for {self.user}"
