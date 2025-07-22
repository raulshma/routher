import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { elevation, borderRadius, gradients } from './MD3Theme';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'filled' | 'outlined' | 'glass' | 'gradient';
  padding?: number;
  backgroundColor?: string;
  children?: React.ReactNode;
  gradient?: string[];
  glassmorphism?: boolean;
  borderRadius?: number;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 16,
  backgroundColor,
  gradient,
  glassmorphism = false,
  borderRadius: customBorderRadius,
  style,
  children,
  ...props
}) => {
  const { colors, isDark } = useTheme();

  const getVariantStyles = (): ViewStyle => {
    const baseRadius = customBorderRadius !== undefined ? customBorderRadius : borderRadius.card;
    
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: backgroundColor || colors.surfaceContainerHighest,
          borderRadius: baseRadius,
          ...elevation.level0,
        };
      case 'outlined':
        return {
          backgroundColor: backgroundColor || colors.surface,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
          borderRadius: baseRadius,
          ...elevation.level0,
        };
      case 'glass':
        return {
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(255, 255, 255, 0.7)',
          borderRadius: baseRadius,
          borderWidth: 1,
          borderColor: isDark 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(255, 255, 255, 0.2)',
          ...elevation.glassmorphism,
          // Backdrop blur effect would be added here with react-native-blur if available
        };
      case 'gradient':
        return {
          borderRadius: baseRadius,
          ...elevation.level2,
          overflow: 'hidden',
        };
      default: // elevated
        return {
          backgroundColor: backgroundColor || colors.surfaceContainerLow,
          borderRadius: baseRadius,
          ...elevation.floatingCard,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const cardStyle: ViewStyle = {
    padding,
    ...variantStyles,
  };

  if (variant === 'gradient' && gradient) {
    return (
      <LinearGradient
        colors={gradient as unknown as readonly [string, string, ...string[]]}
        style={[cardStyle, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
}; 