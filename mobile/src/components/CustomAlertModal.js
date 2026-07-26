import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { CheckCircle, XCircle, WarningCircle, Info, Question } from 'phosphor-react-native';
import { COLORS, SHADOWS } from '../lib/theme';

const { width } = Dimensions.get('window');

export default function CustomAlertModal({
  visible,
  title,
  message,
  type = 'info', // 'success' | 'error' | 'warning' | 'info' | 'confirm'
  onClose,
  onConfirm,
  confirmText = "Davom etish",
  cancelText = "Bekor qilish",
  closeText = "Tushundim"
}) {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={54} color={COLORS.success || '#10B981'} weight="fill" />;
      case 'error':
        return <XCircle size={54} color={COLORS.danger || '#EF4444'} weight="fill" />;
      case 'warning':
        return <WarningCircle size={54} color={COLORS.warning || '#F59E0B'} weight="fill" />;
      case 'confirm':
        return <Question size={54} color={COLORS.primary || '#7C3AED'} weight="fill" />;
      default:
        return <Info size={54} color={COLORS.primary || '#7C3AED'} weight="fill" />;
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case 'success': return '#D1FAE5';
      case 'error': return '#FEE2E2';
      case 'warning': return '#FEF3C7';
      case 'confirm': return '#EDE9FE';
      default: return '#EDE9FE';
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertCard}>
          <View style={[styles.iconBadge, { backgroundColor: getBadgeColor() }]}>
            {getIcon()}
          </View>

          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.buttonContainer}>
            {type === 'confirm' ? (
              <>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} activeOpacity={0.8}>
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm || onClose} activeOpacity={0.8}>
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.primaryButtonText}>{closeText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertCard: {
    width: Math.min(width - 48, 340),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.lg,
    elevation: 10,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary || '#7C3AED',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: COLORS.primary || '#7C3AED',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
});
