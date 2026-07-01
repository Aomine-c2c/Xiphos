from django.db import models
from django.conf import settings


class Invoice(models.Model):
    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("sent", "Sent"),
        ("paid", "Paid"),
        ("overdue", "Overdue"),
        ("canceled", "Canceled"),
    )
    account = models.ForeignKey("portal.Account", on_delete=models.CASCADE, related_name="invoices")
    number = models.CharField(max_length=64, unique=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="draft")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default="USD")
    due = models.DateField(null=True, blank=True)
    issued_at = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    issued_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.number


class LineItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="lines")
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    @property
    def total(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.description} x{self.quantity}"


class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=64, blank=True)
    reference = models.CharField(max_length=128, blank=True)
    paid_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for {self.invoice.number}"
