// UI Size and Token Mappings
export const FONT_SIZES = {
  '$1': 10,
  '$2': 12,
  '$3': 14,
  '$4': 16,
  '$5': 20,
  '$6': 24,
} as const;

export const SPACING_VALUES = {
  '$1': 4,
  '$2': 8,
  '$3': 16,
  '$4': 24,
  '$5': 32,
  '$6': 48,
} as const;

export const SPACING_KEYS = {
  'xs': 4,
  'sm': 8,
  'md': 16,
  'lg': 24,
  'xl': 32,
  'xxl': 48,
} as const;

export const FONT_WEIGHTS = {
  'normal': '400',
  'bold': '700',
} as const;

export const BUTTON_SIZES = {
  '$1': 'small',
  '$2': 'medium', 
  '$3': 'large',
} as const;

// Helper functions
export const getFontSize = (token: string): number => {
  return FONT_SIZES[token as keyof typeof FONT_SIZES] || 14;
};

export const getSpacing = (token: string): number => {
  return SPACING_VALUES[token as keyof typeof SPACING_VALUES] || 16;
};

export const getSpacingKey = (token: string): keyof typeof SPACING_KEYS => {
  const mapping: Record<string, keyof typeof SPACING_KEYS> = {
    '$1': 'xs',
    '$2': 'sm', 
    '$3': 'md',
    '$4': 'lg',
    '$5': 'xl',
    '$6': 'xxl',
  };
  return mapping[token] || 'md';
};

export const getFontWeight = (weight: string): '400' | '500' | '600' | '700' => {
  if (weight === 'bold') return '700';
  if (weight === 'normal') return '400';
  return weight as '400' | '500' | '600' | '700';
};

export const getButtonSize = (token: string): 'small' | 'medium' | 'large' => {
  return BUTTON_SIZES[token as keyof typeof BUTTON_SIZES] || 'medium';
}; 