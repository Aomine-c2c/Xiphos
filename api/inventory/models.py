from django.db import models


class Warehouse(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Sku(models.Model):
    sku = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name="skus")
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.sku


class Movement(models.Model):
    TYPE_CHOICES = (
        ("in", "Stock In"),
        ("out", "Stock Out"),
        ("adjust", "Adjustment"),
    )
    sku = models.ForeignKey(Sku, on_delete=models.CASCADE, related_name="movements")
    quantity = models.IntegerField()
    type = models.CharField(max_length=16, choices=TYPE_CHOICES)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sku.sku} {self.type} {self.quantity}"
