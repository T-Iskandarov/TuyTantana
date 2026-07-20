from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer, RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = User.objects.get(phone_number=request.data.get('phone_number'))
            token = serializer.validated_data.get('access')
            
            return Response({
                'success': True,
                'message': 'Muvaffaqiyatli kirdingiz',
                'data': {
                    'token': token,
                    'user': UserSerializer(user).data
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Telefon raqam yoki parol noto\'g\'ri'
            }, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'message': 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz',
                'data': {
                    'token': str(refresh.access_token),
                    'user': UserSerializer(user).data
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Ushbu telefon raqami allaqachon ro\'yxatdan o\'tgan.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class MeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        user = self.get_object()
        return Response({
            'success': True,
            'data': UserSerializer(user).data
        })
