from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, MetricViewSet

router = DefaultRouter()
router.register(r"events", EventViewSet, basename="event")
metrics_router = DefaultRouter()
metrics_router.register(r"metrics", MetricViewSet, basename="metric")
app_name = "analytics"
urlpatterns = [path("", include(router.urls)), path("", include(metrics_router.urls))]