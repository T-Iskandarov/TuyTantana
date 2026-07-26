import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, EnvelopeSimple, MapPin, InstagramLogo, TelegramLogo } from 'phosphor-react-native';
import { COLORS } from '../lib/theme';
import { useLanguage } from '../context/LanguageContext';

export default function ContactScreen() {
  const { t } = useLanguage();

  const handleCall = () => {
    Linking.openURL(`tel:+998973173497`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:tursunpulatiskandarov@gmail.com`);
  };

  const handleTelegram = () => {
    Linking.openURL(`https://t.me/T_Iskandarov`);
  };

  const handleInstagram = () => {
    Linking.openURL(`https://instagram.com/T_Iskandarov_`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('contact') || "Murojaat"}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('contact') || "Murojaat"}</Text>
        <Text style={styles.description}>
          {t('contact_desc') || "Biz bilan bog'lanish uchun quyidagi aloqa vositalaridan foydalanishingiz mumkin. Savollaringiz yoki takliflaringiz bo'lsa, xursandchilik bilan javob beramiz!"}
        </Text>

        <TouchableOpacity style={styles.contactCard} onPress={handleCall} activeOpacity={0.7}>
          <View style={styles.iconContainer}>
            <Phone size={24} color={COLORS.primary} weight="fill" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>{t('phone_number') || "Telefon raqam"}</Text>
            <Text style={styles.cardValue}>+998 97 317 34 97</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handleTelegram} activeOpacity={0.7}>
          <View style={styles.iconContainer}>
            <TelegramLogo size={24} color={COLORS.primary} weight="fill" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>{t('telegram') || "Telegram"}</Text>
            <Text style={styles.cardValue}>@T_Iskandarov</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handleInstagram} activeOpacity={0.7}>
          <View style={styles.iconContainer}>
            <InstagramLogo size={24} color={COLORS.primary} weight="fill" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>{t('instagram') || "Instagram"}</Text>
            <Text style={styles.cardValue}>@T_Iskandarov_</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handleEmail} activeOpacity={0.7}>
          <View style={styles.iconContainer}>
            <EnvelopeSimple size={24} color={COLORS.primary} weight="fill" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>{t('email') || "Pochta"}</Text>
            <Text style={styles.cardValue}>tursunpulatiskandarov@gmail.com</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.contactCard}>
          <View style={styles.iconContainer}>
            <MapPin size={24} color={COLORS.primary} weight="fill" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>{t('address') || "Manzil"}</Text>
            <Text style={styles.cardValue}>{t('qarshi_city') || "Qarshi shahri"}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#322268',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: 30,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});
