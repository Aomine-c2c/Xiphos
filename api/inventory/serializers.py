from rest_framework import serializers
from .models import Warehouse, Sku, Movement


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ["id", "name", "location", "created_at"]


class MovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movement
        fields = ["id", "sku", "quantity", "type", "note", "created_at"]
        read_only_fields = ["sku"]


class SkuSerializer(serializers.ModelSerializer):
    movements = MovementSerializer(many=True, read_only=True)

    class Meta:
        model = Sku
        fields = ["id", "sku", "name", "category", "quantity", "warehouse", "cost", "price", "movements", "created_at", "updated_at"]
