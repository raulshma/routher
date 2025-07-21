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

// Enhanced elevation with modern glassmorphism effects
export const elevation = {
  level0: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },
  level4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  level5: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },
  glassmorphism: {
    shadowColor: 'rgba(99, 102, 241, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  floatingCard: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Modern spacing system with consistent rhythm
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  rhythm: (multiplier: number) => 8 * multiplier, // 8px rhythm
};

// Enhanced border radius system
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 999,
  card: 16,
  button: 12,
  fab: 28,
  search: 24,
};

// Animation durations and easings
export const animations = {
  timing: {
    fast: 150,
    normal: 250,
    slow: 350,
    verySlow: 500,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

// Gradient definitions for modern UI
export const gradients = {
  primary: ['#6366F1', '#8B5CF6'],
  secondary: ['#10B981', '#059669'],
  tertiary: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],
  background: ['#FAFAFA', '#F9FAFB'],
  darkBackground: ['#0F0F0F', '#171717'],
  glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
  darkGlass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
  route: ['#6366F1', '#3B82F6'],
  weather: ['#0EA5E9', '#06B6D4'],
};

export const typography: MD3Typography = {
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '400',
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '400',
    letterSpacing: 0,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '400',
    letterSpacing: 0,
  },
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '400',
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '400',
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '400',
    letterSpacing: 0,
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
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