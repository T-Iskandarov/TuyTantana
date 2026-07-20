from rest_framework import serializers
from .models import Service, ServiceImage, Review
from accounts.serializers import UserSerializer

class ServiceImageSerializer(serializers.ModelSerializer):
    image_path = serializers.SerializerMethodField()

    class Meta:
        model = ServiceImage
        fields = ['id', 'image_path', 'created_at']

    def get_image_path(self, obj):
        # Return path starting with /uploads/ instead of full URL
        if obj.image_path:
            return obj.image_path.url
        return None

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['created_at']

class ServiceSerializer(serializers.ModelSerializer):
    images = ServiceImageSerializer(many=True, read_only=True)
    provider = UserSerializer(read_only=True)
    bookings = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True, required=False)
    reviews_count = serializers.IntegerField(read_only=True, required=False)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['provider', 'created_at', 'updated_at']

    def get_bookings(self, obj):
        return [{"date": b.date.strftime('%Y-%m-%d'), "status": b.status} for b in obj.bookings.exclude(status='CANCELLED')]
