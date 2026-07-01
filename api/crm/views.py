from rest_framework import viewsets, permissions
from .models import Organization, Lead, Opportunity, Activity
from .serializers import OrganizationSerializer, LeadSerializer, OpportunitySerializer, ActivitySerializer

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAdminUser]

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.select_related("organization").all()
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAdminUser]

class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.select_related("organization").all()
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAdminUser]

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.select_related("organization").all()
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAdminUser]
