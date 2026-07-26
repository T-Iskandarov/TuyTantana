import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Image,
  TextInput,
  Alert,
  Linking,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, CaretLeft, CaretRight, Calendar, Lock, WarningCircle, ArrowsClockwise, MapPin, Users, CheckCircle, User, Phone, CalendarBlank, Chats, ChatCircleDots, PaperPlaneRight } from 'phosphor-react-native';
import { getPhosphorIcon } from '../lib/icons';
import { LinearGradient } from 'expo-linear-gradient';
import YaMap, { Marker } from 'react-native-yamap';
import { COLORS, FONTS, SHADOWS, SERVICE_TYPES, STATUS_MAP } from '../lib/theme';
import { api, IMAGE_BASE } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

function formatPrice(p) {
  if (!p && p !== 0) return '-';
  return Number(p).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

const getDayNames = (t) => [t('day_mo')||'Du', t('day_tu')||'Se', t('day_we')||'Ch', t('day_th')||'Pa', t('day_fr')||'Ju', t('day_sa')||'Sh', t('day_su')||'Ya'];
const getMonthNames = (t) => [
  t('month_jan')||'Yanvar', t('month_feb')||'Fevral', t('month_mar')||'Mart', t('month_apr')||'Aprel', t('month_may')||'May', t('month_jun')||'Iyun', t('month_jul')||'Iyul', t('month_aug')||'Avgust', t('month_sep')||'Sentabr', t('month_oct')||'Oktabr', t('month_nov')||'Noyabr', t('month_dec')||'Dekabr'
];

// ─── Image Gallery ──────────────────────────────────────────────────
function ImageGallery({ images, serviceType, onBack }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const typeInfo = SERVICE_TYPES.find((t) => t.value === serviceType) || SERVICE_TYPES[0];

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length;
        scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
        return nextIndex;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  const handleScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(idx);
  };

  if (!images || images.length === 0) {
    return (
      <View style={styles.galleryContainer}>
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary, '#A78BFA']}
          style={styles.placeholderGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={{alignItems: "center", justifyContent: "center"}}>{getPhosphorIcon(serviceType, false, 64)}</View>
          <Text style={styles.placeholderText}>{typeInfo.label}</Text>
        </LinearGradient>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={COLORS.white} weight="bold" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.galleryContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
      >
        {images.map((img, i) => (
          <Image
            key={i}
            source={{ uri: `${IMAGE_BASE}${img.image_path}` }}
            style={styles.galleryImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Page dots */}
      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, activeIndex === i && styles.dotActive]}
            />
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ArrowLeft size={24} color={COLORS.white} weight="bold" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Star Rating Display ────────────────────────────────────────────
function StarRating({ rating, size = 16, color = '#F59E0B' }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={size} color={star <= rating ? color : "#E5E7EB"} weight={star <= rating ? "fill" : "regular"} style={{ marginRight: 2 }} />
      ))}
    </View>
  );
}

// ─── Star Picker ────────────────────────────────────────────────────
function StarPicker({ rating, onChange, size = 32 }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)} activeOpacity={0.7}>
          <Star size={size} color={star <= rating ? "#F59E0B" : "#E5E7EB"} weight={star <= rating ? "fill" : "regular"} style={{ marginRight: 6 }} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Booking Calendar ───────────────────────────────────────────────
