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

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('USER');
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

  const handleRegister = async () => {
    setError('');
    if (!name.trim()) {
      setError('Ismingizni kiriting');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 9) {
      setError('Telefon raqamni to\'liq kiriting (9 raqam)');
      return;
    }
    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: name.trim(),
        phone_number: `+998${cleanPhone}`,
        password,
        role,
      });
      if (!res.success) {
        setError(res.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
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
          {/* Header */}
          <View style={styles.headerArea}>
            <View style={styles.headerGradient}>
              <View style={styles.decorCircle1} />
              <View style={styles.decorCircle2} />
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
              >
                <ArrowLeft size={22} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <View style={styles.logoCircle}>
                  <UserPlus size={30} color={COLORS.primary} />
                </View>
                <Text style={styles.headerTitle}>Ro'yxatdan o'tish</Text>
                <Text style={styles.headerSubtitle}>Yangi hisob yarating</Text>
              </View>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Error Display */}
            {error ? (
              <View style={styles.errorBox}>
                <WarningCircle size={18} color={COLORS.danger} weight="fill" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Name Input */}
            <Text style={styles.inputLabel}>Ism-sharifingiz</Text>
            <View style={styles.inputRow}>
              <User size={20} color={COLORS.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Ismingizni kiriting"
                placeholderTextColor={COLORS.textLight}
                value={name}
                onChangeText={setName}
              />
            </View>

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
                style={styles.textInput}
                placeholder="Kamida 6 ta belgi"
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

            {/* Role Selector */}
            <Text style={styles.inputLabel}>Sifatingiz</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  role === 'USER' && styles.roleBtnActive,
                ]}
                onPress={() => setRole('USER')}
                activeOpacity={0.8}
              >
                <User size={20} color={role === 'USER' ? COLORS.primary : COLORS.textLight} />
                <Text
                  style={[
                    styles.roleBtnText,
                    role === 'USER' && styles.roleBtnTextActive,
                  ]}
                >
                  Foydalanuvchi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  role === 'PROVIDER' && styles.roleBtnActive,
                ]}
                onPress={() => setRole('PROVIDER')}
                activeOpacity={0.8}
              >
                <Briefcase size={20} color={role === 'PROVIDER' ? COLORS.primary : COLORS.textLight} />
                <Text
                  style={[
                    styles.roleBtnText,
                    role === 'PROVIDER' && styles.roleBtnTextActive,
                  ]}
                >
                  Xizmat ko'rsatuvchi
                </Text>
              </TouchableOpacity>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Text style={styles.registerBtnText}>Ro'yxatdan o'tish</Text>
                  <CheckCircle size={20} color={COLORS.white} weight="fill" />
                </>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Hisobingiz bormi? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Kirish</Text>
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

  /* Header */
  headerArea: {
    height: 220,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -50,
    right: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 10,
    left: -20,
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...SHADOWS.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },

  /* Form Card */
  formCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    minHeight: 500,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    height: 52,
    marginBottom: 18,
  },
  inputIcon: {
    marginLeft: 14,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 15,
    color: COLORS.text,
    height: '100%',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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
    marginBottom: 22,
  },
  eyeBtn: {
    padding: 14,
  },

  /* Role Selector */
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.white,
    gap: 6,
  },
  roleBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  roleBtnTextActive: {
    color: COLORS.primary,
  },

  /* Button */
  registerBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.lg,
  },
  registerBtnDisabled: {
    opacity: 0.7,
  },
  registerBtnText: {
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
