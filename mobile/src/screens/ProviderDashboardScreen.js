import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Calendar, X, Check, FolderOpen, Briefcase, Clock, CheckCircle, XCircle, ListNumbers } from 'phosphor-react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { COLORS, FONTS, STATUS_MAP, SHADOWS } from '../lib/theme';

export default function ProviderDashboardScreen({ navigation }) {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [servicesCount, setServicesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        api.getProviderBookings(token),
        api.getMyServices(token)
      ]);
      
      if (bookingsRes.success) setBookings(bookingsRes.data || []);
      if (servicesRes.success) setServicesCount((servicesRes.data || []).length);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleUpdateStatus = (id, newStatus) => {
    const actionName = newStatus === 'CONFIRMED' ? 'tasdiqlashni' : 'bekor qilishni';
    Alert.alert(
      "Ishonchingiz komilmi?",
      `Siz rostdan ham ushbu buyurtmani ${actionName} xohlaysizmi?`,
      [
        { text: "Yo'q", style: "cancel" },
        { 
          text: "Ha", 
          style: newStatus === 'CANCELLED' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const res = await api.updateBookingStatus(id, newStatus, token);
              if (res.success) {
                fetchData(); // refresh list
              } else {
                Alert.alert("Xatolik", "Holatni o'zgartirib bo'lmadi");
              }
            } catch (e) {
              Alert.alert("Xatolik", "Tarmoq xatosi yuz berdi");
            }
          }
        }
      ]
    );
  };

  const getStats = () => {
    const totalBookings = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
    const pending = bookings.filter(b => b.status === 'PENDING').length;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
    return { servicesCount, totalBookings, confirmed, pending, cancelled };
  };

  const renderStatCard = (title, count, icon, color, bgColor) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: bgColor }]}>
        {icon}
      </View>
      <View style={styles.statTexts}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statCount, { color }]}>{count}</Text>
      </View>
    </View>
  );

  const renderBookingItem = ({ item }) => {
    const statusMap = STATUS_MAP[item.status] || STATUS_MAP.PENDING;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName} numberOfLines={1}>{item.service?.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusMap.bg }]}>
            <Text style={[styles.statusText, { color: statusMap.color }]}>{statusMap.label}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <User size={16} color={COLORS.primary} weight="duotone" />
          </View>
          <Text style={styles.infoText}>{item.user?.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Phone size={16} color={COLORS.primary} weight="duotone" />
          </View>
          <Text style={styles.infoText}>{item.user?.phone_number}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Calendar size={16} color={COLORS.primary} weight="duotone" />
          </View>
          <Text style={styles.infoText}>{item.date}</Text>
        </View>

        {item.status === 'PENDING' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.cancelBtn]} 
              onPress={() => handleUpdateStatus(item.id, 'CANCELLED')}
            >
              <X size={18} color={COLORS.danger} weight="bold" />
              <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>Rad etish</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.confirmBtn]} 
              onPress={() => handleUpdateStatus(item.id, 'CONFIRMED')}
            >
              <Check size={18} color={COLORS.white} weight="bold" />
              <Text style={[styles.actionBtnText, { color: COLORS.white }]}>Tasdiqlash</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  
  // Tartiblash: PENDING birinchi, keyin esa sanasiga qarab (eng yaqin sana oldin)
  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Boshqaruv paneli</Text>
      </View>

      <FlatList
        data={sortedBookings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.statsGrid}>
              {renderStatCard('Jami bronlar', stats.totalBookings, <ListNumbers size={22} color="#3B82F6" weight="duotone" />, '#3B82F6', '#DBEAFE')}
              {renderStatCard('Kutilmoqda', stats.pending, <Clock size={22} color={COLORS.warning} weight="duotone" />, COLORS.warning, COLORS.warningLight)}
              {renderStatCard('Tasdiqlangan', stats.confirmed, <CheckCircle size={22} color={COLORS.success} weight="duotone" />, COLORS.success, COLORS.successLight)}
              {renderStatCard('Bekor qilingan', stats.cancelled, <XCircle size={22} color={COLORS.danger} weight="duotone" />, COLORS.danger, COLORS.dangerLight)}
            </View>
            <Text style={styles.sectionTitle}>So'nggi buyurtmalar</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FolderOpen size={48} color={COLORS.textLight} weight="light" />
            <Text style={styles.emptyText}>Hali buyurtmalar kelib tushmagan</Text>
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
    fontWeight: '800',
    color: COLORS.text,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'column',
    ...SHADOWS.sm,
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTexts: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statCount: {
    fontSize: 22,
    fontWeight: '800',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  
  // Booking Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    ...SHADOWS.sm,
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  confirmBtn: {
    backgroundColor: COLORS.success,
    ...SHADOWS.sm,
    shadowColor: COLORS.success,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 16,
  },
});
