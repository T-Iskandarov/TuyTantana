from rest_framework import serializers
from .models import Booking
from services.serializers import ServiceSerializer
from accounts.serializers import UserSerializer

class BookingSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    service_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'user', 'service', 'service_id', 'date', 'status', 'created_at']
