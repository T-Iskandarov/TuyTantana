export const COLORS = {
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  primaryLight: '#EDE9FE',
  background: '#F5F3FF',
  card: '#FFFFFF',
  inputBg: '#F5F3FF',
  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
};

export const FONTS = {
  regular: { fontSize: 14, color: COLORS.text },
  medium: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  semibold: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  bold: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  h1: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
  small: { fontSize: 11, color: COLORS.textLight },
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
};

export const SERVICE_TYPES = [
  { value: 'TUYXONA', label: "To'yxona" },
  { value: 'FOTO_VIDEO', label: 'Foto va Video' },
  { value: 'XONANDA', label: 'Xonanda' },
  { value: 'SALON', label: "To'y salon" },
  { value: 'KORTEJ', label: 'Kortej' },
  { value: 'TASHKILOTCHI', label: 'Tashkilotchi' },
];

export const STATUS_MAP = {
  PENDING: { label: 'Kutilmoqda', color: COLORS.warning, bg: COLORS.warningLight },
  CONFIRMED: { label: 'Tasdiqlangan', color: COLORS.success, bg: COLORS.successLight },
  CANCELLED: { label: 'Bekor qilingan', color: COLORS.danger, bg: COLORS.dangerLight },
};
