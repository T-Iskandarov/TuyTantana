from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'phone_number', 'role', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'phone_number', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=validated_data.get('role', 'USER')
        )
        return user
