import React from 'react';
import { Pressable } from 'react-native';
import { Card, Text, YStack, XStack } from './ui';
import { RouteAlternative } from '../services/routingService';
import { useTheme } from '../contexts/ThemeContext';
import { getFontSize, getFontWeight } from '../constants/UISizes';

interface RouteAlternativesProps {
  alternatives: RouteAlternative[];
  selectedRouteId: string;
  onRouteSelect: (routeId: string, alternative: RouteAlternative) => void;
}

export const RouteAlternatives: React.FC<RouteAlternativesProps> = ({
  alternatives,
  selectedRouteId,
  onRouteSelect,
}) => {
  const { colors } = useTheme();

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (alternatives.length === 0) {
    return null;
  }

  return (
    <YStack space="sm">
      <Text fontSize={getFontSize('$4')} fontWeight={getFontWeight('700')}>
        Route Options ({alternatives.length})
      </Text>
      
      {alternatives.map((alternative, index) => (
        <Card
          key={alternative.id}
          padding={16}
          backgroundColor={selectedRouteId === alternative.id ? colors.primaryContainer : colors.surface}
          style={{
            borderWidth: selectedRouteId === alternative.id ? 2 : 1,
            borderColor: selectedRouteId === alternative.id ? colors.primary : colors.outline,
          }}
        >
          <Pressable
            onPress={() => onRouteSelect(alternative.id, alternative)}
            style={{ flex: 1 }}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <YStack flex={1} space="xs">
                <XStack alignItems="center" space="sm">
                  <Text fontSize={getFontSize('$3')} fontWeight={getFontWeight('700')}>
                    {alternative.description || `Route ${index + 1}`}
                  </Text>
                  {index === 0 && (
                    <Text 
                      fontSize={getFontSize('$1')} 
                      color={colors.primary}
                      style={{
                        backgroundColor: colors.primaryContainer,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 12,
                      }}
                    >
                      Recommended
                    </Text>
                  )}
                </XStack>
                
                <XStack space="lg">
                  <XStack alignItems="center" space="xs">
                    <Text fontSize={getFontSize('$2')}>⏱️</Text>
                    <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>
                      {formatDuration(alternative.totalDuration)}
                    </Text>
                  </XStack>
                  
                  <XStack alignItems="center" space="xs">
                    <Text fontSize={getFontSize('$2')}>📏</Text>
                    <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>
                      {formatDistance(alternative.totalDistance)}
                    </Text>
                  </XStack>
                </XStack>
              </YStack>
              
              {/* Selection indicator */}
              <Text fontSize={getFontSize('$4')} color={selectedRouteId === alternative.id ? colors.primary : colors.onSurface}>
                {selectedRouteId === alternative.id ? '✓' : '○'}
              </Text>
            </XStack>
          </Pressable>
        </Card>
      ))}
      
      <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant} textAlign="center">
        Tap a route to view it on the map
      </Text>
    </YStack>
  );
}; 