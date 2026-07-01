from rest_framework import serializers
from .models import Organization, Lead, Opportunity, Activity

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "industry", "website", "phone", "address", "notes", "created_at", "updated_at"]

class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ["id", "organization", "contact_name", "email", "phone", "status", "source", "created_at", "updated_at"]

class OpportunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = ["id", "organization", "title", "value", "stage", "expected_close", "created_at", "updated_at"]

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ["id", "organization", "subject", "type", "due", "completed", "created_at"]
