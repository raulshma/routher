import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, XStack, YStack, Text } from 'tamagui';
import { VehicleType } from '@/types';

interface VehicleSelectorProps {
  selectedVehicle: VehicleType;
  onVehicleSelect: (vehicle: VehicleType) => void;
}

export function VehicleSelector({ selectedVehicle, onVehicleSelect }: VehicleSelectorProps) {
  const vehicles: { type: VehicleType; label: string; icon: string }[] = [
    { type: 'car', label: 'Car', icon: '🚗' },
    { type: 'bicycle', label: 'Bicycle', icon: '🚴' },
    { type: 'walking', label: 'Walking', icon: '🚶' },
  ];

  return (
    <YStack space="$2" padding="$3">
      <Text fontSize="$4" fontWeight="bold" textAlign="center">
        Select Vehicle Type
      </Text>
      <XStack space="$2" justifyContent="center">
        {vehicles.map((vehicle) => (
          <Button
            key={vehicle.type}
            flex={1}
            variant={selectedVehicle === vehicle.type ? 'outlined' : 'outlined'}
            backgroundColor={selectedVehicle === vehicle.type ? '$blue5' : 'transparent'}
            borderColor={selectedVehicle === vehicle.type ? '$blue7' : '$gray7'}
            onPress={() => onVehicleSelect(vehicle.type)}
            style={styles.vehicleButton}
          >
            <YStack alignItems="center" space="$1">
              <Text fontSize="$6">{vehicle.icon}</Text>
              <Text 
                fontSize="$2" 
                color={selectedVehicle === vehicle.type ? '$blue11' : '$gray11'}
                fontWeight={selectedVehicle === vehicle.type ? 'bold' : 'normal'}
              >
                {vehicle.label}
              </Text>
            </YStack>
          </Button>
        ))}
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  vehicleButton: {
    minHeight: 80,
  },
}); 