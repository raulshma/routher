import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { Text } from './Text';
import { elevation } from './MD3Theme';
import { useTheme } from '../../contexts/ThemeContext';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
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
  ...props
}) => {
  const { colors } = useTheme();

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          minHeight: 32,
          paddingHorizontal: 12,
          paddingVertical: 6,
        };
      case 'large':
        return {
          minHeight: 48,
          paddingHorizontal: 24,
          paddingVertical: 12,
        };
      default: // medium
        return {
          minHeight: 40,
          paddingHorizontal: 16,
          paddingVertical: 8,
        };
    }
  };

  const getVariantStyles = (): { containerStyle: ViewStyle; textColor: string } => {
    if (disabled) {
      return {
        containerStyle: {
          backgroundColor: colors.onSurface + '1F', // 12% opacity
          borderWidth: 0,
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
            ...elevation.level0,
          },
          textColor: colors.onPrimary,
        };
      case 'outlined':
        return {
          containerStyle: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.outline,
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
            ...elevation.level1,
          },
          textColor: colors.primary,
        };
      case 'tonal':
        return {
          containerStyle: {
            backgroundColor: colors.secondaryContainer,
            borderWidth: 0,
            ...elevation.level0,
          },
          textColor: colors.onSecondaryContainer,
        };
      default:
        return {
          containerStyle: {
            backgroundColor: colors.primary,
            borderWidth: 0,
            ...elevation.level0,
          },
          textColor: colors.onPrimary,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const { containerStyle, textColor } = getVariantStyles();

  const buttonStyle: ViewStyle = {
    borderRadius: circular ? 999 : 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...(fullWidth && { width: '100%' }),
    ...(flex !== undefined && { flex }),
    ...(backgroundColor && { backgroundColor }),
    ...sizeStyles,
    ...containerStyle,
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
      {...props}
    >
      <Text
        variant="labelLarge"
        color={color || textColor}
        style={textStyle}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}; 