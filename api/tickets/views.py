from rest_framework import viewsets, permissions
from .models import Ticket
from .serializers import TicketSerializer

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.select_related("account", "assignee").all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAdminUser]