function BookingCalendar({ bookings = [], serviceId, token, onBooked, onLoginRequired, t }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [booking, setBooking] = useState(false);

  const goToPrevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const goToNextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  // Build days grid
  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay() - 1; // Mon=0
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Booking status lookup
  const bookingMap = {};
  bookings.forEach((b) => {
    const d = b.date || b.booking_date;
    if (d) bookingMap[d] = b.status;
  });

  const formatDateStr = (d) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const isPast = (d) => {
    const date = new Date(year, month, d);
    return date < today;
  };

  const handleBook = async () => {
    if (!selectedDate) return;
    setBooking(true);
    try {
      const dateStr = formatDateStr(selectedDate);
      const res = await api.createBooking({ service_id: serviceId, date: dateStr }, token);
      if (res.success || res.id) {
        Alert.alert('Muvaffaqiyat!', "Bron so'rovi yuborildi. Provayder tasdiqlashini kuting.");
        setSelectedDate(null);
        if (onBooked) onBooked();
      } else {
        Alert.alert('Xatolik', res.message || res.error || "Bron qilishda xatolik yuz berdi");
      }
    } catch (e) {
      Alert.alert('Xatolik', "Tarmoq xatoligi yuz berdi");
    } finally {
      setBooking(false);
    }
  };

  const renderDay = (day, index) => {
    if (day === null) return <View key={`empty-${index}`} style={styles.calendarCell} />;

    const dateStr = formatDateStr(day);
    const status = bookingMap[dateStr];
    const past = isPast(day);
    const isSelected = selectedDate === day;
    const isBooked = !!status;
    const disabled = past || isBooked;

    let dayStyle = [styles.calendarDay];
    let textStyle = [styles.calendarDayText];

    if (past) {
      dayStyle.push(styles.calendarDayPast);
      textStyle.push(styles.calendarDayTextPast);
    } else if (status === 'CONFIRMED') {
      dayStyle.push(styles.calendarDayConfirmed);
      textStyle.push(styles.calendarDayTextBooked);
    } else if (status === 'PENDING') {
      dayStyle.push(styles.calendarDayPending);
      textStyle.push(styles.calendarDayTextBooked);
    } else if (isSelected) {
      dayStyle.push(styles.calendarDaySelected);
      textStyle.push(styles.calendarDayTextSelected);
    }

    return (
      <TouchableOpacity
        key={`day-${day}`}
        style={styles.calendarCell}
        disabled={disabled}
        onPress={() => setSelectedDate(day)}
        activeOpacity={0.6}
      >
        <View style={dayStyle}>
          <Text style={textStyle}>{day}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.calendarContainer}>
      {/* Month/Year header */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.calendarArrow}>
          <CaretLeft size={22} color={COLORS.primary} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.calendarTitle}>
          {getMonthNames(t)[month]} {year}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.calendarArrow}>
          <CaretRight size={22} color={COLORS.primary} weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Day names */}
      <View style={styles.calendarRow}>
        {getDayNames(t).map((name) => (
          <View key={name} style={styles.calendarCell}>
            <Text style={styles.calendarDayName}>{name}</Text>
          </View>
        ))}
      </View>

      {/* Days grid */}
      <View style={styles.calendarGrid}>
        {cells.map((day, i) => renderDay(day, i))}
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.danger }]} />
          <Text style={styles.legendText}>{t('status_confirmed') || 'Tasdiqlangan'}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
          <Text style={styles.legendText}>{t('status_pending') || 'Kutilmoqda'}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border }]} />
          <Text style={styles.legendText}>{t('filter_date') || "Bo'sh"}</Text>
        </View>
      </View>

      {/* Book button */}
      {token ? (
        <TouchableOpacity
          style={[styles.bookButton, (!selectedDate || booking) && styles.bookButtonDisabled]}
          onPress={handleBook}
          disabled={!selectedDate || booking}
          activeOpacity={0.8}
        >
          {booking ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Calendar size={20} color={COLORS.white} />
              <Text style={styles.bookButtonText}>{t('book_now') || 'Bron qilish'}</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.loginPrompt} onPress={onLoginRequired}>
          <Lock size={18} color={COLORS.primary} />
          <Text style={[styles.loginPromptText, { color: COLORS.primary, marginLeft: 8 }]}>{t('login_to_book') || 'Bron qilish uchun tizimga kiring'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────
export default function ServiceDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 300);
    });
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const mainScrollRef = useRef(null);

  const fetchService = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getServiceById(id);
      if (res.success !== false && (res.data || res.id)) {
        setService(res.data || res);
      } else {
        setError(res.message || "Xizmat topilmadi");
      }
    } catch (e) {
      setError("Tarmoq xatoligi yuz berdi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchService();
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      Alert.alert('Xatolik', 'Iltimos, baho bering');
      return;
    }
    if (!reviewComment.trim()) {
      Alert.alert('Xatolik', 'Iltimos, izoh yozing');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.addReview(id, { rating: reviewRating, comment: reviewComment.trim() }, token);
      if (res.success !== false) {
        Alert.alert('Rahmat!', 'Izohingiz qo\'shildi');
        setReviewRating(0);
        setReviewComment('');
        fetchService(); // reload to show new review
      } else {
        Alert.alert('Xatolik', res.message || "Izoh qo'shishda xatolik");
      }
    } catch (e) {
      Alert.alert('Xatolik', "Tarmoq xatoligi yuz berdi");
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Loading state ─────────
  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[FONTS.medium, { marginTop: 12 }]}>Yuklanmoqda...</Text>
      </SafeAreaView>
    );
  }

  // ── Error state ───────────
  if (error) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <WarningCircle size={56} color={COLORS.danger} />
        <Text style={[FONTS.h3, { marginTop: 12, textAlign: 'center' }]}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => { setLoading(true); fetchService(); }}
          activeOpacity={0.8}
        >
          <ArrowsClockwise size={20} color={COLORS.white} style={{ marginRight: 6 }} />
          <Text style={styles.retryButtonText}>Qayta urinish</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const typeInfo = SERVICE_TYPES.find((st) => st.value === service.type) || {
    label: service.type,
    icon: '🎉',
  };
  const translatedTypeLabel = t(`type_${service.type}`) || typeInfo.label;
  const reviews = service.reviews || [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <KeyboardAvoidingView 
      style={styles.screen} 
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <ScrollView
        ref={mainScrollRef}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: Math.max(40, keyboardHeight + 60) }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ── Image Gallery ───────────────────── */}
        <ImageGallery
          images={service.images}
          serviceType={service.type}
          onBack={() => navigation.goBack()}
        />

        <View style={styles.content}>
          {/* ── Service Info ──────────────────── */}
          <View style={styles.section}>
            <Text style={styles.serviceName}>{service.name}</Text>

            <View style={styles.metaRow}>
              <View style={[styles.typeBadge, { backgroundColor: COLORS.primaryLight }]}>
                <View style={{marginRight: 6}}>{getPhosphorIcon(service.type, true, 16)}</View>
                <Text style={styles.typeBadgeText}>{translatedTypeLabel}</Text>
              </View>
              {avgRating && (
                <View style={styles.ratingBadge}>
                  <Star size={14} color="#F59E0B" weight="fill" />
                  <Text style={styles.ratingBadgeText}>{avgRating}</Text>
                  <Text style={styles.ratingCount}>({reviews.length})</Text>
                </View>
              )}
              {service.type === 'TUYXONA' && service.capacity && (
                <View style={styles.capacityBadge}>
                  <Users size={14} color={COLORS.primary} weight="fill" />
                  <Text style={styles.capacityBadgeText}>{service.capacity} {t('capacity_people') || 'kishilik'}</Text>
                </View>
              )}
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              <View>
                <Text style={styles.priceLabel}>{t('price') || 'Narxi'}</Text>
                {(!service.price || service.price === 0 || service.price === '0') ? (
                  <Text style={[styles.priceValue, { color: COLORS.primary }]}>{t('negotiable_price') || 'Kelishilgan narxda'}</Text>
                ) : (
                  <Text style={styles.priceValue}>{formatPrice(service.price)} {t('currency_uzs') || "so'm"}</Text>
                )}
              </View>
              {service.capacity > 0 && service.price > 0 && (
                <View style={{backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12}}>
                  <Text style={{fontSize: 13, color: COLORS.textSecondary, fontWeight: '500'}}>{t('average_per_person') || "O'rtacha kishi boshiga"}</Text>
                  <Text style={{fontSize: 14, color: COLORS.primary, fontWeight: '700'}}>
                    ~ {formatPrice(Math.round(service.price / service.capacity))} {t('currency_uzs') || "so'm"}
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            {service.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>{t('description') || 'Tavsif'}</Text>
                <Text style={styles.descriptionText}>{service.description}</Text>
              </View>
            )}

            {/* Extra services */}
            {service.extra_services && service.extra_services.length > 0 && (
              <View style={styles.extrasContainer}>
                <Text style={styles.extrasTitle}>{t('extra_services') || "Qo'shimcha xizmatlar"}</Text>
                <View style={styles.chipRow}>
                  {(typeof service.extra_services === 'string' ? service.extra_services.split(',') : service.extra_services).map((extra, i) => (
                    <View key={i} style={styles.chip}>
                      <CheckCircle size={14} color={COLORS.success} weight="fill" style={{ marginRight: 4 }} />
                      <Text style={styles.chipText}>{typeof extra === 'string' ? extra.trim() : String(extra)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* ── Provider Card ────────────────── */}
          {service.provider && (
            <View style={styles.providerCard}>
              <View style={styles.providerHeader}>
                <View style={styles.providerAvatar}>
                  <User size={22} color={COLORS.primary} />
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>
                    {service.provider.full_name || service.provider.name || 'Provayder'}
                  </Text>
                  <Text style={styles.providerLabel}>{t('service_owner') || "Xizmat ko'rsatuvchi"}</Text>
                </View>
              </View>
              {service.provider.phone_number && (
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => Linking.openURL(`tel:${service.provider.phone_number}`)}
                  activeOpacity={0.7}
                >
                  <Phone size={18} color={COLORS.primary} />
                  <Text style={styles.callButtonText}>{service.provider.phone_number}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── Location Card ────────────────── */}
          {service.location_name && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MapPin size={22} color={COLORS.primary} weight="fill" />
                <Text style={styles.sectionTitle}>{t('address') || 'Manzil'}</Text>
              </View>
              <View style={styles.locationCard}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoText, { marginLeft: 0 }]}>{service.location_name}</Text>
                </View>
                
                {service.location_lat && service.location_lng && (
                  <TouchableOpacity
                    style={styles.mapContainer}
                    activeOpacity={0.8}
                    onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${service.location_lat},${service.location_lng}`)}
                  >
                    <YaMap
                      style={styles.map}
                      initialRegion={{
                        lat: Number(service.location_lat),
                        lon: Number(service.location_lng),
                        zoom: 14,
                      }}
                      scrollGesturesEnabled={false}
                      zoomGesturesEnabled={false}
                      tiltGesturesEnabled={false}
                      rotateGesturesEnabled={false}
                    >
                      <Marker
                        point={{
                          lat: Number(service.location_lat),
                          lon: Number(service.location_lng),
                        }}
                      />
                    </YaMap>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* ── Booking Calendar ─────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CalendarBlank size={22} color={COLORS.primary} weight="fill" />
              <Text style={styles.sectionTitle}>{t('book_now') || 'Bron qilish'}</Text>
            </View>
            <BookingCalendar
              bookings={service.bookings || []}
              serviceId={id}
              token={token}
              onBooked={fetchService}
              onLoginRequired={() => navigation.navigate('Login')}
              t={t}
            />
          </View>

          {/* ── Reviews Section ──────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Chats size={22} color={COLORS.primary} weight="fill" />
              <Text style={styles.sectionTitle}>
                {t('customer_reviews') || 'Izohlar'} {reviews.length > 0 ? `(${reviews.length})` : ''}
              </Text>
            </View>

            {/* Review list */}
            {reviews.length === 0 ? (
              <View style={styles.emptyReviews}>
                <ChatCircleDots size={40} color={COLORS.textLight} />
                <Text style={styles.emptyReviewsText}>{t('no_reviews_yet') || "Hali izohlar yo'q"}</Text>
                <Text style={styles.emptyReviewsSub}>{t('leave_your_opinion') || "Birinchi bo'lib izoh qoldiring!"}</Text>
              </View>
            ) : (
              reviews.map((review, i) => (
                <View key={review.id || i} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>
                        {(review.user_name || review.user?.full_name || 'F')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>
                        {review.user_name || review.user?.full_name || 'Foydalanuvchi'}
                      </Text>
                      <StarRating rating={review.rating} size={14} />
                    </View>
                    {(review.created_at || review.date) && (
                      <Text style={styles.reviewDate}>
                        {new Date(review.created_at || review.date).toLocaleDateString('uz-UZ')}
                      </Text>
                    )}
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))
            )}

            {/* Add review form */}
            {token ? (
              <View style={styles.reviewForm}>
                <Text style={styles.reviewFormTitle}>{t('write_comment') || 'Izoh qoldirish'}</Text>
                <View style={styles.reviewFormRating}>
                  <Text style={styles.reviewFormLabel}>{t('leave_rating') || 'Bahoingiz'}:</Text>
                  <StarPicker rating={reviewRating} onChange={setReviewRating} />
                </View>
                <TextInput
                  style={styles.reviewInput}
                  placeholder={t('write_opinion_placeholder') || "Izohingizni yozing..."}
                  placeholderTextColor={COLORS.textLight}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  onFocus={() => {
                    setTimeout(() => {
                      mainScrollRef.current?.scrollToEnd({ animated: true });
                    }, 350);
                  }}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[styles.submitReviewButton, submittingReview && styles.bookButtonDisabled]}
                  onPress={handleSubmitReview}
                  disabled={submittingReview}
                  activeOpacity={0.8}
                >
                  {submittingReview ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <>
                      <PaperPlaneRight size={18} color={COLORS.white} weight="fill" style={{ marginRight: 8 }} />
                      <Text style={styles.submitReviewText}>{t('leave_comment_btn') || 'Yuborish'}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.loginPrompt} onPress={() => navigation.navigate('Login')}>
                <Lock size={18} color={COLORS.primary} />
                <Text style={[styles.loginPromptText, { color: COLORS.primary, marginLeft: 8 }]}>{t('login_to_leave_comment') || 'Izoh qoldirish uchun tizimga kiring'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 32,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // ── Gallery ───────────────────────
  galleryContainer: {
    height: IMAGE_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: COLORS.primaryDark,
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  placeholderGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 64,
  },
  placeholderText: {
    ...FONTS.h2,
    color: COLORS.white,
    marginTop: 8,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.white,
    width: 24,
    borderRadius: 4,
  },

  // ── Service Info ──────────────────
  section: {
    marginBottom: 20,
  },
  serviceName: {
    ...FONTS.h1,
    fontSize: 26,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  typeBadgeText: {
    ...FONTS.medium,
    color: COLORS.primary,
    fontSize: 13,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9E7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingBadgeText: {
    ...FONTS.semibold,
    color: '#92400E',
    fontSize: 13,
    marginLeft: 4,
  },
  ratingCount: {
    ...FONTS.caption,
    marginLeft: 2,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  capacityBadgeText: {
    ...FONTS.semibold,
    color: COLORS.primary,
    fontSize: 13,
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    ...FONTS.regular,
    marginLeft: 8,
    flex: 1,
  },
  mapContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 12,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  priceContainer: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  priceLabel: {
    ...FONTS.caption,
    fontSize: 13,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionTitle: {
    ...FONTS.h3,
    marginBottom: 8,
  },
  descriptionText: {
    ...FONTS.regular,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  extrasContainer: {
    marginBottom: 8,
  },
  extrasTitle: {
    ...FONTS.h3,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    ...FONTS.medium,
    fontSize: 13,
    color: '#065F46',
  },

  // ── Provider Card ─────────────────
  providerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    ...FONTS.semibold,
    fontSize: 16,
  },
  providerLabel: {
    ...FONTS.caption,
    marginTop: 2,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
  },
  callButtonText: {
    ...FONTS.semibold,
    color: COLORS.primary,
    marginLeft: 8,
  },

  // ── Calendar ──────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...FONTS.h2,
    marginLeft: 8,
  },
  calendarContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.sm,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarTitle: {
    ...FONTS.h3,
    fontSize: 17,
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: `${100 / 7}%`,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayName: {
    ...FONTS.caption,
    fontWeight: '600',
    fontSize: 13,
  },
  calendarDay: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  calendarDayText: {
    ...FONTS.medium,
    fontSize: 15,
  },
  calendarDayPast: {
    opacity: 0.35,
  },
  calendarDayTextPast: {
    color: COLORS.textLight,
  },
  calendarDayConfirmed: {
    backgroundColor: COLORS.dangerLight,
  },
  calendarDayPending: {
    backgroundColor: COLORS.warningLight,
  },
  calendarDayTextBooked: {
    fontWeight: '700',
  },
  calendarDaySelected: {
    backgroundColor: COLORS.primary,
  },
  calendarDayTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    ...FONTS.small,
    fontSize: 12,
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    ...SHADOWS.lg,
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.textLight,
    ...SHADOWS.sm,
  },
  bookButtonText: {
    ...FONTS.semibold,
    color: COLORS.white,
    fontSize: 16,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 12,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
  },
  loginPromptText: {
    ...FONTS.medium,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },

  // ── Reviews ───────────────────────
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyReviewsText: {
    ...FONTS.h3,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptyReviewsSub: {
    ...FONTS.caption,
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewAvatarText: {
    ...FONTS.bold,
    color: COLORS.primary,
    fontSize: 15,
  },
  reviewName: {
    ...FONTS.semibold,
    fontSize: 14,
    marginBottom: 2,
  },
  reviewDate: {
    ...FONTS.small,
  },
  reviewComment: {
    ...FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
    paddingLeft: 46,
  },
  reviewForm: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewFormTitle: {
    ...FONTS.h3,
    marginBottom: 12,
  },
  reviewFormRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  reviewFormLabel: {
    ...FONTS.medium,
    color: COLORS.textSecondary,
  },
  reviewInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 14,
    ...FONTS.regular,
    minHeight: 80,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  submitReviewButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  submitReviewText: {
    ...FONTS.semibold,
    color: COLORS.white,
    fontSize: 15,
  },

  // ── Retry ─────────────────────────
  retryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  retryButtonText: {
    ...FONTS.semibold,
    color: COLORS.white,
  },
});
