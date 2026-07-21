import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  SignOut, 
  UserCircle, 
  Briefcase, 
  Star, 
  CreditCard, 
  Headset, 
  Info,
  CaretRight,
  ShieldCheck,
  CalendarBlank,
  Camera,
  Storefront,
  TelegramLogo
} from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../lib/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Chiqish",
      "Haqiqatan ham hisobdan chiqmoqchimisiz?",
      [
        { text: "Bekor qilish", style: "cancel" },
        { 
          text: "Chiqish", 
          style: "destructive",
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>
        <View style={styles.emptyContainer}>
          <UserCircle size={80} color={COLORS.textLight} weight="light" />
          <Text style={styles.emptyText}>Tizimga kirmagansiz</Text>
          <Text style={styles.emptySubtext}>Barcha imkoniyatlardan foydalanish uchun tizimga kiring</Text>
          
          <TouchableOpacity 
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginBtnText}>Kirish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : '?';
  const roleLabel = user.role === 'PROVIDER' ? "Xizmat ko'rsatuvchi" : "Foydalanuvchi";
  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ') : 'Yaqinda';

  const MenuItem = ({ icon: Icon, title, subtitle, onPress, color = COLORS.primary }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconBox, { backgroundColor: `${color}15` }]}>
          <Icon size={22} color={color} weight="duotone" />
        </View>
        <View style={styles.menuItemTextContainer}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <CaretRight size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.heroCardContainer}>
          <LinearGradient
            colors={['#8B5CF6', '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBackground}
          />
          
          <View style={styles.heroContent}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <UserCircle size={48} color={COLORS.white} weight="fill" />
              </View>
            </View>
            
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userPhone}>{user.phone_number}</Text>
            
            <View style={styles.roleBadge}>
              {user.role === 'PROVIDER' ? (
                <Storefront size={16} color={COLORS.primary} weight="duotone" style={{marginRight: 6}} />
              ) : null}
              <Text style={styles.roleBadgeText}>{roleLabel}</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <View style={styles.statIconBox}>
                  <CalendarBlank size={20} color={COLORS.primary} weight="duotone" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>Ro'yxatdan o'tgan</Text>
                  <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{joinDate}</Text>
                </View>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statBox}>
                <View style={styles.statIconBox}>
                  <ShieldCheck size={20} color={COLORS.primary} weight="duotone" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.statLabel}>Hisob holati</Text>
                  <View style={styles.statusValueContainer}>
                    <Text style={styles.statValue}>Faol</Text>
                    <View style={styles.activeDot} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {user.role === 'PROVIDER' && (
            <MenuItem 
              icon={Briefcase}
              title="Xizmatlarimni boshqarish"
              subtitle="Xizmatlar va buyurtmalar"
              onPress={() => navigation.navigate('ProviderServices')}
              color={COLORS.primary}
            />
          )}

          <MenuItem 
            icon={TelegramLogo}
            title="Botga ulanish"
            subtitle="@Tuy_Tantana_bot ga o'tish"
            onPress={() => Linking.openURL('https://t.me/Tuy_Tantana_bot')}
            color="#0088cc"
          />

          <MenuItem 
            icon={CreditCard}
            title="To'lov usullari"
            subtitle="Karta va to'lov hisoblaringiz"
            onPress={() => navigation.navigate('PaymentMethods')}
            color="#6366F1"
          />

          <MenuItem 
            icon={Headset}
            title="Yordam"
            subtitle="Tez-tez so'raladigan savollar va yordam"
            onPress={() => navigation.navigate('HelpSupport')}
            color="#14B8A6"
          />

          <MenuItem 
            icon={Info}
            title="Ilova haqida"
            subtitle="Versiya, shartlar va maxfiylik"
            onPress={() => navigation.navigate('AboutApp')}
            color="#F59E0B"
          />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <SignOut size={22} color={COLORS.danger} weight="bold" />
          <Text style={styles.logoutText}>Chiqish</Text>
        </TouchableOpacity>

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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Hero section
  heroCardContainer: {
    borderRadius: 24,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    marginBottom: 20,
    ...SHADOWS.md,
    shadowOpacity: 0.08,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  heroBackground: {
    height: 140,
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  heroContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 80,
    padding: 20,
    paddingTop: 55,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'absolute',
    top: -45,
    alignSelf: 'center',
    zIndex: 10,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  userPhone: {
    fontSize: 15,
    color: COLORS.textLight,
    marginBottom: 12,
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    ...SHADOWS.sm,
    shadowOpacity: 0.05,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginLeft: 6,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
    alignSelf: 'center',
  },

  // Menu Section
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 8,
    marginBottom: 20,
    ...SHADOWS.sm,
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  
  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 20,
    ...SHADOWS.sm,
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.danger,
    marginLeft: 10,
  },
});
