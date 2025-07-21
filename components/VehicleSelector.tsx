import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { YStack, XStack, Text, Button } from './ui';
import { VehicleType } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getFontSize, getSpacingKey, getFontWeight } from '../constants/UISizes';

interface VehicleSelectorProps {
  selectedVehicle: VehicleType;
  onVehicleSelect: (vehicle: VehicleType) => void;
}

const vehicleOptions = [
  { type: 'driving' as VehicleType, label: 'Car', icon: '🚗' },
  { type: 'bicycle' as VehicleType, label: 'Bike', icon: '🚴' },
  { type: 'walking' as VehicleType, label: 'Walk', icon: '🚶' },
];

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  selectedVehicle,
  onVehicleSelect,
}) => {
  const { colors } = useTheme();

  return (
    <YStack space="sm" padding={16}>
      <Text fontSize={getFontSize('$4')} fontWeight={getFontWeight('700')} textAlign="center">
        Select Transportation
      </Text>
      
      <XStack space="sm" justifyContent="center">
        {vehicleOptions.map((vehicle) => (
          <Pressable
            key={vehicle.type}
            onPress={() => onVehicleSelect(vehicle.type)}
            style={[
              {
                flex: 1,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selectedVehicle === vehicle.type ? colors.primary : colors.outline,
                backgroundColor: selectedVehicle === vehicle.type ? colors.primaryContainer : colors.surface,
                minHeight: 80,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 12,
              } as ViewStyle
            ]}
          >
            <YStack alignItems="center" space="xs">
              <Text fontSize={getFontSize('$6')}>{vehicle.icon}</Text>
              <Text 
                fontSize={getFontSize('$2')}
                color={selectedVehicle === vehicle.type ? colors.onPrimaryContainer : colors.onSurface}
                fontWeight={selectedVehicle === vehicle.type ? getFontWeight('700') : getFontWeight('400')}
                textAlign="center"
              >
                {vehicle.label}
              </Text>
            </YStack>
          </Pressable>
        ))}
      </XStack>
    </YStack>
  );
}; 