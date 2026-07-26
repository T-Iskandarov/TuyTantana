from django.db import models
from accounts.models import User

class Service(models.Model):
    TYPE_CHOICES = (
        ('TUYXONA', 'To\'yxona'),
        ('FOTO_VIDEO', 'Foto va Video'),
        ('XONANDA', 'Xonanda va Musiqa'),
        ('SALON', 'To\'y salonlari'),
        ('KORTEJ', 'Kortej xizmati'),
        ('TASHKILOTCHI', 'To\'y tashkilotchilari'),
        ('LIBOSLAR', 'Liboslar'),
        ('AKSESSUARLAR', 'Aksessuarlar'),
    )

    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='services')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    name = models.CharField(max_length=255)
    capacity = models.IntegerField(null=True, blank=True)
    price = models.FloatField(default=0, null=True, blank=True)
    location_name = models.CharField(max_length=255, null=True, blank=True)
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    extra_services = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ServiceImage(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='images')
    image_path = models.ImageField(upload_to='services/')
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_main', 'id']

class Review(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.name} - {self.service.name} ({self.rating} stars)"
