from rest_framework import serializers
from .models import Invoice, LineItem, Payment

class LineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LineItem
        fields = ["id", "invoice", "description", "quantity", "unit_price", "total"]
        read_only_fields = ["total"]

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "invoice", "amount", "method", "reference", "paid_at"]

class InvoiceSerializer(serializers.ModelSerializer):
    lines = LineItemSerializer(many=True)
    payments = PaymentSerializer(many=True)

    class Meta:
        model = Invoice
        fields = ["id", "account", "number", "status", "amount", "currency", "due", "issued_at", "issued_by", "lines", "payments", "created_at"]

    def create(self, validated_data):
        lines = validated_data.pop("lines", [])
        payment_data = validated_data.pop("payments", [])
        invoice = Invoice.objects.create(**validated_data)
        for line in lines:
            LineItem.objects.create(invoice=invoice, **line)
        if payment_data:
            Payment.objects.create(invoice=invoice, **payment_data[0])
        return invoice
