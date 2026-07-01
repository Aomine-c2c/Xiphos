from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ["id", "account", "subject", "description", "status", "priority", "assignee", "created_at", "updated_at"]
