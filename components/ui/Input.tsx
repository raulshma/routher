import React, { useState } from 'react';
import { TextInput, TextInputProps, View, ViewStyle, TextStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../../contexts/ThemeContext';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  containerStyle?: ViewStyle;
  flex?: number;
}

export const Input: React.FC<InputProps> = ({
  variant = 'outlined',
  size = 'medium',
  label,
  error,
  helperText,

  fullWidth = false,
  containerStyle,
  flex,
  style,
  value,
  placeholder,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 36,
          paddingHorizontal: 12,
          fontSize: 14,
        };
      case 'large':
        return {
          height: 56,
          paddingHorizontal: 16,
          fontSize: 16,
        };
      default: // medium
        return {
          height: 48,
          paddingHorizontal: 14,
          fontSize: 16,
        };
    }
  };

  const getVariantStyles = () => {
    const baseStyle = {
      borderRadius: variant === 'filled' ? 4 : 8,
    };

    if (variant === 'filled') {
      return {
        ...baseStyle,
        backgroundColor: colors.surfaceContainerHighest,
        borderBottomWidth: isFocused ? 2 : 1,
        borderBottomColor: error
          ? colors.error
          : isFocused
          ? colors.primary
          : colors.onSurfaceVariant,
      };
    }

    // outlined variant
    return {
      ...baseStyle,
      backgroundColor: 'transparent',
      borderWidth: isFocused ? 2 : 1,
      borderColor: error
        ? colors.error
        : isFocused
        ? colors.primary
        : colors.outline,
    };
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const inputStyle: TextStyle = {
    color: colors.onSurface,
    ...sizeStyles,
    ...variantStyles,
  };

  const containerStyles: ViewStyle = {
    ...(fullWidth && { width: '100%' }),
    ...(flex !== undefined && { flex }),
  };

  return (
    <View style={[containerStyles, containerStyle]}>
      {label && (
        <Text
          variant="bodySmall"
          color={error ? colors.error : colors.onSurfaceVariant}
          style={{ marginBottom: 4 }}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[inputStyle, style]}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {(error || helperText) && (
        <Text
          variant="bodySmall"
          color={error ? colors.error : colors.onSurfaceVariant}
          style={{ marginTop: 4 }}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
}; 