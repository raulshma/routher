import React from 'react';
import { Switch as RNSwitch, SwitchProps as RNSwitchProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export interface SwitchProps extends RNSwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  value,
  onValueChange,
  ...props
}) => {
  const { colors } = useTheme();

  const handleValueChange = (newValue: boolean) => {
    if (onCheckedChange) {
      onCheckedChange(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <RNSwitch
      value={checked ?? value}
      onValueChange={handleValueChange}
      trackColor={{
        false: colors.surfaceContainerHighest,
        true: colors.primary,
      }}
      thumbColor={
        checked ?? value
          ? colors.onPrimary
          : colors.outline
      }
      ios_backgroundColor={colors.surfaceContainerHighest}
      {...props}
    />
  );
}; 