import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarBlank, Image as ImageIcon, User, Calendar, CheckCircle, Clock, XCircle, ListNumbers, CaretRight } from 'phosphor-react-native';
import { useAuth } from '../context/AuthContext';
import { api, IMAGE_BASE } from '../lib/api';
import { COLORS, FONTS, STATUS_MAP, SHADOWS } from '../lib/theme';

function formatPrice(p) {
  if (!p && p !== 0) return '-';
  return Number(p).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export default function MyBookingsScreen({ navigation }) {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMyBookings(token);
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mening bronlarim</Text>
        </View>
        <View style={styles.emptyContainer}>
          <CalendarBlank size={80} color={COLORS.primaryLight} weight="duotone" />
          <Text style={styles.emptyText}>Tizimga kirmagansiz</Text>
          <Text style={styles.emptySubtext}>Bronlarni ko'rish va boshqarish uchun tizimga kiring</Text>
          
          <TouchableOpacity 
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginBtnText}>Kirish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getStats = () => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
    const pending = bookings.filter(b => b.status === 'PENDING').length;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
    return { total, confirmed, pending, cancelled };
  };

  const renderStatCard = (title, count, color, Icon) => (
    <View style={styles.statCard} key={title}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Icon size={24} color={color} weight="fill" />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statCount}>{count}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderBookingCard = ({ item }) => {
    const statusMap = STATUS_MAP[item.status] || STATUS_MAP.PENDING;
    const service = item.service || {};
    const serviceImg = service.images && service.images.length > 0 
      ? { uri: `${IMAGE_BASE}${service.images[0].image_path}` } 
      : null;

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ServiceDetail', { id: service.id })}
      >
        {serviceImg ? (
          <Image source={serviceImg} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ImageIcon size={32} color={COLORS.textLight} weight="duotone" />
          </View>
        )}
        
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusMap.bg }]}>
              <Text style={[styles.statusText, { color: statusMap.color }]}>{statusMap.label}</Text>
            </View>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          
          <Text style={styles.serviceName} numberOfLines={2}>
            {service.name || 'Noma\'lum xizmat'}
          </Text>

          <View style={styles.providerRow}>
            <User size={16} color={COLORS.textSecondary} weight="duotone" />
            <Text style={styles.providerName} numberOfLines={1}>
              {service.provider?.name || 'Noma\'lum provayder'}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Narxi:</Text>
            <Text style={styles.price}>{formatPrice(service.price)} so'm</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const stats = getStats();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mening bronlarim</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
        ListHeaderComponent={
          bookings.length > 0 ? (
            <View style={styles.statsGrid}>
              {renderStatCard('Jami', stats.total, COLORS.primary, ListNumbers)}
              {renderStatCard('Tasdiqlangan', stats.confirmed, COLORS.success, CheckCircle)}
              {renderStatCard('Kutilmoqda', stats.pending, COLORS.warning, Clock)}
              {renderStatCard('Bekor qilingan', stats.cancelled, COLORS.danger, XCircle)}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CalendarBlank size={64} color={COLORS.primaryLight} weight="duotone" />
            <Text style={styles.emptyText}>Hali bronlaringiz yo'q</Text>
            <Text style={styles.emptySubtext}>Yangi xizmatlarni toping va o'z bayramingizni rejalashtiring</Text>
            <TouchableOpacity 
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('HomeTab')}
            >
              <Text style={styles.exploreBtnText}>Xizmatlarni izlash</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 16,
    ...SHADOWS.sm,
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statCount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  listContainer: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 16,
    marginHorizontal: 20,
    padding: 12,
    ...SHADOWS.md,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  image: {
    width: 100,
    height: 110,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 100,
    height: 110,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
    marginRight: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  exploreBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
