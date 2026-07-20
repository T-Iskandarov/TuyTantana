import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretLeft, Question, Phone, TelegramLogo } from 'phosphor-react-native';
import { COLORS, SHADOWS } from '../lib/theme';

export default function HelpSupportScreen({ navigation }) {
  const faqs = [
    {
      q: "Xizmatlarni qanday bron qilish mumkin?",
      a: "Bosh sahifadan o'zingizga kerakli xizmatni tanlang va 'Band qilish' tugmasini bosing. Sanani tanlab tasdiqlang."
    },
    {
      q: "Bron qilingan xizmatni bekor qilsam bo'ladimi?",
      a: "Ha, 'Bronlarim' bo'limiga kirib, xizmatni bekor qilish imkoniyati mavjud."
    },
    {
      q: "Xizmat ko'rsatuvchi bilan qanday bog'lanaman?",
      a: "Xizmat sahifasida xizmat ko'rsatuvchining telefon raqami ko'rsatilgan bo'ladi."
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={24} color={COLORS.text} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yordam va qo'llab-quvvatlash</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ko'p beriladigan savollar</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqCard}>
              <View style={styles.faqHeader}>
                <Question size={20} color={COLORS.primary} weight="fill" />
                <Text style={styles.question}>{faq.q}</Text>
              </View>
              <Text style={styles.answer}>{faq.a}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biz bilan bog'lanish</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity style={styles.contactRow}>
              <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                <TelegramLogo size={24} color="#0284C7" weight="fill" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Telegram orqali yozish</Text>
                <Text style={styles.contactValue}>@tuy_tantana_support</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.contactRow}>
              <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                <Phone size={24} color="#16A34A" weight="fill" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Qo'ng'iroq qilish</Text>
                <Text style={styles.contactValue}>+998 90 123 45 67</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...SHADOWS.sm,
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 22,
  },
  answer: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
    marginLeft: 32,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.sm,
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
});
