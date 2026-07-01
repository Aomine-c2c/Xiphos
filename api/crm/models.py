from django.db import models
from django.conf import settings

class Organization(models.Model):
    name = models.CharField(max_length=255)
    industry = models.CharField(max_length=255, blank=True)
    website = models.URLField(max_length=255, blank=True)
    phone = models.CharField(max_length=64, blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Lead(models.Model):
    STATUS_CHOICES = (
        ("new", "New"),
        ("contacted", "Contacted"),
        ("qualified", "Qualified"),
        ("lost", "Lost"),
    )
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="leads")
    contact_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=64, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="new")
    source = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.contact_name} - {self.organization.name}"


class Opportunity(models.Model):
    STAGE_CHOICES = (
        ("discovery", "Discovery"),
        ("proposal", "Proposal"),
        ("negotiation", "Negotiation"),
        ("won", "Won"),
        ("lost", "Lost"),
    )
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="opportunities")
    title = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    stage = models.CharField(max_length=32, choices=STAGE_CHOICES, default="discovery")
    expected_close = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Activity(models.Model):
    TYPE_CHOICES = (
        ("call", "Call"),
        ("email", "Email"),
        ("meeting", "Meeting"),
        ("task", "Task"),
        ("note", "Note"),
    )
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="activities")
    subject = models.CharField(max_length=255)
    type = models.CharField(max_length=32, choices=TYPE_CHOICES, default="task")
    due = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.subject
