import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretLeft, Question, Phone, TelegramLogo, CaretDown, CaretUp, Lifebuoy } from 'phosphor-react-native';
import { COLORS, SHADOWS } from '../lib/theme';
import { useLanguage } from '../context/LanguageContext';

export default function HelpSupportScreen({ navigation }) {
  const { t } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(0); // Birinchisi avtomatik ochilib turadi

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const faqs = [
    {
      q: t('faq1_q') || "Xizmatlarni qanday qilib online bron qilish mumkin?",
      a: t('faq1_a') || "Bosh sahifada o'zingizga ma'qul to'yxona yoki xizmat turini tanlang. Xizmat sahifasiga kirib, o'zingizga qulay bo'sh sanani (kalendarda kulrang rasmda ko'rsatilgan) belgilang va 'Band qilish' tugmasini bosing."
    },
    {
      q: t('faq2_q') || "Bron qilingan xizmatni bekor qilish yoki o'zgartirish mumkinmi?",
      a: t('faq2_a') || "Ha, albatta! 'Bronlarim' bo'limiga kirib, o'z bronlaringiz holatini ko'rishingiz va kerak bo'lsa xizmat ko'rsatuvchi bilan bog'lanib bekor qilishingiz yoki sanasini o'zgartirishingiz mumkin."
    },
    {
      q: t('faq3_q') || "Xizmat ko'rsatuvchi (to'yxona, xonanda) bilan qanday bog'lanaman?",
      a: t('faq3_a') || "Har bir xizmat sahifasida xizmat egasining telefon raqami va manzili ko'rsatilgan. Qo'ng'iroq qilish tugmasi orqali to'g'ridan-to'g'ri bog'lanishingiz mumkin."
    },
    {
      q: t('faq4_q') || "Platformadan foydalanish uchun to'lov qilinadimi?",
      a: t('faq4_a') || "Yo'q! To'y Tantana platformasidan foydalanish, xizmatlarni izlash va bron qilish barcha foydalanuvchilar uchun mutlaqo bepul."
    },
    {
      q: t('faq5_q') || "O'z xizmatimni platformaga qanday qo'shsam bo'ladi?",
      a: t('faq5_a') || "Profil bo'limidan 'Xizmat ko'rsatuvchi rejimi'ga o'ting va 'Xizmat qo'shish' tugmasi orqali o'z to'yxonangiz, studiyangiz yoki xizmatlaringiz haqida ma'lumot va rasmlarni yuklang."
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={24} color={COLORS.text} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('help_title') || t('help_support') || "Yordam va qo'llab-quvvatlash"}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBox}>
          <View style={styles.heroIconBox}>
            <Lifebuoy size={36} color={COLORS.primary} weight="duotone" />
          </View>
          <Text style={styles.heroTitle}>Sizga qanday yordam bera olamiz?</Text>
          <Text style={styles.heroSub}>Ko'p beriladigan savollar va operator bilan bog'lanish usullari</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('faq') || t('faq_title') || "Ko'p beriladigan savollar (FAQ)"}</Text>
          {faqs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <View key={index} style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleExpand(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqTitleRow}>
                    <View style={[styles.qIconBox, isExpanded && { backgroundColor: COLORS.primary }]}>
                      <Question size={18} color={isExpanded ? COLORS.white : COLORS.primary} weight="bold" />
                    </View>
                    <Text style={[styles.question, isExpanded && { color: COLORS.primary, fontWeight: '700' }]}>
                      {faq.q}
                    </Text>
                  </View>
                  {isExpanded ? (
                    <CaretUp size={20} color={COLORS.primary} weight="bold" />
                  ) : (
                    <CaretDown size={20} color={COLORS.textLight} weight="bold" />
                  )}
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.answerBox}>
                    <View style={styles.answerDivider} />
                    <Text style={styles.answer}>{faq.a}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('contact_us_title') || t('contact_us') || "Biz bilan bog'lanish"}</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity 
              style={styles.contactRow} 
              onPress={() => Linking.openURL('https://t.me/tuy_tantana_support')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                <TelegramLogo size={24} color="#0284C7" weight="fill" />
              </View>
              <View style={styles.contactTextBox}>
                <Text style={styles.contactLabel}>{t('write_telegram') || "Telegram orqali yozish (24/7)"}</Text>
                <Text style={styles.contactValue}>@tuy_tantana_support</Text>
              </View>
              <Text style={styles.contactArrow}>›</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.contactRow} 
              onPress={() => Linking.openURL('tel:+998973173497')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                <Phone size={24} color="#16A34A" weight="fill" />
              </View>
              <View style={styles.contactTextBox}>
                <Text style={styles.contactLabel}>{t('call_us') || "Operatorga qo'ng'iroq qilish"}</Text>
                <Text style={styles.contactValue}>+998 97 317 34 97</Text>
              </View>
              <Text style={styles.contactArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ height: 20 }} />
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
  heroBox: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  heroIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 10,
    ...SHADOWS.sm,
    shadowOpacity: 0.03,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  faqCardExpanded: {
    borderColor: '#E9D5FF',
    backgroundColor: '#FCFAFF',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  qIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 22,
  },
  answerBox: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answerDivider: {
    height: 1,
    backgroundColor: '#F3E8FF',
    marginBottom: 12,
  },
  answer: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    ...SHADOWS.sm,
    shadowOpacity: 0.04,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contactTextBox: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  contactArrow: {
    fontSize: 22,
    color: COLORS.textLight,
    fontWeight: '300',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
});
