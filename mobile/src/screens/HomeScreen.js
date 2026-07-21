import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Dimensions,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, MapPin, MagnifyingGlass, Bell, XCircle, Faders, Heart, Users, Bank, Camera, Microphone, Scissors, Car, ClipboardText, SquaresFour } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SHADOWS, SERVICE_TYPES } from '../lib/theme';
import { api, IMAGE_BASE } from '../lib/api';
import { regionsAndDistricts } from '../lib/regions';
import { getPhosphorIcon } from '../lib/icons';
import ServiceCard from '../components/ServiceCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const REGIONS = Object.keys(regionsAndDistricts).map(r => ({ label: r, value: r }));
REGIONS.unshift({ label: "Barcha hududlar", value: "" });

function formatPrice(p) {
  if (!p && p !== 0) return '-';
  return Number(p).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

const DEFAULT_IMAGES = {
  TUYXONA: 'https://images.unsplash.com/photo-1519167758481-83f524b72b55?q=80&w=800&auto=format&fit=crop',
  FOTO_VIDEO: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
  XONANDA: 'https://images.unsplash.com/photo-1516280440502-3c13749d6373?q=80&w=800&auto=format&fit=crop',
  SALON: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop',
  KORTEJ: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
};

const BANNERS = [
  { img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400' },
  { img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=400' },
  { img: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=400' },
];

export default function HomeScreen({ navigation }) {
  const [activeType, setActiveType] = useState('TUYXONA');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const { user, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        api.getNotifications(token).then(res => {
          if (res.success) setUnreadCount(res.unread_count);
        }).catch(() => {});
      }
    }, [token])
  );
  
  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [filterRegion, setFilterRegion] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterDate, setFilterDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [featuredServices, setFeaturedServices] = useState(BANNERS);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    api.getServices({ limit: 5 }).then(res => {
      if (res.success && res.data?.length > 0) {
        setFeaturedServices(res.data.slice(0, 5));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (featuredServices.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBanner(prev => {
        const next = (prev + 1) % featuredServices.length;
        scrollViewRef.current?.scrollTo({ x: next * (SCREEN_WIDTH - 32), animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredServices.length]);

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveBanner(Math.round(index));
  };

  const fetchServices = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const params = { type: activeType === 'ALL' ? '' : activeType };
      if (search) params.search = search;
      if (filterDistrict) {
        params.location = filterDistrict;
      } else if (filterRegion) {
        params.location = filterRegion;
      }
      if (filterPriceMin) params.price_min = filterPriceMin;
      if (filterPriceMax) params.price_max = filterPriceMax;
      if (filterRating) params.rating_min = filterRating;
      if (filterDate) {
        const d = new Date(filterDate);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        params.date = d.toISOString().split('T')[0];
      }
      
      const res = await api.getServices(params);
      if (res.success) {
        setServices(res.data || []);
      } else {
        setServices([]);
      }
    } catch (e) {
      setServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeType, search, filterRegion, filterDistrict, filterPriceMin, filterPriceMax, filterRating, filterDate]);

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [activeType, fetchServices])
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices(true);
  };

  const getServiceTypeInfo = (type) => {
    return SERVICE_TYPES.find((t) => t.value === type) || SERVICE_TYPES[0];
  };

  const renderServiceCard = ({ item }) => (
    <View style={{ paddingHorizontal: 16 }}>
      <ServiceCard 
        item={item} 
        onPress={() => navigation.navigate('ServiceDetail', { id: item.id })} 
      />
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCircle}>
          <MagnifyingGlass size={40} color={COLORS.textLight} />
        </View>
        <Text style={styles.emptyTitle}>Xizmatlar topilmadi</Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.sectionTitle}>
        Top xizmatlar ✨
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate('AllServices', { filterType: activeType })}>
        <Text style={styles.seeAllText}>
          Barchasini ko'rish {'>'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
          <View>
            <Text style={styles.logoTitle}>To'y Tantana</Text>
            <Text style={styles.logoSubtitle}>TO'Y XIZMATLARI BIR JOYDA</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => {
          if (!user) {
            navigation.navigate('Login');
            return;
          }
          navigation.navigate('Notifications');
        }}>
          <Bell size={24} color={COLORS.primary} />
          {unreadCount > 0 && <View style={styles.notifBadge} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        renderItem={renderServiceCard}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          <>
            {/* Banner */}
            <View style={styles.mainBanner}>
              <View style={styles.mainBannerGradient}>
                <ScrollView 
                  horizontal 
                  pagingEnabled 
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  style={styles.bannerScrollView}
                  ref={scrollViewRef}
                >
                  {featuredServices.map((s, idx) => {
                    const imageUrl = s.images && s.images.length > 0 
                      ? `${IMAGE_BASE}${s.images[0].image_path}`
                      : (DEFAULT_IMAGES[s.type] || DEFAULT_IMAGES.TUYXONA);

                    return (
                      <TouchableOpacity 
                        key={s.id || idx} 
                        style={{ width: SCREEN_WIDTH - 32, height: 180, position: 'relative' }}
                        activeOpacity={0.9}
                        onPress={() => {
                          if (s.id) navigation.navigate('ServiceDetail', { id: s.id });
                        }}
                      >
                        <View style={{ flex: 1, backgroundColor: '#2D1B54' }}>
                          <Image 
                            source={{ uri: s.id ? imageUrl : s.img }} 
                            style={styles.mainBannerImage}
                          />
                          {/* Gradient Overlay from left to right */}
                          <LinearGradient
                            colors={['#2D1B54', '#2D1B54', 'transparent']}
                            locations={[0, 0.4, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFillObject}
                          />
                        </View>
                        
                        {/* Content overlay */}
                        <View style={styles.mainBannerContent} pointerEvents="none">
                          {s.id ? (
                            <>
                              <Text style={[styles.mainBannerTitle, { marginBottom: 8, fontSize: 20 }]} numberOfLines={2}>
                                {s.name}
                              </Text>
                              <Text style={{ color: '#EAD189', fontSize: 13, marginBottom: 12 }}>
                                {SERVICE_TYPES.find(t => t.value === s.type)?.label || s.type}
                              </Text>
                              <View style={styles.mainBannerBtn}>
                                <Text style={styles.mainBannerBtnText}>Batafsil ko'rish</Text>
                              </View>
                            </>
                          ) : (
                            <>
                              <Text style={styles.mainBannerTitle}>
                                Orzularingizdagi{'\n'}to'y uchun{'\n'}
                                <Text style={{ fontStyle: 'italic', color: '#EAD189', fontWeight: '400' }}>barchasi bir joyda!</Text>
                              </Text>
                              <View style={styles.mainBannerBtn}>
                                <Text style={styles.mainBannerBtnText}>✨ To'yingizni rejalashtirish</Text>
                              </View>
                            </>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Dots */}
                <View style={styles.bannerDots} pointerEvents="none">
                  {featuredServices.map((_, i) => (
                    <View key={i} style={[styles.dot, activeBanner === i && styles.dotActive]} />
                  ))}
                </View>
              </View>
            </View>

            {/* Search & Filter */}
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <MagnifyingGlass size={20} color={COLORS.textLight} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Xizmatlarni qidirish..."
                  placeholderTextColor={COLORS.textLight}
                  value={search}
                  onChangeText={setSearch}
                  returnKeyType="search"
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <XCircle size={20} color={COLORS.textLight} weight="fill" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={styles.filterBtnSq} onPress={() => setShowFilter(true)}>
                <Faders size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContainer}
            >
              {[ {label: 'Barchasi', value: 'ALL'}, ...SERVICE_TYPES].map((item) => {
                const isActive = item.value === activeType;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.tabSq, isActive && styles.tabSqActive]}
                    onPress={() => setActiveType(item.value)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.tabIconWrapper}>
                      {getPhosphorIcon(item.value, isActive)}
                    </View>
                    <Text style={[styles.tabSqLabel, isActive && styles.tabSqLabelActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {renderHeader()}
          </>
        }
        ListEmptyComponent={renderEmpty}
      />

      {/* Filter Modal */}
      <Modal visible={showFilter} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrlash</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <XCircle size={28} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>Viloyat / Hudud</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filterRegion}
                onValueChange={(val) => {
                  setFilterRegion(val);
                  setFilterDistrict('');
                }}
                style={styles.picker}
              >
                {REGIONS.map(reg => (
                  <Picker.Item key={reg.value} label={reg.label} value={reg.value} />
                ))}
              </Picker>
            </View>

            {filterRegion ? (
              <>
                <Text style={styles.filterLabel}>Tuman / Shahar</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={filterDistrict}
                    onValueChange={(val) => setFilterDistrict(val)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Barcha tumanlar" value="" />
                    {(regionsAndDistricts[filterRegion] || []).map(dist => (
                      <Picker.Item key={dist} label={dist} value={dist} />
                    ))}
                  </Picker>
                </View>
              </>
            ) : null}

            <Text style={styles.filterLabel}>Bo'sh sana</Text>
            <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={{color: filterDate ? COLORS.text : COLORS.textLight}}>
                {filterDate ? filterDate.toLocaleDateString('uz-UZ') : "Sanani tanlang"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={filterDate || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) setFilterDate(selectedDate);
                }}
              />
            )}

            <Text style={styles.filterLabel}>Narx oralig'i (so'm)</Text>
            <View style={styles.priceRowModal}>
              <TextInput 
                style={[styles.filterInput, {flex: 1}]} 
                placeholder="Dan"
                keyboardType="numeric"
                value={filterPriceMin}
                onChangeText={setFilterPriceMin}
              />
              <Text style={{marginHorizontal: 8}}>-</Text>
              <TextInput 
                style={[styles.filterInput, {flex: 1}]} 
                placeholder="Gacha"
                keyboardType="numeric"
                value={filterPriceMax}
                onChangeText={setFilterPriceMax}
              />
            </View>

            <Text style={styles.filterLabel}>Minimal baho</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filterRating}
                onValueChange={(val) => setFilterRating(val)}
                style={styles.picker}
              >
                <Picker.Item label="Barcha baholar" value="" />
                <Picker.Item label="1 yulduz va undan yuqori" value="1" />
                <Picker.Item label="2 yulduz va undan yuqori" value="2" />
                <Picker.Item label="3 yulduz va undan yuqori" value="3" />
                <Picker.Item label="4 yulduz va undan yuqori" value="4" />
                <Picker.Item label="5 yulduz" value="5" />
              </Picker>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 32, marginBottom: 16 }}>
              <TouchableOpacity 
                style={[styles.applyFilterBtn, { flex: 1, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, marginTop: 0, marginBottom: 0 }]}
                onPress={() => {
                  setFilterRegion('');
                  setFilterDistrict('');
                  setFilterPriceMin('');
                  setFilterPriceMax('');
                  setFilterRating('');
                  setFilterDate(null);
                  setSearch('');
                }}
              >
                <Text style={[styles.applyFilterBtnText, { color: COLORS.text }]}>Tozalash</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.applyFilterBtn, { flex: 2, marginTop: 0, marginBottom: 0 }]}
                onPress={() => {
                  setShowFilter(false);
                  fetchServices();
                }}
              >
                <Text style={styles.applyFilterBtnText}>Qo'llash</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImg: {
    width: 60,
    height: 64,
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#322268',
    letterSpacing: 0.2,
  },
  logoSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A98F56',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
    shadowOpacity: 0.05,
    elevation: 2,
    position: 'relative',
  },
  notifBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: 10,
    right: 12,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: 10,
    right: 12,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },

  /* Main Banner */
  mainBanner: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  mainBannerGradient: {
    borderRadius: 24,
    height: 180,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#2D1B54',
  },
  bannerScrollView: {
    flex: 1,
  },
  mainBannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '65%',
    padding: 20,
    justifyContent: 'center',
    zIndex: 2,
  },
  mainBannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 28,
    marginBottom: 16,
  },
  mainBannerBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mainBannerBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  mainBannerImage: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '60%',
  },
  bannerDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.white,
  },

  /* Search & Filter */
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    gap: 10,
    ...SHADOWS.sm,
    shadowOpacity: 0.05,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    height: '100%',
  },
  filterBtnSq: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
    shadowOpacity: 0.1,
  },

  /* Tabs Sq */
  tabsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  tabSq: {
    width: 76,
    height: 80,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...SHADOWS.sm,
    shadowOpacity: 0.04,
    elevation: 1,
  },
  tabSqActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F8F6FF',
  },
  tabIconWrapper: {
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  tabSqLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  tabSqLabelActive: {
    color: COLORS.primary,
  },

  /* List */
  listContent: {
    paddingBottom: 40,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  /* Service Card */
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 16,
    flex: 1,
    ...SHADOWS.sm,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  cardImageContainer: {
    height: 120,
    backgroundColor: COLORS.primaryLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  cardBadgeLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  cardHeartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    padding: 14,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 2,
  },
  dotSeparator: {
    fontSize: 12,
    color: COLORS.border,
    marginHorizontal: 2,
  },
  capacityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  priceCurrency: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
    marginLeft: 4,
  },
  batafsilBtn: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#EBE4FE',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  batafsilText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  /* Bottom Banner */
  bottomBanner: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  bottomBannerGradient: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  bottomBannerContent: {
    flex: 1,
    zIndex: 2,
  },
  bottomBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D1B54',
    marginBottom: 12,
    lineHeight: 20,
  },
  bottomBannerBtn: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  bottomBannerBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  bottomBannerImg: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 140,
    height: 140,
    zIndex: 1,
  },

  /* Empty */
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  /* Filter Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  filterInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceRowModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  applyFilterBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  applyFilterBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  datePickerBtn: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
