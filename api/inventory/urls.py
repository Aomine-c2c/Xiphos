from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SkuViewSet, MovementViewSet

router = DefaultRouter()
router.register(r"skus", SkuViewSet, basename="sku")
movement_router = DefaultRouter()
movement_router.register(r"movements", MovementViewSet, basename="movement")
app_name = "inventory"
urlpatterns = [path("", include(router.urls)), path("", include(movement_router.urls))]
