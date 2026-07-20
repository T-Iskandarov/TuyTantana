import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, CaretLeft, Heart, Copy, Check } from 'phosphor-react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SHADOWS } from '../lib/theme';

export default function PaymentMethodsScreen({ navigation }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync('5614681605733884');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={24} color={COLORS.text} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To'lov usullari</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Heart size={32} color={COLORS.danger} weight="fill" />
          </View>
          <Text style={styles.title}>Xizmatdan foydalanish bepul!</Text>
          <Text style={styles.description}>
            Hozirda ilovamizdan foydalanish mutlaqo bepul. Agar siz loyihamizni qo'llab-quvvatlamoqchi bo'lsangiz (donat), quyidagi karta raqamiga ixtiyoriy summa o'tkazishingiz mumkin.
          </Text>
          
          <View style={styles.paymentCard}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <CreditCard size={24} color={COLORS.primary} weight="duotone" />
              <View style={styles.paymentInfo}>
                <Text style={styles.cardNumber}>5614 6816 0573 3884</Text>
                <Text style={styles.cardHolder}>Tursunpo'lat Iskandarov</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              {copied ? (
                <Check size={20} color={COLORS.success} weight="bold" />
              ) : (
                <Copy size={20} color={COLORS.textLight} weight="duotone" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.md,
    shadowOpacity: 0.05,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  cardHolder: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  copyBtn: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
});
