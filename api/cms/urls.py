from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuViewSet, PageViewSet, PostViewSet, MediaViewSet, RedirectViewSet

router = DefaultRouter()
router.register(r"menus", MenuViewSet, basename="menu")
router.register(r"pages", PageViewSet, basename="page")
router.register(r"posts", PostViewSet, basename="post")
router.register(r"media", MediaViewSet, basename="media")
router.register(r"redirects", RedirectViewSet, basename="redirect")
app_name = "cms"
urlpatterns = [path("", include(router.urls))]