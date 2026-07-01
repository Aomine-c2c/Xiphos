from rest_framework import viewsets, permissions, decorators, response
from django.shortcuts import get_object_or_404
from .models import Sku, Movement
from .serializers import SkuSerializer, MovementSerializer


class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class SkuViewSet(viewsets.ModelViewSet):
    queryset = Sku.objects.select_related("warehouse").all()
    serializer_class = SkuSerializer
    permission_classes = [permissions.IsAdminUser]

    @decorators.action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def move(self, request, pk=None):
        sku = get_object_or_404(Sku, pk=pk)
        ser = MovementSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        Movement.objects.create(sku=sku, **ser.validated_data)
        return response.Response({"status": "ok"})


class MovementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MovementSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        sku_id = self.kwargs.get("sku_pk")
        if sku_id:
            return Movement.objects.filter(sku_id=sku_id)
        return Movement.objects.none()
