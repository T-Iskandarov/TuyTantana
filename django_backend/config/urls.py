from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from services.views import UploadImageViewSet

from accounts.admin_api import AdminDashboardView, AdminUsersView, AdminServicesView, AdminBookingsView
from accounts.analytics_api import AdminAnalyticsView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/admin/dashboard', AdminDashboardView.as_view()),
    path('api/admin/users', AdminUsersView.as_view()),
    path('api/admin/services', AdminServicesView.as_view()),
    path('api/admin/bookings', AdminBookingsView.as_view()),
    path('api/admin/analytics', AdminAnalyticsView.as_view()),
    path('api/services', include('services.urls')),
    path('api/services/', include('services.urls')),
    path('api/bookings', include('bookings.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/upload/<int:pk>', UploadImageViewSet.as_view({'post': 'create'})),
    path('api/upload/<int:pk>/delete', UploadImageViewSet.as_view({'delete': 'destroy'})),
    path('api/upload/<int:pk>/main', UploadImageViewSet.as_view({'post': 'set_main'})),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
