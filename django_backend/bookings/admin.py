from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('service', 'user', 'date', 'status', 'created_at')
    list_filter = ('status', 'date')
    search_fields = ('service__name', 'user__name', 'user__phone_number')
