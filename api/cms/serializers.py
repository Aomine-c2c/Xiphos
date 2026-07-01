from rest_framework import serializers
from .models import Page, Post, Media, Menu, Redirect

class MenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu
        fields = ["id", "title", "slug", "order", "is_active", "created_at"]

class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ["id", "title", "slug", "body", "published", "menu", "created_at", "updated_at"]

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ["id", "title", "slug", "excerpt", "body", "published", "published_at", "created_at"]

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ["id", "file", "alt_text", "created_at"]

class RedirectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Redirect
        fields = ["id", "old_path", "new_path", "permanent"]
