from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.models import User
from services.models import Service
from bookings.models import Booking
from django.db.models import Count

class IsSuperAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'SUPERADMIN')

class AdminDashboardView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        total_users = User.objects.count()
        total_providers = User.objects.filter(role='PROVIDER').count()
        total_services = Service.objects.count()
        total_bookings = Booking.objects.count()
        pending_bookings = Booking.objects.filter(status='PENDING').count()
        confirmed_bookings = Booking.objects.filter(status='CONFIRMED').count()
        
        db_services_by_type = dict(Service.objects.values_list('type').annotate(_count=Count('id')))
        services_by_type = [{'type': choice[0], 'label': choice[1], '_count': db_services_by_type.get(choice[0], 0)} for choice in Service.TYPE_CHOICES]

        return Response({
            'success': True,
            'data': {
                'totalUsers': total_users,
                'totalProviders': total_providers,
                'totalServices': total_services,
                'totalBookings': total_bookings,
                'pendingBookings': pending_bookings,
                'confirmedBookings': confirmed_bookings,
                'servicesByType': services_by_type,
            }
        })

class AdminUsersView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        users = User.objects.annotate(
            services_count=Count('services', distinct=True),
            bookings_count=Count('bookings', distinct=True)
        ).order_by('-created_at')
        
        data = []
        for u in users:
            data.append({
                'id': u.id,
                'name': u.name,
                'phone_number': u.phone_number,
                'role': u.role,
                'created_at': u.created_at,
                '_count': {
                    'services': u.services_count,
                    'bookings': u.bookings_count,
                }
            })
        return Response({'success': True, 'data': data})

class AdminServicesView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        services = Service.objects.select_related('provider').annotate(
            bookings_count=Count('bookings', distinct=True)
        ).order_by('-created_at')
        
        data = []
        for s in services:
            data.append({
                'id': s.id,
                'name': s.name,
                'type': s.type,
                'price': s.price,
                'provider': {
                    'name': s.provider.name if s.provider else None,
                    'phone_number': s.provider.phone_number if s.provider else None,
                },
                '_count': {
                    'bookings': s.bookings_count,
                }
            })
        return Response({'success': True, 'data': data})

class AdminBookingsView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        bookings = Booking.objects.select_related('user', 'service').order_by('-created_at')
        
        data = []
        for b in bookings:
            data.append({
                'id': b.id,
                'date': b.date,
                'status': b.status,
                'user': {
                    'name': b.user.name if b.user else None,
                    'phone_number': b.user.phone_number if b.user else None,
                },
                'service': {
                    'name': b.service.name if b.service else None,
                    'price': b.service.price if b.service else None,
                }
            })
        return Response({'success': True, 'data': data})
