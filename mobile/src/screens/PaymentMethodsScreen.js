import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, CaretLeft, Heart, Copy, Check, ShieldCheck, Bank, Lightning } from 'phosphor-react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SHADOWS } from '../lib/theme';
import { useLanguage } from '../context/LanguageContext';

export default function PaymentMethodsScreen({ navigation }) {
  const { t } = useLanguage();
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyCard = async () => {
    await Clipboard.setStringAsync('5614681605733884');
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const handleCopyPhone = async () => {
    await Clipboard.setStringAsync('+998973173497');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={24} color={COLORS.text} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('payment_methods') || "To'lov usullari"}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.freeBanner}>
          <View style={styles.bannerIconBox}>
            <Heart size={32} color={COLORS.danger} weight="fill" />
          </View>
          <Text style={styles.bannerTitle}>{t('service_is_free') || 'Xizmatdan foydalanish 100% BEPUL!'}</Text>
          <Text style={styles.bannerDesc}>
            {t('donation_desc') || "To'y Tantana platformasida xizmatlarni izlash, ko'rish, xizmat egalari bilan bog'lanish va online bron qilish uchun hech qanday komissiya yoki to'lov yo'q."}
          </Text>
        </View>

        {/* Homiylik / Donat bo'limi */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Bank size={20} color={COLORS.primary} weight="duotone" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Loyihani qo'llab-quvvatlash (Homiylik)</Text>
          </View>
          <Text style={styles.sectionSub}>
            Agar siz platformamiz rivojiga hissa qo'shmoqchi bo'lsangiz yoki minnatdorchilik bildirmog'chi bo'lsangiz, ixtiyoriy summa o'tkazishingiz mumkin:
          </Text>

          {/* Uzcard / Humo Card */}
          <View style={styles.paymentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>Humo / Uzcard</Text>
              </View>
              <Text style={styles.currencyText}>UZS (So'm)</Text>
            </View>
            
            <View style={styles.cardMain}>
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                  <CreditCard size={24} color={COLORS.primary} weight="duotone" />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.cardNumber} numberOfLines={1} adjustsFontSizeToFit={true} minimumFontScale={0.85}>
                    5614 6816 0573 3884
                  </Text>
                  <Text style={styles.cardHolder} numberOfLines={1}>Tursunpo'lat Iskandarov</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.copyBtn, copiedCard && styles.copyBtnSuccess]} onPress={handleCopyCard} activeOpacity={0.7}>
                {copiedCard ? (
                  <Check size={18} color={COLORS.white} weight="bold" />
                ) : (
                  <Copy size={18} color={COLORS.primary} weight="duotone" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Payme / Click / Paynet */}
          <View style={[styles.paymentCard, { marginTop: 14 }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardBadge, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.cardBadgeText, { color: '#0284C7' }]}>Payme / Click / Paynet</Text>
              </View>
              <Text style={styles.currencyText}>Tezkor o'tkazma</Text>
            </View>
            
            <View style={styles.cardMain}>
              <View style={styles.cardLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                  <Lightning size={24} color="#0284C7" weight="fill" />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.cardNumber} numberOfLines={1} adjustsFontSizeToFit={true} minimumFontScale={0.85}>
                    +998 97 317 34 97
                  </Text>
                  <Text style={styles.cardHolder} numberOfLines={1}>Telefon raqam orqali o'tkazish</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.copyBtn, copiedPhone && styles.copyBtnSuccess]} onPress={handleCopyPhone} activeOpacity={0.7}>
                {copiedPhone ? (
                  <Check size={18} color={COLORS.white} weight="bold" />
                ) : (
                  <Copy size={18} color={COLORS.primary} weight="duotone" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Xizmat ko'rsatuvchilar uchun eslatma */}
        <View style={styles.providerInfoCard}>
          <View style={styles.providerInfoRow}>
            <ShieldCheck size={24} color="#16A34A" weight="duotone" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.providerInfoTitle}>Xizmat ko'rsatuvchilar uchun</Text>
              <Text style={styles.providerInfoText}>
                To'yxonalar va san'atkorlar uchun platformaga elon joylash va VIP tariflar bo'yicha to'lovlar faqat rasmiy shartnoma yoki admin orqali tasdiqlanadi.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    padding: 20,
  },
  freeBanner: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    ...SHADOWS.md,
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bannerIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  bannerDesc: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionSub: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  paymentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    ...SHADOWS.sm,
    shadowOpacity: 0.04,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    overflow: 'hidden',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  paymentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  cardHolder: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  copyBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyBtnSuccess: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  providerInfoCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  providerInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  providerInfoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 4,
  },
  providerInfoText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 20,
  },
});
