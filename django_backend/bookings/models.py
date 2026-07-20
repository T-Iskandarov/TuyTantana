from django.db import models
from accounts.models import User
from services.models import Service

class Booking(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Kutmoqda'),
        ('CONFIRMED', 'Tasdiqlangan'),
        ('CANCELLED', 'Bekor qilingan'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['service', 'date'], name='unique_service_date')
        ]

    def __str__(self):
        return f"{self.service.name} - {self.date}"
