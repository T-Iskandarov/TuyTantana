import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CaretRight, Star, ArrowLeft, Briefcase, Trash, Calendar, PencilSimple } from 'phosphor-react-native';
import { getPhosphorIcon } from '../lib/icons';
import { useAuth } from '../context/AuthContext';
import { api, IMAGE_BASE } from '../lib/api';
import { COLORS, FONTS, SERVICE_TYPES, SHADOWS } from '../lib/theme';

function formatPrice(p) {
  if (!p && p !== 0) return '-';
  return Number(p).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export default function ProviderServicesScreen({ navigation }) {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const res = await api.getMyServices(token);
      if (res.success) {
        setServices(res.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchServices();
    });
    return unsubscribe;
  }, [navigation, fetchServices]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const handleDelete = (id) => {
    Alert.alert(
      "O'chirish",
      "Haqiqatan ham bu xizmatni o'chirib tashlamoqchimisiz?",
      [
        { text: "Bekor qilish", style: "cancel" },
        { 
          text: "O'chirish", 
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.deleteService(id, token);
              if (res.success) {
                fetchServices();
              } else {
                Alert.alert("Xato", "Xizmatni o'chirishda xatolik yuz berdi");
              }
            } catch (e) {
              Alert.alert("Xato", "Tarmoq xatosi");
            }
          }
        }
      ]
    );
  };

  const renderServiceItem = ({ item }) => {
    const typeInfo = SERVICE_TYPES.find(t => t.value === item.type) || { label: item.type, icon: '📌' };
    const imageUri = item.images && item.images.length > 0 
      ? { uri: `${IMAGE_BASE}${item.images[0].image_path}` } 
      : null;

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={imageUri} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              {getPhosphorIcon(item.type, false, 48)}
            </View>
          )}
          <View style={styles.badge}>
            {getPhosphorIcon(item.type, true, 14, '#FFF')}
            <Text style={styles.badgeText}>{typeInfo.label}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.serviceName} numberOfLines={2}>{item.name}</Text>
          
          <View style={styles.infoRow}>
            <Calendar size={16} color={COLORS.textSecondary} weight="duotone" />
            <Text style={styles.infoText}>{item.bookings ? item.bookings.length : 0} ta tasdiqlangan bron</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(item.price)} <Text style={{fontSize: 14, fontWeight: 'normal', color: COLORS.textSecondary}}>so'm</Text></Text>
          </View>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={() => navigation.navigate('ProviderServiceCalendar', { serviceId: item.id })} style={[styles.actionBtn, {backgroundColor: COLORS.primaryLight}]}>
              <Calendar size={20} color={COLORS.primary} weight="duotone" />
              <Text style={[styles.actionBtnText, {color: COLORS.primaryDark}]}>Kalendar</Text>
            </TouchableOpacity>
            
            <View style={styles.rightActions}>
              <TouchableOpacity onPress={() => navigation.navigate('AddService', { editItem: item })} style={[styles.actionIconBtn, {backgroundColor: COLORS.warningLight}]}>
                <PencilSimple size={20} color={COLORS.warning} weight="duotone" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.actionIconBtn, {backgroundColor: COLORS.dangerLight}]}>
                <Trash size={20} color={COLORS.danger} weight="duotone" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xizmatlarim</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddService')}
        >
          <Plus size={24} color={COLORS.white} weight="bold" />
          <Text style={styles.addBtnText}>Qo'shish</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderServiceItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Briefcase size={20} color={COLORS.primary} />
            <Text style={styles.emptyText}>Siz hali xizmat qo'shmagansiz</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    ...FONTS.h2,
    flex: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    ...FONTS.medium,
    color: COLORS.white,
    marginLeft: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  priceContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    ...FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});
