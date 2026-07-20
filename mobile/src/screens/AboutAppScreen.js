import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretLeft, Info } from 'phosphor-react-native';
import { COLORS, SHADOWS } from '../lib/theme';

export default function AboutAppScreen({ navigation }) {
  const showTerms = () => {
    Alert.alert(
      "Foydalanish shartlari",
      "Ushbu xizmatdan foydalanish orqali siz CUBO kompaniyasi tomonidan belgilangan barcha shartlar va qoidalarga rozilik bildirasiz. Platforma foydalanuvchilari va xizmat ko'rsatuvchilar o'zaro ishonch asosida harakat qilishlari shart."
    );
  };

  const showPrivacy = () => {
    Alert.alert(
      "Maxfiylik siyosati",
      "CUBO kompaniyasi sizning shaxsiy ma'lumotlaringiz xavfsizligini ta'minlaydi. Biz ma'lumotlaringizni uchinchi shaxslarga bermaymiz va faqat xizmat sifatini oshirish maqsadida foydalanamiz."
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={24} color={COLORS.text} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ilova haqida</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Info size={48} color={COLORS.primary} weight="duotone" />
          </View>
          <Text style={styles.appName}>To'y Tantana</Text>
          <Text style={styles.version}>Versiya 1.0.0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.description}>
            To'y Tantana — bu to'y va marosimlarni tashkil etishda yordam beradigan eng qulay platforma. Bizning maqsadimiz foydalanuvchilar va xizmat ko'rsatuvchilar o'rtasida ishonchli va oson aloqani ta'minlashdir.
          </Text>
          
          <View style={styles.linksContainer}>
            <TouchableOpacity style={styles.linkRow} onPress={showTerms}>
              <Text style={styles.linkText}>Foydalanish shartlari</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.linkRow} onPress={showPrivacy}>
              <Text style={styles.linkText}>Maxfiylik siyosati</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.copyright}>© 2026 CUBO. Barcha huquqlar himoyalangan.</Text>
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
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.md,
    shadowOpacity: 0.1,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  version: {
    fontSize: 15,
    color: COLORS.textLight,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    ...SHADOWS.sm,
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  description: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  linksContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  linkRow: {
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  copyright: {
    marginTop: 40,
    fontSize: 13,
    color: COLORS.textLight,
  },
});
