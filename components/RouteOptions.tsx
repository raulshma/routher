import React, { useMemo, useCallback } from 'react';
import { YStack, XStack, Text, Button, Card, ScrollView } from 'tamagui';
import { RouteAlternative } from '@/services/routingService';

interface RouteOptionsProps {
  alternatives: RouteAlternative[];
  selectedRouteId?: string;
  onRouteSelect: (routeId: string, alternative: RouteAlternative) => void;
  onClose?: () => void;
}

const RouteOptions = React.memo(({
  alternatives,
  selectedRouteId,
  onRouteSelect,
  onClose,
}: RouteOptionsProps) => {
  const formatDistance = useCallback((meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${Math.round(meters / 1000 * 10) / 10}km`;
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  const getRouteIcon = useCallback((description: string) => {
    if (description.includes('Fastest')) return '🚀';
    if (description.includes('Shortest')) return '📏';
    if (description.includes('Alternative')) return '🔄';
    return '🛣️';
  }, []);

  const getRouteColor = useCallback((routeId: string, isSelected: boolean) => {
    if (isSelected) return '$blue8';
    if (routeId === 'route-0') return '$blue6';
    if (routeId === 'route-1') return '$green6';
    if (routeId === 'route-2') return '$orange6';
    return '$gray6';
  }, []);

  // Memoized route comparison stats
  const routeStats = useMemo(() => {
    if (alternatives.length === 0) return null;
    
    return {
      fastestDuration: Math.min(...alternatives.map(a => a.totalDuration)),
      shortestDistance: Math.min(...alternatives.map(a => a.totalDistance)),
      count: alternatives.length,
    };
  }, [alternatives]);

  // Memoized route cards data
  const routeCards = useMemo(() => {
    return alternatives.map((alternative, index) => {
      const isSelected = selectedRouteId === alternative.id;
      const isRecommended = index === 0;
      
      return {
        ...alternative,
        isSelected,
        isRecommended,
        formattedDistance: formatDistance(alternative.totalDistance),
        formattedDuration: formatDuration(alternative.totalDuration),
        icon: getRouteIcon(alternative.description),
        borderColor: getRouteColor(alternative.id, isSelected),
        isFaster: alternative.totalDuration < alternatives[0].totalDuration,
        isShorter: alternative.totalDistance < alternatives[0].totalDistance,
      };
    });
  }, [alternatives, selectedRouteId, formatDistance, formatDuration, getRouteIcon, getRouteColor]);

  const handleRouteSelect = useCallback((routeId: string, alternative: RouteAlternative) => {
    onRouteSelect(routeId, alternative);
  }, [onRouteSelect]);

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
          {routeCards.map((route) => (
            <Card
              key={route.id}
              padding="$3"
              backgroundColor={route.isSelected ? '$blue2' : '$gray1'}
              borderColor={route.borderColor}
              borderWidth={route.isSelected ? 2 : 1}
              pressStyle={{ scale: 0.98 }}
              onPress={() => handleRouteSelect(route.id, route)}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <YStack flex={1} space="$1">
                  <XStack alignItems="center" space="$2">
                    <Text fontSize="$1">
                      {route.icon}
                    </Text>
                    <Text fontSize="$4" fontWeight="bold">
                      {route.description}
                    </Text>
                    {route.isRecommended && (
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
                        {route.formattedDuration}
                      </Text>
                    </XStack>
                    
                    <XStack alignItems="center" space="$1">
                      <Text fontSize="$2">📏</Text>
                      <Text fontSize="$3" color="$gray11">
                        {route.formattedDistance}
                      </Text>
                    </XStack>
                  </XStack>

                  {/* Route comparison badges */}
                  {(route.isFaster || route.isShorter) && (
                    <XStack space="$2" flexWrap="wrap">
                      {route.isFaster && (
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
                      {route.isShorter && (
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
                  {route.isSelected ? (
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
          ))}
        </YStack>
      </ScrollView>

      {/* Compare Info */}
      {routeStats && (
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
                {formatDuration(routeStats.fastestDuration)}
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize="$2" color="$gray11">
                Shortest
              </Text>
              <Text fontSize="$3" fontWeight="bold">
                {formatDistance(routeStats.shortestDistance)}
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize="$2" color="$gray11">
                Options
              </Text>
              <Text fontSize="$3" fontWeight="bold">
                {routeStats.count}
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
});

RouteOptions.displayName = 'RouteOptions';

export { RouteOptions }; 