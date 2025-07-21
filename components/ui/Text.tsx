import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { typography, MD3Typography } from './MD3Theme';
import { useTheme } from '../../contexts/ThemeContext';

export interface TextProps extends RNTextProps {
  variant?: keyof MD3Typography;
  color?: string;
  fontSize?: number;
  fontWeight?: '400' | '500' | '600' | '700';
  textAlign?: TextStyle['textAlign'];
  children?: React.ReactNode;
  flex?: number;
  marginTop?: string;
}

export const Text: React.FC<TextProps> = ({
  variant = 'bodyMedium',
  color,
  fontSize,
  fontWeight,
  textAlign,
  flex,
  marginTop,
  style,
  children,
  ...props
}) => {
  const { isDark, colors } = useTheme();
  
  const variantStyle = typography[variant];
  
  const textStyle: TextStyle = {
    fontSize: fontSize || variantStyle.fontSize,
    lineHeight: fontSize ? fontSize * 1.4 : variantStyle.lineHeight,
    fontWeight: fontWeight || variantStyle.fontWeight,
    letterSpacing: variantStyle.letterSpacing,
    color: color || colors.onSurface,
    ...(textAlign && { textAlign }),
    ...(flex !== undefined && { flex }),
    ...(marginTop && { marginTop: marginTop === 'xs' ? 4 : marginTop === 'sm' ? 8 : marginTop === 'md' ? 16 : marginTop === 'lg' ? 24 : marginTop === 'xl' ? 32 : 8 }),
  };

  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  );
}; 