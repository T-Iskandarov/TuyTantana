import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, WarningCircle, Lock, Eye, EyeSlash, ArrowRight, UserCircle, Briefcase, SignOut, User, Phone, Calendar, X, Check, FolderOpen, Trash, UserPlus, CheckCircle, ArrowLeft } from 'phosphor-react-native';
import { COLORS, FONTS, SHADOWS } from '../lib/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhoneDisplay = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 9);
    let formatted = '';
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
    return formatted;
  };

  const handlePhoneChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 9);
    setPhone(digits);
  };

  const handleLogin = async () => {
    setError('');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 9) {
      setError('Telefon raqamni to\'liq kiriting (9 raqam)');
      return;
    }
    if (password.length < 1) {
      setError('Parolni kiriting');
      return;
    }

    setLoading(true);
    try {
      const res = await login(`+998${cleanPhone}`, password);
      if (!res.success) {
        setError(res.message || 'Login yoki parol noto\'g\'ri');
      }
    } catch (e) {
      setError('Tarmoq xatosi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Illustration / Header Area */}
          <View style={styles.headerArea}>
            <View style={styles.headerGradient}>
              <View style={styles.decorCircle1} />
              <View style={styles.decorCircle2} />
              <View style={styles.decorCircle3} />
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Heart size={36} color={COLORS.primary} weight="fill" />
                </View>
                <Text style={styles.logoTitle}>To'y Tantana</Text>
                <Text style={styles.logoSubtitle}>
                  To'y xizmatlarini oson toping
                </Text>
              </View>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Kirish</Text>
            <Text style={styles.formSubtitle}>
              Hisobingizga kiring
            </Text>

            {/* Error Display */}
            {error ? (
              <View style={styles.errorBox}>
                <WarningCircle size={18} color={COLORS.danger} weight="fill" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Phone Input */}
            <Text style={styles.inputLabel}>Telefon raqam</Text>
            <View style={styles.phoneInputRow}>
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>+998</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="90 123 45 67"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
                maxLength={12}
                value={formatPhoneDisplay(phone)}
                onChangeText={handlePhoneChange}
              />
            </View>

            {/* Password Input */}
            <Text style={styles.inputLabel}>Parol</Text>
            <View style={styles.passwordRow}>
              <Lock size={20} color={COLORS.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.passwordInput}
                placeholder="Parolingizni kiriting"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <EyeSlash size={20} color={COLORS.textLight} /> : <Eye size={20} color={COLORS.textLight} />}
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Kirish</Text>
                  <ArrowRight size={20} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Hisobingiz yo'qmi? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Ro'yxatdan o'tish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* Header / Illustration */
  headerArea: {
    height: 280,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -40,
    right: -40,
  },
  decorCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 20,
    left: -30,
  },
  decorCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: 60,
    left: 50,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...SHADOWS.lg,
  },
  logoTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
  },

  /* Form Card */
  formCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: 420,
  },
  formTitle: {
    ...FONTS.h1,
    marginBottom: 4,
  },
  formSubtitle: {
    ...FONTS.caption,
    marginBottom: 24,
  },

  /* Error */
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '500',
  },

  /* Inputs */
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  prefixBox: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: 'center',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderWidth: 1.5,
    borderRightWidth: 0,
    borderColor: COLORS.primaryLight,
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  phoneInput: {
    flex: 1,
    height: 52,
    backgroundColor: COLORS.inputBg,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1.5,
    borderLeftWidth: 0,
    borderColor: COLORS.primaryLight,
  },

  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    height: 52,
    marginBottom: 28,
  },
  inputIcon: {
    marginLeft: 14,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 15,
    color: COLORS.text,
    height: '100%',
  },
  eyeBtn: {
    padding: 14,
  },

  /* Button */
  loginBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.lg,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },

  /* Bottom Link */
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  bottomText: {
    ...FONTS.caption,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
