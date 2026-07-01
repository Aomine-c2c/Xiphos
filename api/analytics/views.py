from rest_framework import viewsets, permissions
from .models import Event, Metric
from .serializers import EventSerializer, MetricSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAdminUser]

class MetricViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Metric.objects.all()
    serializer_class = MetricSerializer
    permission_classes = [permissions.IsAdminUser]
