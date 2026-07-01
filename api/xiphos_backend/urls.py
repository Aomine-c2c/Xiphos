from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def health(request):
    return JsonResponse({"status": "ok", "service": "xiphos-backend"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health, name="health"),
    path("api/crm/", include("crm.urls")),
    path("api/portal/", include("portal.urls")),
    path("api/cms/", include("cms.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/tickets/", include("tickets.urls")),
    path("api/invoices/", include("invoices.urls")),
    path("api/analytics/", include("analytics.urls")),
]
