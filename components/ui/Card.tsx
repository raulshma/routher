import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { elevation } from './MD3Theme';
import { useTheme } from '../../contexts/ThemeContext';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'filled' | 'outlined';
  padding?: number;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 16,
  backgroundColor,
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: backgroundColor || colors.surfaceContainerHighest,
          ...elevation.level0,
        };
      case 'outlined':
        return {
          backgroundColor: backgroundColor || colors.surface,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
          ...elevation.level0,
        };
      default: // elevated
        return {
          backgroundColor: backgroundColor || colors.surfaceContainerLow,
          ...elevation.level1,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const cardStyle: ViewStyle = {
    borderRadius: 12,
    padding,
    ...variantStyles,
  };

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
}; 