from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrganizationViewSet, LeadViewSet, OpportunityViewSet, ActivityViewSet

router = DefaultRouter()
router.register(r"organizations", OrganizationViewSet, basename="organization")
router.register(r"leads", LeadViewSet, basename="lead")
router.register(r"opportunities", OpportunityViewSet, basename="opportunity")
router.register(r"activities", ActivityViewSet, basename="activity")
app_name = "crm"
urlpatterns = [path("", include(router.urls))]