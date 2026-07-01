from django.db import models
from django.utils.text import slugify


class Menu(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, editable=False)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Page(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    body = models.TextField()
    published = models.BooleanField(default=False)
    menu = models.ForeignKey(Menu, on_delete=models.SET_NULL, null=True, blank=True, related_name="pages")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Post(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    excerpt = models.TextField(blank=True)
    body = models.TextField()
    published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Media(models.Model):
    file = models.FileField(upload_to="media/")
    alt_text = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name


class Redirect(models.Model):
    old_path = models.CharField(max_length=255, unique=True)
    new_path = models.CharField(max_length=255)
    permanent = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.old_path} -> {self.new_path}"
