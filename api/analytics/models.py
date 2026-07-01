from django.db import models
from django.conf import settings


class Event(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=128, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Metric(models.Model):
    key = models.CharField(max_length=255, unique=True)
    value = models.DecimalField(max_digits=20, decimal_places=6, default=0)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.key}={self.value}"
