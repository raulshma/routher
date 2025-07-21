import React from 'react';
import { Pressable } from 'react-native';
import { Card, Text, YStack, XStack } from './ui';
import { RoutePoint } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getFontSize, getSpacingKey, getFontWeight } from '../constants/UISizes';

interface RouteDirectionsProps {
  routePoints: RoutePoint[];
  onWaypointSelect?: (index: number) => void;
  selectedIndex?: number;
  showCoordinates?: boolean;
}

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

export const RouteDirections: React.FC<RouteDirectionsProps> = ({
  routePoints,
  onWaypointSelect,
  selectedIndex,
  showCoordinates = false,
}) => {
  const { colors } = useTheme();

  if (routePoints.length === 0) {
    return (
      <Card padding={16} backgroundColor={colors.surface}>
        <YStack space="md">
          <Text fontSize={getFontSize('$4')} fontWeight={getFontWeight('600')} color={colors.primary}>
            No Route Available
          </Text>
          <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>
            Please calculate a route to see turn-by-turn directions.
          </Text>
        </YStack>
      </Card>
    );
  }

  // Filter to show only waypoints with instructions or significant points
  const significantWaypoints = routePoints.filter((point, index) => 
    point.instructions || 
    index === 0 || 
    index === routePoints.length - 1 ||
    (point.distance !== undefined && point.distance > 500) // Show waypoints every 500m+
  );

  return (
    <YStack space="md">
      {/* Header */}
      <Text fontSize={getFontSize('$5')} fontWeight={getFontWeight('600')} color={colors.primary}>
        Route Directions ({significantWaypoints.length} steps)
      </Text>

      {/* Summary Card */}
      <Card padding={16} backgroundColor={colors.primaryContainer}>
        <YStack space="sm">
          <Text fontSize={getFontSize('$4')} fontWeight={getFontWeight('700')}>
            Route Summary
          </Text>
          
          <XStack space="lg">
            <XStack alignItems="center" space="xs">
              <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>📏</Text>
              <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>
                {formatDistance(routePoints[routePoints.length - 1]?.distance || 0)}
              </Text>
            </XStack>
            
            <XStack alignItems="center" space="xs">
              <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>⏱️</Text>
              <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>
                {formatDuration(routePoints[routePoints.length - 1]?.duration || 0)}
              </Text>
            </XStack>
          </XStack>

          {/* Coordinates for reference */}
          {showCoordinates && (
            <Text fontSize={getFontSize('$1')} color={colors.onSurface}>
              Start: {routePoints[0]?.location.latitude.toFixed(6)}, {routePoints[0]?.location.longitude.toFixed(6)}
            </Text>
          )}
        </YStack>
      </Card>

      {/* Direction Steps */}
      {significantWaypoints.map((waypoint, index) => (
        <Card 
          key={index} 
          padding={16} 
          backgroundColor={selectedIndex === index ? colors.primaryContainer : colors.surface}
          style={{
            borderWidth: selectedIndex === index ? 2 : 1,
            borderColor: selectedIndex === index ? colors.primary : colors.outline,
          }}
        >
          <Pressable
            onPress={() => onWaypointSelect?.(index)}
            style={{ flex: 1 }}
          >
            <XStack space="md" alignItems="flex-start">
              {/* Step Number */}
              <YStack
                width={32}
                height={32}
                backgroundColor={colors.primary}
                borderRadius={16}
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={getFontSize('$2')} color="white" fontWeight={getFontWeight('700')}>
                  {index + 1}
                </Text>
              </YStack>

              {/* Step Details */}
              <YStack flex={1} space="xs">
                <Text fontSize={getFontSize('$4')} fontWeight={getFontWeight('600')}>
                  {waypoint.instructions || `Step ${index + 1}`}
                </Text>
                
                <XStack space="lg">
                  {waypoint.distance !== undefined && waypoint.distance > 0 && (
                    <XStack alignItems="center" space="xs">
                      <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>📏</Text>
                      <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>
                        {formatDistance(waypoint.distance)}
                      </Text>
                    </XStack>
                  )}
                  
                  {waypoint.duration !== undefined && waypoint.duration > 0 && (
                    <XStack alignItems="center" space="xs">
                      <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>⏱️</Text>
                      <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant}>
                        {formatDuration(waypoint.duration)}
                      </Text>
                    </XStack>
                  )}
                </XStack>

                {/* Coordinates for reference */}
                {showCoordinates && (
                  <Text fontSize={getFontSize('$1')} color={colors.onSurface}>
                    {waypoint.location.latitude.toFixed(6)}, {waypoint.location.longitude.toFixed(6)}
                  </Text>
                )}
              </YStack>
            </XStack>
          </Pressable>
        </Card>
      ))}
    </YStack>
  );
}; 