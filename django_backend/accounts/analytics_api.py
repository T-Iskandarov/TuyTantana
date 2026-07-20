from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.models import User
from bookings.models import Booking
from services.models import Service
from django.db.models.functions import TruncHour, TruncDay, TruncMonth
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta
from .admin_api import IsSuperAdmin

class AdminAnalyticsView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        timeframe = request.query_params.get('timeframe', 'daily') # daily, monthly, yearly
        now = timezone.now()

        # Determine timeframe limits and truncation
        if timeframe == 'daily':
            start_date = now - timedelta(days=1)
            trunc_func = TruncHour
        elif timeframe == 'monthly':
            start_date = now - timedelta(days=30)
            trunc_func = TruncDay
        elif timeframe == 'yearly':
            start_date = now - timedelta(days=365)
            trunc_func = TruncMonth
        else:
            start_date = now - timedelta(days=30)
            trunc_func = TruncDay

        # 1. Bookings Chart
        bookings_data = (
            Booking.objects.filter(created_at__gte=start_date)
            .annotate(period=trunc_func('created_at'))
            .values('period')
            .annotate(count=Count('id'))
            .order_by('period')
        )

        # 2. Users Chart (grouped by role)
        users_data_raw = (
            User.objects.filter(created_at__gte=start_date)
            .annotate(period=trunc_func('created_at'))
            .values('period', 'role')
            .annotate(count=Count('id'))
            .order_by('period')
        )
        
        # Combine users by date for frontend charting
        users_by_date = {}
        for row in users_data_raw:
            d_str = row['period'].strftime('%Y-%m-%d %H:%M') if timeframe == 'daily' else row['period'].strftime('%Y-%m-%d')
            if timeframe == 'yearly': d_str = row['period'].strftime('%Y-%m')
            
            if d_str not in users_by_date:
                users_by_date[d_str] = {'date': d_str, 'users': 0, 'providers': 0}
            if row['role'] == 'USER':
                users_by_date[d_str]['users'] += row['count']
            elif row['role'] == 'PROVIDER':
                users_by_date[d_str]['providers'] += row['count']
        
        users_chart = list(users_by_date.values())

        # Format bookings chart
        bookings_chart = []
        b_counts = []
        for row in bookings_data:
            d_str = row['period'].strftime('%Y-%m-%d %H:%M') if timeframe == 'daily' else row['period'].strftime('%Y-%m-%d')
            if timeframe == 'yearly': d_str = row['period'].strftime('%Y-%m')
            bookings_chart.append({'date': d_str, 'count': row['count']})
            b_counts.append(row['count'])

        # Calculate max/min/avg for bookings
        b_max = max(b_counts) if b_counts else 0
        b_min = min(b_counts) if b_counts else 0
        b_avg = sum(b_counts) / len(b_counts) if b_counts else 0

        # Calculate max/min/avg for users
        u_counts = [u['users'] + u['providers'] for u in users_chart]
        u_max = max(u_counts) if u_counts else 0
        u_min = min(u_counts) if u_counts else 0
        u_avg = sum(u_counts) / len(u_counts) if u_counts else 0

        # Additional Analytics
        # Top Services by Booking
        top_services = (
            Booking.objects.values('service__name')
            .annotate(bookings_count=Count('id'))
            .order_by('-bookings_count')[:5]
        )
        top_services_formatted = [{'name': ts['service__name'], 'value': ts['bookings_count']} for ts in top_services if ts['service__name']]

        # Total Estimated Revenue (Sum of service prices for confirmed bookings)
        revenue_query = Booking.objects.filter(status='CONFIRMED').aggregate(total=Sum('service__price'))
        total_revenue = revenue_query['total'] or 0

        return Response({
            'success': True,
            'data': {
                'timeframe': timeframe,
                'bookings_chart': bookings_chart,
                'bookings_stats': {
                    'max': b_max,
                    'min': b_min,
                    'avg': round(b_avg, 2)
                },
                'users_chart': users_chart,
                'users_stats': {
                    'max': u_max,
                    'min': u_min,
                    'avg': round(u_avg, 2)
                },
                'top_services': top_services_formatted,
                'total_revenue': float(total_revenue) if total_revenue else 0
            }
        })
