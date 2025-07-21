import React, { useState } from 'react';
import { Modal, Pressable } from 'react-native';
import { Card, Text, YStack, XStack, Button, ScrollView } from './ui';
import { VehicleType, RouteOptions as RouteOptionsType } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getFontSize, getSpacingKey, getFontWeight, getButtonSize } from '../constants/UISizes';

interface RouteOptionsProps {
  isVisible: boolean;
  onClose: () => void;
  onOptionsChange: (options: RouteOptionsType) => void;
  currentOptions: RouteOptionsType;
}

const VEHICLE_OPTIONS: Array<{ type: VehicleType; label: string; icon: string; description: string }> = [
  { type: 'driving', label: 'Car', icon: '🚗', description: 'Fastest route for cars' },
  { type: 'walking', label: 'Walking', icon: '🚶', description: 'Pedestrian paths and sidewalks' },
  { type: 'bicycle', label: 'Bicycle', icon: '🚴', description: 'Bike lanes and paths' },
];

const ROUTE_TYPES = [
  { key: 'fastest', label: 'Fastest', description: 'Minimum travel time' },
  { key: 'shortest', label: 'Shortest', description: 'Minimum distance' },
  { key: 'balanced', label: 'Balanced', description: 'Balance of time and distance' },
];

export const RouteOptions: React.FC<RouteOptionsProps> = ({
  isVisible,
  onClose,
  onOptionsChange,
  currentOptions,
}) => {
  const { colors } = useTheme();
  const [tempOptions, setTempOptions] = useState<RouteOptionsType>(currentOptions);

  const handleSave = () => {
    onOptionsChange(tempOptions);
    onClose();
  };

  const handleReset = () => {
    const defaultOptions: RouteOptionsType = {
      vehicle: 'driving',
      avoidHighways: false,
      avoidTolls: false,
      avoidFerries: false,
      routeType: 'fastest',
    };
    setTempOptions(defaultOptions);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <YStack 
        flex={1} 
        backgroundColor="rgba(0,0,0,0.5)" 
        justifyContent="flex-end"
      >
        <Card
          backgroundColor={colors.surface}
          style={{
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '90%',
          }}
        >
          <YStack space="md" padding={16} style={{ borderRadius: 12 }}>
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={getFontSize('$5')} fontWeight={getFontWeight('700')}>
                Route Options
              </Text>
              
              <Button size={getButtonSize('$2')} variant="outlined" onPress={onClose}>
                ✕
              </Button>
            </XStack>

            {/* Content */}
            <ScrollView style={{ maxHeight: 300 }}>
              <YStack space="sm">
                {/* Vehicle Selection */}
                <Card 
                  padding={16}
                  backgroundColor={colors.surfaceContainer}
                >
                  <YStack space="sm">
                    <YStack flex={1} space="xs">
                      <XStack alignItems="center" space="sm">
                        <Text fontSize={getFontSize('$1')}>
                          🚗
                        </Text>
                        <Text fontSize={getFontSize('$4')} fontWeight={getFontWeight('700')}>
                          Vehicle Type
                        </Text>
                      </XStack>
                      
                      {tempOptions.vehicle && (
                        <Text 
                          fontSize={getFontSize('$2')}
                          color={colors.onSurfaceVariant}
                        >
                          Selected: {VEHICLE_OPTIONS.find(v => v.type === tempOptions.vehicle)?.label}
                        </Text>
                      )}
                    </YStack>

                    {/* Vehicle Options */}
                    <XStack space="lg">
                      {VEHICLE_OPTIONS.map((vehicle) => (
                        <Pressable
                          key={vehicle.type}
                          onPress={() => setTempOptions((prev: RouteOptionsType) => ({ ...prev, vehicle: vehicle.type }))}
                          style={{ flex: 1 }}
                        >
                          <XStack alignItems="center" space="xs">
                            <Text fontSize={getFontSize('$2')}>⏱️</Text>
                            <Text fontSize={getFontSize('$3')} color={colors.onSurfaceVariant}>
                              {vehicle.description}
                            </Text>
                          </XStack>
                          
                          <XStack alignItems="center" space="xs">
                            <Text fontSize={getFontSize('$2')}>📏</Text>
                            <Text fontSize={getFontSize('$3')} color={colors.onSurfaceVariant}>
                              {vehicle.label}
                            </Text>
                          </XStack>
                        </Pressable>
                      ))}
                    </XStack>

                    {/* Avoidance Options */}
                    <XStack space="sm" style={{ flexWrap: 'wrap' }}>
                      {[
                        { key: 'avoidHighways', label: '🛣️ Avoid Highways' },
                        { key: 'avoidTolls', label: '💰 Avoid Tolls' },
                        { key: 'avoidFerries', label: '⛴️ Avoid Ferries' },
                      ].map((option) => (
                        <Pressable
                          key={option.key}
                                                     onPress={() => setTempOptions((prev: RouteOptionsType) => ({
                             ...prev,
                             [option.key]: !prev[option.key as keyof RouteOptionsType]
                           }))}
                          style={{
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor: tempOptions[option.key as keyof RouteOptionsType] 
                              ? colors.primaryContainer 
                              : colors.surfaceVariant,
                            marginBottom: 8,
                            marginRight: 8,
                          }}
                        >
                          <Text 
                            fontSize={getFontSize('$1')}
                            color={tempOptions[option.key as keyof RouteOptionsType] 
                              ? colors.onPrimaryContainer 
                              : colors.onSurfaceVariant
                            }
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      ))}
                    </XStack>

                    {/* Route Type Priority */}
                    <Text fontSize={getFontSize('$4')} color={colors.primary}>
                      Route Priority
                    </Text>
                    {!tempOptions.routeType && (
                      <Text fontSize={getFontSize('$4')} color={colors.onSurface}>
                        No route type selected
                      </Text>
                    )}
                  </YStack>
                </Card>

                {/* Route Type Selection */}
                <YStack space="sm" padding={8} backgroundColor={colors.surfaceContainer} style={{ borderRadius: 8 }}>
                  <Text fontSize={getFontSize('$3')} fontWeight={getFontWeight('700')} textAlign="center">
                    Route Optimization
                  </Text>
                  
                  {ROUTE_TYPES.map((type) => (
                    <XStack key={type.key} justifyContent="space-between" alignItems="center">
                      <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>
                        {type.label}
                      </Text>
                      <Text fontSize={getFontSize('$3')} fontWeight={getFontWeight('700')}>
                        {type.description}
                      </Text>
                    </XStack>
                  ))}
                  
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>
                      Current Selection
                    </Text>
                    <Text fontSize={getFontSize('$3')} fontWeight={getFontWeight('700')}>
                      {ROUTE_TYPES.find(t => t.key === tempOptions.routeType)?.label || 'None'}
                    </Text>
                  </XStack>
                  
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>
                      Description
                    </Text>
                    <Text fontSize={getFontSize('$3')} fontWeight={getFontWeight('700')}>
                      {ROUTE_TYPES.find(t => t.key === tempOptions.routeType)?.description || 'No description'}
                    </Text>
                  </XStack>
                </YStack>
              </YStack>
            </ScrollView>

            {/* Footer Actions */}
            <Text fontSize={getFontSize('$2')} color={colors.onSurface} textAlign="center">
              Tap Save to apply changes or Reset to restore defaults
            </Text>
          </YStack>
        </Card>
      </YStack>
    </Modal>
  );
}; 