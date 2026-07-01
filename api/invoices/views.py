from rest_framework import viewsets, permissions
from .models import Invoice
from .serializers import InvoiceSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related("account", "issued_by").prefetch_related("lines", "payments").all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAdminUser]
