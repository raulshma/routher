import React from 'react';
import { ScrollView as RNScrollView, ScrollViewProps as RNScrollViewProps, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export interface ScrollViewProps extends RNScrollViewProps {
  children?: React.ReactNode;
  maxHeight?: number;
  maxWidth?: number;
  backgroundColor?: string;
}

export const ScrollView: React.FC<ScrollViewProps> = ({
  style,
  maxHeight,
  maxWidth,
  backgroundColor,
  children,
  ...props
}) => {
  const { colors } = useTheme();

  const scrollViewStyle: ViewStyle = {
    backgroundColor: backgroundColor || colors.background,
    ...(maxHeight !== undefined && { maxHeight }),
    ...(maxWidth !== undefined && { maxWidth }),
  };

  return (
    <RNScrollView
      style={[scrollViewStyle, style]}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      {...props}
    >
      {children}
    </RNScrollView>
  );
}; 