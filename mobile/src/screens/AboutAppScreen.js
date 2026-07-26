import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretLeft, Info, FileText, ShieldCheck, X, CheckCircle } from 'phosphor-react-native';
import { COLORS, SHADOWS } from '../lib/theme';
import { useLanguage } from '../context/LanguageContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AboutAppScreen({ navigation }) {
  const { t } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('terms'); // 'terms' | 'privacy'

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const getModalTitle = () => {
    if (modalType === 'terms') {
      return t('terms_of_use') || "Foydalanish shartlari";
    }
    return t('privacy_policy') || "Maxfiylik siyosati";
  };

  const getModalContent = () => {
    if (modalType === 'terms') {
      return t('terms_of_use_desc') || "1. Umumiy qoidalar:\nUshbu platformadan foydalanish orqali siz CUBO kompaniyasi tomonidan belgilangan barcha shartlar va qoidalarga rozilik bildirasiz.\n\n2. Xizmatlarni bron qilish:\nPlatforma foydalanuvchilari va xizmat ko'rsatuvchilar o'zaro ishonch, halollik va qonunchilik asosida harakat qilishlari shart. Bron qilingan xizmatlarning o'z vaqtida va sifatli ko'rsatilishi bo'yicha mas'uliyat xizmat ko'rsatuvchi zimmasidadir.\n\n3. Bekor qilish qoidalari:\nBron qilingan xizmatni bekor qilish kamida 3 kun oldin amalga oshirilishi tavsiya etiladi. Noto'g'ri ma'lumot kiritgan yoki qoidalarni buzgan hisoblar admin tomonidan bloklanishi mumkin.";
    }
    return t('privacy_policy_desc') || "1. Ma'lumotlar xavfsizligi:\nCUBO kompaniyasi sizning shaxsiy ma'lumotlaringiz (ism-sharif, telefon raqam va bron tarixlari) xavfsizligini to'liq ta'minlaydi va ularni zamonaviy shifrlash usullari bilan himoyalaydi.\n\n2. Ma'lumotlardan foydalanish:\nBiz ma'lumotlaringizni uchinchi shaxslarga bermaymiz va sotmaymiz. Ma'lumotlar faqatgina platformaning ishlashini ta'minlash, xizmat sifatini oshirish va bron jarayonlarida tomonlarni bog'lash maqsadida foydalaniladi.\n\n3. Foydalanuvchi huquqlari:\nSiz istalgan vaqtda o'z profil ma'lumotlaringizni tahrirlashingiz yoki hisobingizni o'chirishni so'rab murojaat qilishingiz mumkin.";
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={24} color={COLORS.text} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('about_app') || 'Ilova haqida'}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Info size={48} color={COLORS.primary} weight="duotone" />
          </View>
          <Text style={styles.appName}>To'y Tantana</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Versiya 1.0.0 (Release)</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.description}>
            {t('about_app_desc') || "To'y Tantana — O'zbekistondagi eng yirik to'y va marosim xizmatlarini izlash, topish va online bron qilish platformasi. Bizning maqsadimiz — foydalanuvchilar va xizmat ko'rsatuvchilar o'rtasida ishonchli, shaffof va qulay aloqani ta'minlashdir."}
          </Text>
          
          <View style={styles.linksContainer}>
            <TouchableOpacity style={styles.linkRow} onPress={() => openModal('terms')} activeOpacity={0.7}>
              <View style={styles.linkLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                  <FileText size={20} color={COLORS.primary} weight="duotone" />
                </View>
                <Text style={styles.linkText}>{t('terms_of_use') || 'Foydalanish shartlari'}</Text>
              </View>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} onPress={() => openModal('privacy')} activeOpacity={0.7}>
              <View style={styles.linkLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                  <ShieldCheck size={20} color="#16A34A" weight="duotone" />
                </View>
                <Text style={styles.linkText}>{t('privacy_policy') || 'Maxfiylik siyosati'}</Text>
              </View>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.copyrightContainer}>
          <Text style={styles.copyrightBold}>© 2026 CUBO kompaniyasi.</Text>
          <Text style={styles.copyright}>{t('all_rights_reserved') || 'Barcha huquqlar himoyalangan.'}</Text>
          <Text style={styles.tagline}>O'zbekistondagi №1 To'y va marosim xizmatlari platformasi</Text>
        </View>
      </ScrollView>

      {/* Slide-up Modal for Terms & Privacy */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                {modalType === 'terms' ? (
                  <FileText size={24} color={COLORS.primary} weight="duotone" />
                ) : (
                  <ShieldCheck size={24} color="#16A34A" weight="duotone" />
                )}
                <Text style={styles.modalTitle}>{getModalTitle()}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={22} color={COLORS.textLight} weight="bold" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalBodyText}>{getModalContent()}</Text>
              <View style={{ height: 24 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.confirmBtn} onPress={() => setModalVisible(false)}>
                <CheckCircle size={20} color={COLORS.white} weight="bold" style={{ marginRight: 8 }} />
                <Text style={styles.confirmBtnText}>Tushundim / Yopish</Text>
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
    marginTop: 20,
    marginBottom: 28,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOWS.md,
    shadowOpacity: 0.1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  versionBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 22,
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
    paddingTop: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  arrowText: {
    fontSize: 22,
    color: COLORS.textLight,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  copyrightContainer: {
    marginTop: 36,
    marginBottom: 20,
    alignItems: 'center',
  },
  copyrightBold: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  copyright: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.8,
    minHeight: SCREEN_HEIGHT * 0.5,
    padding: 20,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
    marginBottom: 16,
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
  },
  modalScroll: {
    flex: 1,
  },
  modalBodyText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    marginTop: 8,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    ...SHADOWS.md,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
