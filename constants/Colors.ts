// Professional Healthcare App Color Scheme
const primaryBlue = '#3B82F6'; // Primary blue similar to healthcare app
const primaryBlueDark = '#2563EB';
const primaryBlueLight = '#60A5FA';
const accentBlue = '#1E40AF';
const backgroundGray = '#F8FAFC';
const cardWhite = '#FFFFFF';
const textPrimary = '#1E293B';
const textSecondary = '#64748B';
const textTertiary = '#94A3B8';

export default {
  light: {
    text: textPrimary,
    textSecondary: textSecondary,
    textTertiary: textTertiary,
    background: backgroundGray,
    surface: cardWhite,
    primary: primaryBlue,
    primaryDark: primaryBlueDark,
    primaryLight: primaryBlueLight,
    accent: accentBlue,
    tint: primaryBlue,
    tabIconDefault: textTertiary,
    tabIconSelected: primaryBlue,
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    // Healthcare app specific colors
    cardBackground: cardWhite,
    cardShadow: 'rgba(59, 130, 246, 0.08)',
    glassmorphism: 'rgba(255, 255, 255, 0.85)',
    gradientStart: primaryBlue,
    gradientEnd: primaryBlueDark,
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    background: '#0F172A',
    surface: '#1E293B',
    primary: primaryBlueLight,
    primaryDark: primaryBlue,
    primaryLight: '#93C5FD',
    accent: '#60A5FA',
    tint: primaryBlueLight,
    tabIconDefault: '#64748B',
    tabIconSelected: primaryBlueLight,
    border: '#334155',
    borderLight: '#475569',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    // Healthcare app specific colors
    cardBackground: '#1E293B',
    cardShadow: 'rgba(59, 130, 246, 0.15)',
    glassmorphism: 'rgba(30, 41, 59, 0.85)',
    gradientStart: primaryBlueLight,
    gradientEnd: primaryBlue,
  },
};
