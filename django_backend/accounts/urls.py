from django.urls import path
from .views import RegisterView, CustomTokenObtainPairView, MeView

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', CustomTokenObtainPairView.as_view(), name='login'),
    path('me', MeView.as_view(), name='me'),
]
