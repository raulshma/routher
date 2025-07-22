export interface MD3ColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
}

export const lightColorScheme: MD3ColorScheme = {
  primary: '#6366F1',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E0E7FF',
  onPrimaryContainer: '#1E1B4B',
  secondary: '#10B981',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D1FAE5',
  onSecondaryContainer: '#064E3B',
  tertiary: '#F59E0B',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FEF3C7',
  onTertiaryContainer: '#92400E',
  error: '#EF4444',
  onError: '#FFFFFF',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#7F1D1D',
  background: '#FAFAFA',
  onBackground: '#1F1F1F',
  surface: '#FFFFFF',
  onSurface: '#1F1F1F',
  surfaceVariant: '#F3F4F6',
  onSurfaceVariant: '#6B7280',
  outline: '#D1D5DB',
  outlineVariant: '#E5E7EB',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#262626',
  inverseOnSurface: '#F5F5F5',
  inversePrimary: '#818CF8',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#FAFAFA',
  surfaceContainer: '#F9FAFB',
  surfaceContainerHigh: '#F3F4F6',
  surfaceContainerHighest: '#E5E7EB',
};

export const darkColorScheme: MD3ColorScheme = {
  primary: '#818CF8',
  onPrimary: '#1E1B4B',
  primaryContainer: '#312E81',
  onPrimaryContainer: '#E0E7FF',
  secondary: '#34D399',
  onSecondary: '#064E3B',
  secondaryContainer: '#065F46',
  onSecondaryContainer: '#D1FAE5',
  tertiary: '#FBBF24',
  onTertiary: '#92400E',
  tertiaryContainer: '#B45309',
  onTertiaryContainer: '#FEF3C7',
  error: '#F87171',
  onError: '#7F1D1D',
  errorContainer: '#991B1B',
  onErrorContainer: '#FEE2E2',
  background: '#0F0F0F',
  onBackground: '#F5F5F5',
  surface: '#171717',
  onSurface: '#F5F5F5',
  surfaceVariant: '#262626',
  onSurfaceVariant: '#A3A3A3',
  outline: '#525252',
  outlineVariant: '#404040',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#F5F5F5',
  inverseOnSurface: '#262626',
  inversePrimary: '#6366F1',
  surfaceContainerLowest: '#0A0A0A',
  surfaceContainerLow: '#171717',
  surfaceContainer: '#1F1F1F',
  surfaceContainerHigh: '#262626',
  surfaceContainerHighest: '#2D2D2D',
};

export interface MD3Typography {
  displayLarge: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  displayMedium: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  displaySmall: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  headlineLarge: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  headlineMedium: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  headlineSmall: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  titleLarge: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  titleMedium: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  titleSmall: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  bodyLarge: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  bodyMedium: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  bodySmall: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  labelLarge: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  labelMedium: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
  labelSmall: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500' | '600' | '700';
    letterSpacing: number;
  };
}

// Healthcare App Professional Design System
export const elevation = {
  level0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  level2: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  level3: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  level4: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  level5: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  // Healthcare app specific elevations
  floatingCard: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  glassmorphism: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 16,
  },
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
  // Component specific
  button: 12,
  card: 16,
  modal: 20,
  fab: 28,
  // Healthcare app specific
  professional: 14,
  large: 24,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  // Healthcare app specific
  section: 24,
  component: 16,
  tight: 12,
  rhythm: (multiplier: number) => 8 * multiplier,
};

export const typography = {
  // Healthcare app typography scale
  displayLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600' as const,
    letterSpacing: -0.25,
  },
  displaySmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  titleLarge: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
};

export const gradients = {
  primary: ['#3B82F6', '#2563EB'],
  secondary: ['#60A5FA', '#3B82F6'],
  accent: ['#1E40AF', '#1D4ED8'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],
  // Healthcare app specific gradients
  professional: ['#3B82F6', '#1E40AF'],
  glass: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'],
  overlay: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)'],
};

export const animation = {
  // Healthcare app animation timings
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,
  // Easing
  easeOut: 'ease-out',
  easeIn: 'ease-in',
  easeInOut: 'ease-in-out',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Updated interface to include new properties
export interface MD3Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  rhythm: (multiplier: number) => number;
}

export interface MD3Elevation {
  level0: any;
  level1: any;
  level2: any;
  level3: any;
  level4: any;
  level5: any;
  glassmorphism: any;
  floatingCard: any;
}

export interface MD3Theme {
  colors: MD3ColorScheme;
  typography: MD3Typography;
  spacing: MD3Spacing;
  elevation: MD3Elevation;
}

export const createMD3Theme = (isDark: boolean): MD3Theme => ({
  colors: isDark ? darkColorScheme : lightColorScheme,
  typography,
  spacing,
  elevation,
}); 