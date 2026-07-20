from django.urls import path
from .views import BookingViewSet, provider_bookings, update_booking_status, block_date, unblock_date

urlpatterns = [
    path('', BookingViewSet.as_view({'post': 'create'})),
    path('my', BookingViewSet.as_view({'get': 'list'})),
    path('provider', provider_bookings),
    path('<int:pk>/status', update_booking_status),
    path('block', block_date),
    path('unblock', unblock_date),
]
