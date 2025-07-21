import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { YStack, XStack } from './Stack';
import { useTheme } from '../../contexts/ThemeContext';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  direction?: 'vertical' | 'horizontal';
  spacing?: number;
  containerStyle?: ViewStyle;
}

export interface RadioButtonProps {
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
  label: string;
  description?: string;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  selected,
  disabled = false,
  onPress,
  label,
  description,
}) => {
  const { colors } = useTheme();

  const radioStyle: ViewStyle = {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: disabled
      ? colors.onSurface + '61' // 38% opacity
      : selected
      ? colors.primary
      : colors.onSurfaceVariant,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const innerCircleStyle: ViewStyle = {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: disabled
      ? colors.onSurface + '61' // 38% opacity
      : colors.primary,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{ opacity: disabled ? 0.6 : 1 }}
      activeOpacity={0.7}
    >
      <XStack alignItems="flex-start" space="sm">
        <View style={radioStyle}>
          {selected && <View style={innerCircleStyle} />}
        </View>
        <YStack flex={1}>
          <Text
            variant="bodyMedium"
            color={disabled ? colors.onSurface + '61' : colors.onSurface}
          >
            {label}
          </Text>
          {description && (
            <Text
              variant="bodySmall"
              color={disabled ? colors.onSurface + '61' : colors.onSurfaceVariant}
              style={{ marginTop: 2 }}
            >
              {description}
            </Text>
          )}
        </YStack>
      </XStack>
    </TouchableOpacity>
  );
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onValueChange,
  direction = 'vertical',
  spacing = 16,
  containerStyle,
}) => {
  const StackComponent = direction === 'vertical' ? YStack : XStack;

  return (
    <StackComponent space={spacing} style={containerStyle}>
      {options.map((option) => (
        <RadioButton
          key={option.value}
          selected={value === option.value}
          disabled={option.disabled}
          onPress={() => onValueChange?.(option.value)}
          label={option.label}
          description={option.description}
        />
      ))}
    </StackComponent>
  );
}; 