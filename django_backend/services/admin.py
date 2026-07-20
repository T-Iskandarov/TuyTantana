from django.contrib import admin
from .models import Service, ServiceImage

class ServiceImageInline(admin.TabularInline):
    model = ServiceImage
    extra = 1

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'provider', 'type', 'price', 'created_at')
    list_filter = ('type',)
    search_fields = ('name', 'provider__name')
    inlines = [ServiceImageInline]
