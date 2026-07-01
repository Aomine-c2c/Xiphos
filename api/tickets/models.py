from django.db import models
from django.conf import settings


class StatusChoices(models.TextChoices):
    OPEN = "open", "Open"
    IN_PROGRESS = "in_progress", "In Progress"
    RESOLVED = "resolved", "Resolved"
    CLOSED = "closed", "Closed"


class PriorityChoices(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"
    URGENT = "urgent", "Urgent"


class Ticket(models.Model):
    account = models.ForeignKey("portal.Account", on_delete=models.CASCADE, related_name="tickets")
    subject = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=32, choices=StatusChoices.choices, default=StatusChoices.OPEN)
    priority = models.CharField(max_length=32, choices=PriorityChoices.choices, default=PriorityChoices.MEDIUM)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subject} ({self.status})"


class TicketComment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment on {self.ticket.subject}"
