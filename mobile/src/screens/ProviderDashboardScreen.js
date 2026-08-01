import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Calendar, X, Check, FolderOpen, Briefcase, Clock, CheckCircle, XCircle, ListNumbers, ArrowCounterClockwise, Funnel } from 'phosphor-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

function formatDate(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';
import { COLORS, STATUS_MAP, SHADOWS } from '../lib/theme';

export default function ProviderDashboardScreen({ navigation }) {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [servicesCount, setServicesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        api.getProviderBookings(token),
        api.getMyServices(token)
      ]);
      
      if (bookingsRes.success) {
        if (!bookingsRes.data || bookingsRes.data.error) return;
        setBookings(bookingsRes.data || []);
      }
      if (servicesRes.success) {
        if (!servicesRes.data || servicesRes.data.error) return;
        setServicesCount((servicesRes.data || []).length);
      }
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
    const actionName = newStatus === 'CONFIRMED' ? (t('action_confirm') || 'tasdiqlashni') : (t('action_cancel') || 'bekor qilishni');
    Alert.alert(
      t('are_you_sure') || "Ishonchingiz komilmi?",
      `${t('really_want_to_action') || 'Siz rostdan ham ushbu buyurtmani'} ${actionName} ${t('want_question') || 'xohlaysizmi?'}`,
      [
        { text: t('no') || "Yo'q", style: "cancel" },
        { 
          text: t('yes') || "Ha", 
          style: newStatus === 'CANCELLED' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const res = await api.updateBookingStatus(id, newStatus, token);
              if (res.success) {
                fetchData(); // refresh list
              } else {
                Alert.alert(t('error') || "Xatolik", t('cannot_change_status') || "Holatni o'zgartirib bo'lmadi");
              }
            } catch (e) {
              Alert.alert(t('error') || "Xatolik", t('network_error') || "Tarmoq xatosi yuz berdi");
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

  const getFilteredBookings = () => {
    return bookings.filter(b => {
      const bStatus = b.status?.toUpperCase();
      if (statusFilter !== 'ALL' && bStatus !== statusFilter) {
        return false;
      }
      if (fromDate && b.date < fromDate) return false;
      if (toDate && b.date > toDate) return false;
      return true;
    });
  };

  const renderStatCard = (title, count, icon, color, bgColor, filterKey) => {
    const isSelected = statusFilter === filterKey;
    return (
      <TouchableOpacity 
        style={[
          styles.statCard,
          isSelected && { borderColor: color, borderWidth: 2 }
        ]} 
        activeOpacity={0.7}
        onPress={() => setStatusFilter(filterKey)}
      >
        <View style={[styles.statIconBox, { backgroundColor: bgColor }]}>
          {icon}
        </View>
        <View style={styles.statTexts}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={[styles.statCount, { color }]}>{count}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBookingItem = ({ item }) => {
    const statusMap = STATUS_MAP[item.status] || STATUS_MAP.PENDING;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName} numberOfLines={1}>{item.service?.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusMap.bg }]}>
            <Text style={[styles.statusText, { color: statusMap.color }]}>{t(`status_${item.status?.toLowerCase()}`) || statusMap.label}</Text>
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
              <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>{t('reject') || 'Rad etish'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.confirmBtn]} 
              onPress={() => handleUpdateStatus(item.id, 'CONFIRMED')}
            >
              <Check size={18} color={COLORS.white} weight="bold" />
              <Text style={[styles.actionBtnText, { color: COLORS.white }]}>{t('confirm') || 'Tasdiqlash'}</Text>
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
  const filteredBookings = getFilteredBookings();
  const isFilterActive = statusFilter !== 'ALL' || fromDate !== '' || toDate !== '';
  
  // Tartiblash: PENDING birinchi, keyin esa sanasiga qarab (eng yaqin sana oldin)
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('dashboard') || 'Boshqaruv paneli'}</Text>
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
              {renderStatCard(t('total_bookings') || 'Jami bronlar', stats.totalBookings, <ListNumbers size={22} color="#3B82F6" weight="duotone" />, '#3B82F6', '#DBEAFE', 'ALL')}
              {renderStatCard(t('status_pending') || 'Kutilmoqda', stats.pending, <Clock size={22} color={COLORS.warning} weight="duotone" />, COLORS.warning, COLORS.warningLight, 'PENDING')}
              {renderStatCard(t('status_confirmed') || 'Tasdiqlangan', stats.confirmed, <CheckCircle size={22} color={COLORS.success} weight="duotone" />, COLORS.success, COLORS.successLight, 'CONFIRMED')}
              {renderStatCard(t('status_cancelled') || 'Bekor qilingan', stats.cancelled, <XCircle size={22} color={COLORS.danger} weight="duotone" />, COLORS.danger, COLORS.dangerLight, 'CANCELLED')}
            </View>

            <View style={styles.filterSection}>
              <View style={styles.filterHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Calendar size={18} color={COLORS.primary} weight="bold" />
                  <Text style={styles.filterSectionTitle}>{t('sort_by_date') || "Sana bo'yicha saralash:"}</Text>
                </View>
                {isFilterActive && (
                  <TouchableOpacity 
                    style={styles.resetFilterBtn}
                    onPress={() => {
                      setStatusFilter('ALL');
                      setFromDate('');
                      setToDate('');
                    }}
                  >
                    <ArrowCounterClockwise size={14} color={COLORS.danger} weight="bold" />
                    <Text style={styles.resetFilterText}>{t('clear') || 'Tozalash'}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.customDateContainer}>
                <View style={styles.dateInputRow}>
                  <View style={styles.dateInputBox}>
                    <Text style={styles.dateInputLabel}>{t('from') || 'Dan:'}</Text>
                    <TouchableOpacity 
                      style={styles.datePickerBtn}
                      onPress={() => setShowFromPicker(true)}
                    >
                      <Calendar size={16} color={COLORS.primary} weight="duotone" />
                      <Text style={[styles.dateValueText, { marginLeft: 8 }, !fromDate && styles.datePlaceholderText]}>
                        {fromDate || (t('select_date') || 'Sanani tanlang')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={{ marginHorizontal: 8, color: '#CBD5E1' }}>—</Text>

                  <View style={styles.dateInputBox}>
                    <Text style={styles.dateInputLabel}>{t('to') || 'Gacha:'}</Text>
                    <TouchableOpacity 
                      style={styles.datePickerBtn}
                      onPress={() => setShowToPicker(true)}
                    >
                      <Calendar size={16} color={COLORS.primary} weight="duotone" />
                      <Text style={[styles.dateValueText, { marginLeft: 8 }, !toDate && styles.datePlaceholderText]}>
                        {toDate || (t('select_date') || 'Sanani tanlang')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {showFromPicker && (
                <DateTimePicker
                  value={fromDate ? new Date(fromDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowFromPicker(false);
                    if (selectedDate) setFromDate(formatDate(selectedDate));
                  }}
                />
              )}
              {showToPicker && (
                <DateTimePicker
                  value={toDate ? new Date(toDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowToPicker(false);
                    if (selectedDate) setToDate(formatDate(selectedDate));
                  }}
                />
              )}
            </View>

            {isFilterActive && (
              <View style={[styles.filterSection, { marginTop: -10 }]}>
                <View style={styles.activeFilterBanner}>
                  <Text style={styles.activeFilterText}>
                    🔍 Natija: <Text style={{fontWeight: '700'}}>{filteredBookings.length} ta</Text> bron topildi {statusFilter !== 'ALL' ? `(${t('status_'+statusFilter.toLowerCase()) || STATUS_MAP[statusFilter]?.label || statusFilter})` : ''}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>{t('recent_orders') || "So'nggi buyurtmalar"}</Text>
          </>
        }
        ListEmptyComponent={
          isFilterActive ? (
            <View style={styles.emptyContainer}>
              <Funnel size={64} color={COLORS.warning} weight="duotone" />
              <Text style={styles.emptyText}>Tanlangan filtrlarda hech narsa topilmadi</Text>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.confirmBtn, { marginTop: 16 }]}
                onPress={() => {
                  setStatusFilter('ALL');
                  setFromDate('');
                  setToDate('');
                }}
              >
                <Text style={{color: COLORS.white, fontWeight: '600'}}>Filtrlarni tozalash</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <FolderOpen size={48} color={COLORS.textLight} weight="light" />
              <Text style={styles.emptyText}>{t('no_bookings_yet') || 'Hali buyurtmalar kelib tushmagan'}</Text>
            </View>
          )
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
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTexts: {
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 6,
  },
  resetFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger + '15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.danger,
    marginLeft: 4,
  },
  customDateContainer: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputBox: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateValueText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  datePlaceholderText: {
    color: COLORS.textLight,
  },
  activeFilterBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeFilterText: {
    fontSize: 13,
    color: '#15803D',
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
