from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg
from django.db.models.functions import Coalesce
from .models import Service, ServiceImage
from .serializers import ServiceSerializer, ServiceImageSerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.annotate(
        booking_count=Count('bookings', distinct=True),
        reviews_count=Count('reviews', distinct=True),
        average_rating=Coalesce(Avg('reviews__rating'), 0.0)
    ).order_by('-created_at')
    serializer_class = ServiceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['type', 'provider']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        price_min = request.query_params.get('price_min')
        price_max = request.query_params.get('price_max')
        search = request.query_params.get('search')
        rating_min = request.query_params.get('rating_min')
        location = request.query_params.get('location')
        date = request.query_params.get('date')
        
        if search:
            queryset = queryset.filter(name__icontains=search)
        if location:
            queryset = queryset.filter(location_name__icontains=location)
        if price_min:
            try:
                queryset = queryset.filter(price__gte=float(price_min))
            except ValueError:
                pass
        if price_max:
            try:
                queryset = queryset.filter(price__lte=float(price_max))
            except ValueError:
                pass
        if rating_min:
            try:
                queryset = queryset.filter(average_rating__gte=float(rating_min))
            except ValueError:
                pass
        if date:
            # Sana bo'yicha filter: shu sanada bron qilinmagan xizmatlarni topish
            queryset = queryset.exclude(bookings__date=date, bookings__status__in=['PENDING', 'CONFIRMED'])

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            'success': True,
            'message': 'Xizmat muvaffaqiyatli qo\'shildi!',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        if instance.provider != request.user and request.user.role != 'SUPERADMIN':
            return Response({'success': False, 'message': 'Huquq yo\'q'}, status=403)
            
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            'success': True,
            'message': 'Xizmat yangilandi',
            'data': serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.provider != request.user and request.user.role != 'SUPERADMIN':
            return Response({'success': False, 'message': 'Huquq yo\'q'}, status=403)
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Xizmat o\'chirildi'
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='my/list')
    def my_list(self, request):
        services = self.get_queryset().filter(provider=request.user)
        serializer = self.get_serializer(services, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='my_reviews')
    def my_reviews(self, request):
        from .models import Review
        reviews = Review.objects.filter(user=request.user).select_related('service').order_by('-created_at')
        data = [{
            'id': r.id,
            'service_id': r.service.id,
            'service_name': r.service.name,
            'rating': r.rating,
            'comment': r.comment,
            'created_at': r.created_at
        } for r in reviews]
        return Response({
            'success': True,
            'data': data
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request, pk=None):
        service = self.get_object()
        rating = request.data.get('rating')
        comment = request.data.get('comment')

        if not rating or not comment:
            return Response({'success': False, 'message': "Baho va izoh kiritilishi shart."}, status=400)

        from .models import Review
        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                raise ValueError()
        except ValueError:
            return Response({'success': False, 'message': "Baho 1 dan 5 gacha bo'lishi kerak."}, status=400)

        review = Review.objects.create(
            service=service,
            user=request.user,
            rating=rating,
            comment=comment
        )

        from notifications.models import Notification
        Notification.objects.create(
            user=service.provider,
            title="Yangi izoh!",
            message=f"Sizning '{service.name}' xizmatingizga {request.user.name} tomonidan {rating} ⭐ baho va izoh qoldirildi:\n\n\"{comment}\""
        )

        return Response({
            'success': True,
            'message': 'Izohingiz saqlandi!'
        }, status=201)

class UploadImageViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request, pk=None):
        try:
            service = Service.objects.get(id=pk)
        except Service.DoesNotExist:
            return Response({'success': False, 'message': 'Xizmat topilmadi'}, status=404)
            
        if service.provider != request.user:
            return Response({'success': False, 'message': 'Huquq yo\'q'}, status=403)
            
        images = request.FILES.getlist('images')
        saved_images = []
        is_first_image = not service.images.exists()
        
        for index, img in enumerate(images):
            obj = ServiceImage.objects.create(
                service=service, 
                image_path=img,
                is_main=(is_first_image and index == 0)
            )
            saved_images.append(ServiceImageSerializer(obj).data)
            
        return Response({
            'success': True,
            'message': f"{len(images)} ta rasm yuklandi",
            'data': saved_images
        }, status=201)

    @action(detail=True, methods=['post'])
    def set_main(self, request, pk=None):
        try:
            img = ServiceImage.objects.get(id=pk)
        except ServiceImage.DoesNotExist:
            return Response({'success': False, 'message': 'Rasm topilmadi'}, status=404)
            
        if img.service.provider != request.user:
            return Response({'success': False, 'message': 'Huquq yo\'q'}, status=403)
            
        # Barcha rasmlarni asosiy emas qilib qo'yish
        ServiceImage.objects.filter(service=img.service).update(is_main=False)
        # Faqat tanlangan rasmni asosiy qilish
        img.is_main = True
        img.save()
        
        return Response({
            'success': True,
            'message': 'Asosiy rasm o\'rnatildi',
            'data': ServiceImageSerializer(img).data
        })

    def destroy(self, request, pk=None):
        try:
            img = ServiceImage.objects.get(id=pk)
        except ServiceImage.DoesNotExist:
            return Response({'success': False, 'message': 'Rasm topilmadi'}, status=404)
            
        if img.service.provider != request.user:
            return Response({'success': False, 'message': 'Huquq yo\'q'}, status=403)
        img.delete()
        return Response({
            'success': True,
            'message': 'Rasm o\'chirildi'
        })
