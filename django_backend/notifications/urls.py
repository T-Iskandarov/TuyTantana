from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, mark_as_read, mark_all_as_read

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = [
    path('read-all/', mark_all_as_read, name='mark-all-read'),
    path('<int:pk>/read/', mark_as_read, name='mark-read'),
    path('', include(router.urls)),
]
