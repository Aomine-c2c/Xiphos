from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccountViewSet, NotificationViewSet, PreferenceViewSet

router = DefaultRouter()
router.register(r"accounts", AccountViewSet, basename="account")
router.register(r"notifications", NotificationViewSet, basename="notification")
router.register(r"preferences", PreferenceViewSet, basename="preference")
app_name = "portal"
urlpatterns = [path("", include(router.urls))]