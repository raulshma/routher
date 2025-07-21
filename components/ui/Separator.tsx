import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export interface SeparatorProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  margin?: number;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  thickness = 1,
  color,
  margin = 0,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const separatorStyle: ViewStyle = {
    backgroundColor: color || colors.outlineVariant,
    ...(orientation === 'horizontal'
      ? {
          height: thickness,
          width: '100%',
          marginVertical: margin,
        }
      : {
          width: thickness,
          height: '100%',
          marginHorizontal: margin,
        }),
  };

  return <View style={[separatorStyle, style]} {...props} />;
}; 