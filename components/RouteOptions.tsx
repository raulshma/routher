import React from 'react';
import { YStack, XStack, Text, Button, Card, ScrollView } from 'tamagui';
import { RouteAlternative } from '@/services/routingService';

interface RouteOptionsProps {
  alternatives: RouteAlternative[];
  selectedRouteId?: string;
  onRouteSelect: (routeId: string, alternative: RouteAlternative) => void;
  onClose?: () => void;
}

export function RouteOptions({
  alternatives,
  selectedRouteId,
  onRouteSelect,
  onClose,
}: RouteOptionsProps) {
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${Math.round(meters / 1000 * 10) / 10}km`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getRouteIcon = (description: string) => {
    if (description.includes('Fastest')) return '🚀';
    if (description.includes('Shortest')) return '📏';
    if (description.includes('Alternative')) return '🔄';
    return '🛣️';
  };

  const getRouteColor = (routeId: string, isSelected: boolean) => {
    if (isSelected) return '$blue8';
    if (routeId === 'route-0') return '$blue6';
    if (routeId === 'route-1') return '$green6';
    if (routeId === 'route-2') return '$orange6';
    return '$gray6';
  };

  return (
    <YStack space="$3" padding="$3" backgroundColor="$background" borderRadius="$3">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$5" fontWeight="bold">
          Route Options ({alternatives.length})
        </Text>
        {onClose && (
          <Button size="$2" circular onPress={onClose}>
            ✕
          </Button>
        )}
      </XStack>

      {/* Route Cards */}
      <ScrollView maxHeight={300}>
        <YStack space="$2">
          {alternatives.map((alternative, index) => {
            const isSelected = selectedRouteId === alternative.id;
            const isRecommended = index === 0;
            
            return (
              <Card
                key={alternative.id}
                padding="$3"
                backgroundColor={isSelected ? '$blue2' : '$gray1'}
                borderColor={getRouteColor(alternative.id, isSelected)}
                borderWidth={isSelected ? 2 : 1}
                pressStyle={{ scale: 0.98 }}
                onPress={() => onRouteSelect(alternative.id, alternative)}
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack flex={1} space="$1">
                    <XStack alignItems="center" space="$2">
                      <Text fontSize="$1">
                        {getRouteIcon(alternative.description)}
                      </Text>
                      <Text fontSize="$4" fontWeight="bold">
                        {alternative.description}
                      </Text>
                      {isRecommended && (
                        <Text
                          fontSize="$2"
                          color="$blue11"
                          backgroundColor="$blue3"
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          borderRadius="$2"
                        >
                          Recommended
                        </Text>
                      )}
                    </XStack>
                    
                    <XStack space="$4">
                      <XStack alignItems="center" space="$1">
                        <Text fontSize="$2">⏱️</Text>
                        <Text fontSize="$3" color="$gray11">
                          {formatDuration(alternative.totalDuration)}
                        </Text>
                      </XStack>
                      
                      <XStack alignItems="center" space="$1">
                        <Text fontSize="$2">📏</Text>
                        <Text fontSize="$3" color="$gray11">
                          {formatDistance(alternative.totalDistance)}
                        </Text>
                      </XStack>
                    </XStack>

                    {/* Route comparison badges */}
                    {index > 0 && (
                      <XStack space="$2" flexWrap="wrap">
                        {alternative.totalDuration < alternatives[0].totalDuration && (
                          <Text
                            fontSize="$1"
                            color="$green11"
                            backgroundColor="$green2"
                            paddingHorizontal="$1"
                            borderRadius="$1"
                          >
                            Faster
                          </Text>
                        )}
                        {alternative.totalDistance < alternatives[0].totalDistance && (
                          <Text
                            fontSize="$1"
                            color="$blue11"
                            backgroundColor="$blue2"
                            paddingHorizontal="$1"
                            borderRadius="$1"
                          >
                            Shorter
                          </Text>
                        )}
                      </XStack>
                    )}
                  </YStack>

                  {/* Selection indicator */}
                  <YStack alignItems="center" justifyContent="center">
                    {isSelected ? (
                      <Text fontSize="$4" color="$blue11">
                        ✓
                      </Text>
                    ) : (
                      <Text fontSize="$4" color="$gray8">
                        ○
                      </Text>
                    )}
                  </YStack>
                </XStack>
              </Card>
            );
          })}
        </YStack>
      </ScrollView>

      {/* Compare Info */}
      {alternatives.length > 1 && (
        <YStack space="$2" padding="$2" backgroundColor="$gray1" borderRadius="$2">
          <Text fontSize="$3" fontWeight="bold" textAlign="center">
            Route Comparison
          </Text>
          <XStack justifyContent="space-around">
            <YStack alignItems="center">
              <Text fontSize="$2" color="$gray11">
                Fastest
              </Text>
              <Text fontSize="$3" fontWeight="bold">
                {formatDuration(Math.min(...alternatives.map(a => a.totalDuration)))}
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize="$2" color="$gray11">
                Shortest
              </Text>
              <Text fontSize="$3" fontWeight="bold">
                {formatDistance(Math.min(...alternatives.map(a => a.totalDistance)))}
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize="$2" color="$gray11">
                Options
              </Text>
              <Text fontSize="$3" fontWeight="bold">
                {alternatives.length}
              </Text>
            </YStack>
          </XStack>
        </YStack>
      )}

      {/* Help text */}
      <Text fontSize="$2" color="$gray10" textAlign="center">
        Tap a route to view it on the map
      </Text>
    </YStack>
  );
} 