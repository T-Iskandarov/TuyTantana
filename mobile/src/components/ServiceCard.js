import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Star, MapPin, Users, ChatTeardropText } from 'phosphor-react-native';
import { COLORS, SHADOWS, SERVICE_TYPES } from '../lib/theme';
import { IMAGE_BASE } from '../lib/api';
import { getPhosphorIcon } from '../lib/icons';
import { useLanguage } from '../context/LanguageContext';

function formatPrice(p) {
  if (!p && p !== 0) return '-';
  return Number(p).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export default function ServiceCard({ item, onPress, style }) {
  const { t } = useLanguage();
  const typeInfo = SERVICE_TYPES.find((st) => st.value === item.type) || { label: item.type, icon: '📌' };
  const hasImage = item.images && item.images.length > 0;
  const avgRating = item.average_rating || item.averageRating || 0;
  const reviewCount = item.reviews_count || item.reviewsCount || 0;

  return (
    <TouchableOpacity
      style={[styles.serviceCard, style]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Image */}
      <View style={styles.cardImageContainer}>
        {hasImage ? (
          <Image
            source={{ uri: `${IMAGE_BASE}${item.images[0].image_path}` }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cardPlaceholder}>
            {getPhosphorIcon(item.type, false, 40)}
          </View>
        )}
        
        {/* Top Left Badge */}
        <View style={styles.cardBadgeLeft}>
          <Text style={styles.cardBadgeText}>{typeInfo.label}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        {/* Conditional Layout for TUYXONA vs Other Services */}
        {(item.type === 'TUYXONA' || item.capacity) ? (
          <>
            <View style={styles.titleRow}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Star size={16} color="#FFB800" weight="fill" />
                <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.text }}>{Number(avgRating).toFixed(1)}</Text>
              </View>
            </View>

            <View style={[styles.infoLine, { justifyContent: 'space-between' }]}>
              <View style={styles.capacityBadge}>
                <Users size={14} color={COLORS.textSecondary} />
                <Text style={styles.capacityText} numberOfLines={1}>
                  {item.capacity ? `Sig'im: ${item.capacity} kishi` : "Sig'imi noma'lum"}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ChatTeardropText size={14} color={COLORS.textSecondary} />
                <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>{reviewCount} ta izoh</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.cardName, { marginBottom: 6 }]} numberOfLines={1}>
              {item.name}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Star size={16} color="#FFB800" weight="fill" />
                <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.text }}>{Number(avgRating).toFixed(1)}</Text>
              </View>
              <Text style={{ fontSize: 14, color: COLORS.textLight }}>•</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ChatTeardropText size={14} color={COLORS.textSecondary} />
                <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>{reviewCount} ta izoh</Text>
              </View>
            </View>
          </>
        )}

        {/* Location */}
        <View style={styles.infoLine}>
          <MapPin size={16} color={COLORS.textSecondary} />
          <Text style={styles.locationText} numberOfLines={2}>
            {item.location_name || 'Manzil kiritilmagan'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>{t('price') || 'Narxi'}</Text>
          <View style={styles.priceRow}>
            {(!item.price || item.price === 0 || item.price === '0') ? (
              <Text style={[styles.priceValue, { color: COLORS.primary }]}>{t('negotiable_price') || 'Kelishilgan narxda'}</Text>
            ) : (
              <Text style={styles.priceValue}>{formatPrice(item.price)} <Text style={styles.priceCurrency}>so'm</Text></Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 16,
    width: '100%',
    ...SHADOWS.sm,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  cardImageContainer: {
    height: 180,
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
  cardBadgeLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
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
  cardInfo: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  cardName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  capacityText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  priceContainer: {
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  priceCurrency: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
    marginLeft: 4,
  },
});
