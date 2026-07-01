from rest_framework import serializers
from .models import Event, Metric

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ["id", "name", "category", "payload", "created_at"]

class MetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metric
        fields = ["id", "key", "value", "recorded_at"]
