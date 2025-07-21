import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle, TextStyle, Animated } from 'react-native';
import { Text } from './Text';
import { elevation, borderRadius, gradients } from './MD3Theme';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  backgroundColor?: string;
  color?: string;
  flex?: number;
  circular?: boolean;
  pressStyle?: ViewStyle;
  gradient?: string[];
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  size = 'medium',
  children,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  backgroundColor,
  color,
  flex,
  circular = false,
  pressStyle,
  gradient,
  icon,
  loading = false,
  ...props
}) => {
  const { colors } = useTheme();

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          minHeight: 36,
          paddingHorizontal: 16,
          paddingVertical: 8,
        };
      case 'large':
        return {
          minHeight: 56,
          paddingHorizontal: 32,
          paddingVertical: 16,
        };
      default: // medium
        return {
          minHeight: 48,
          paddingHorizontal: 24,
          paddingVertical: 12,
        };
    }
  };

  const getVariantStyles = (): { containerStyle: ViewStyle; textColor: string } => {
    if (disabled) {
      return {
        containerStyle: {
          backgroundColor: colors.onSurface + '1F', // 12% opacity
          borderWidth: 0,
          ...elevation.level0,
        },
        textColor: colors.onSurface + '61', // 38% opacity
      };
    }

    switch (variant) {
      case 'filled':
        return {
          containerStyle: {
            backgroundColor: colors.primary,
            borderWidth: 0,
            ...elevation.level2,
          },
          textColor: colors.onPrimary,
        };
      case 'outlined':
        return {
          containerStyle: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.primary,
            ...elevation.level0,
          },
          textColor: colors.primary,
        };
      case 'text':
        return {
          containerStyle: {
            backgroundColor: 'transparent',
            borderWidth: 0,
            ...elevation.level0,
          },
          textColor: colors.primary,
        };
      case 'elevated':
        return {
          containerStyle: {
            backgroundColor: colors.surface,
            borderWidth: 0,
            ...elevation.floatingCard,
          },
          textColor: colors.primary,
        };
      case 'tonal':
        return {
          containerStyle: {
            backgroundColor: colors.primaryContainer,
            borderWidth: 0,
            ...elevation.level1,
          },
          textColor: colors.onPrimaryContainer,
        };
      case 'gradient':
        return {
          containerStyle: {
            borderWidth: 0,
            ...elevation.level3,
            overflow: 'hidden',
          },
          textColor: '#FFFFFF',
        };
      default:
        return {
          containerStyle: {
            backgroundColor: colors.primary,
            borderWidth: 0,
            ...elevation.level2,
          },
          textColor: colors.onPrimary,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const { containerStyle, textColor } = getVariantStyles();

  const buttonStyle: ViewStyle = {
    borderRadius: circular ? borderRadius.round : borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...(fullWidth && { width: '100%' }),
    ...(flex !== undefined && { flex }),
    ...(backgroundColor && { backgroundColor }),
    ...sizeStyles,
    ...containerStyle,
  };

  const contentJSX = (
    <>
      {icon && <Text style={{ marginRight: children ? 8 : 0 }}>{icon}</Text>}
      <Text
        variant="labelLarge"
        color={color || textColor}
        style={[{ fontWeight: '600' }, textStyle]}
      >
        {loading ? '...' : children}
      </Text>
    </>
  );

  if (variant === 'gradient') {
    const gradientColors = gradient || gradients.primary;
    return (
      <TouchableOpacity
        disabled={disabled || loading}
        activeOpacity={disabled ? 1 : 0.8}
        {...props}
      >
        <LinearGradient
          colors={gradientColors as any}
          style={[buttonStyle, style]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {contentJSX}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      disabled={disabled || loading}
      activeOpacity={disabled ? 1 : 0.8}
      {...props}
    >
      {contentJSX}
    </TouchableOpacity>
  );
}; 