from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.db import IntegrityError
from .models import Booking
from .serializers import BookingSerializer
from services.models import Service
import datetime

class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-date')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        active_bookings = [b for b in queryset if b.status != 'CANCELLED']
        total_price = sum(b.service.price for b in active_bookings)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'summary': {
                'totalBookings': len(queryset),
                'activeBookings': len(active_bookings),
                'totalPrice': total_price
            }
        })

    def create(self, request, *args, **kwargs):
        service_id = request.data.get('service_id')
        date_str = request.data.get('date')

        try:
            booking_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
            if booking_date < datetime.date.today():
                return Response({'success': False, 'message': 'O\'tgan sanani tanlab bo\'lmaydi.'}, status=400)
        except:
            return Response({'success': False, 'message': 'Noto\'g\'ri sana'}, status=400)

        try:
            service = Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            return Response({'success': False, 'message': 'Xizmat topilmadi'}, status=404)

        if service.provider == request.user:
            return Response({'success': False, 'message': 'O\'z xizmatingizni bron qila olmaysiz'}, status=400)

        # Check if booking exists
        existing = Booking.objects.filter(service=service, date=booking_date).first()
        if existing:
            if existing.status == 'CANCELLED':
                existing.user = request.user
                existing.status = 'PENDING'
                existing.save()
                serializer = self.get_serializer(existing)
                return Response({
                    'success': True,
                    'message': 'Bron qilindi!',
                    'data': serializer.data
                }, status=201)
            else:
                return Response({'success': False, 'message': 'Bu sana band'}, status=409)

        try:
            booking = Booking.objects.create(
                user=request.user,
                service=service,
                date=booking_date,
                status='PENDING'
            )
            serializer = self.get_serializer(booking)
            return Response({
                'success': True,
                'message': 'Bron qilindi!',
                'data': serializer.data
            }, status=201)
        except IntegrityError:
            return Response({'success': False, 'message': 'Bu sana band'}, status=409)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def provider_bookings(request):
    bookings = Booking.objects.filter(service__provider=request.user).order_by('-date')
    serializer = BookingSerializer(bookings, many=True)
    return Response({'success': True, 'data': serializer.data})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_booking_status(request, pk):
    try:
        booking = Booking.objects.get(id=pk)
    except Booking.DoesNotExist:
        return Response({'success': False, 'message': 'Topilmadi'}, status=404)
        
    if booking.service.provider != request.user and request.user.role != 'SUPERADMIN':
        return Response({'success': False, 'message': 'Huquq yo\'q'}, status=403)
        
    new_status = request.data.get('status')
    if new_status in ['CONFIRMED', 'CANCELLED']:
        booking.status = new_status
        booking.save()
        return Response({'success': True, 'message': 'Yangilandi', 'data': BookingSerializer(booking).data})
    return Response({'success': False, 'message': 'Xato status'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def block_date(request):
    service_id = request.data.get('service_id')
    date_str = request.data.get('date')
    
    try:
        service = Service.objects.get(id=service_id)
        if service.provider != request.user:
            return Response({'success': False, 'message': 'Huquq yo\'q'}, status=403)
            
        booking_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
        
        existing = Booking.objects.filter(service=service, date=booking_date).first()
        if existing:
            if existing.status == 'CANCELLED':
                existing.user = request.user
                existing.status = 'CONFIRMED'
                existing.save()
                return Response({'success': True, 'message': 'Band qilindi'})
            else:
                return Response({'success': False, 'message': 'Bu sana allaqachon band'}, status=409)

        Booking.objects.create(user=request.user, service=service, date=booking_date, status='CONFIRMED')
        return Response({'success': True, 'message': 'Band qilindi'})
    except IntegrityError:
        return Response({'success': False, 'message': 'Bu sana allaqachon band'}, status=409)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unblock_date(request):
    service_id = request.data.get('service_id')
    date_str = request.data.get('date')
    
    try:
        service = Service.objects.get(id=service_id)
        if service.provider != request.user:
            return Response({'success': False, 'message': 'Huquq yo\'q'}, status=403)
            
        booking = Booking.objects.get(service=service, date=date_str)
        booking.delete()
        return Response({'success': True, 'message': 'Ochildi'})
    except:
        return Response({'success': False, 'message': 'Topilmadi yoki o\'chirib bo\'lmadi'}, status=400)
