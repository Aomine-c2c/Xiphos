from rest_framework import viewsets, permissions
from .models import Page, Post, Media, Menu, Redirect
from .serializers import PageSerializer, PostSerializer, MediaSerializer, MenuSerializer, RedirectSerializer

class MenuViewSet(viewsets.ModelViewSet):
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer
    permission_classes = [permissions.IsAdminUser]

class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.select_related("menu").all()
    serializer_class = PageSerializer
    permission_classes = [permissions.IsAdminUser]

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAdminUser]

class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    permission_classes = [permissions.IsAdminUser]

class RedirectViewSet(viewsets.ModelViewSet):
    queryset = Redirect.objects.all()
    serializer_class = RedirectSerializer
    permission_classes = [permissions.IsAdminUser]
