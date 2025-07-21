import React from 'react';
import { StyleSheet } from 'react-native';
import { YStack, XStack, Text, Card, Separator } from 'tamagui';
import { RoutePoint } from '@/types';

interface RouteDirectionsProps {
  waypoints: RoutePoint[];
}

export function RouteDirections({ waypoints }: RouteDirectionsProps) {
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${Math.round(meters / 1000 * 10) / 10}km`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const getDirectionIcon = (instruction: string) => {
    const lowerInstruction = instruction.toLowerCase();
    
    if (lowerInstruction.includes('left')) return '↰';
    if (lowerInstruction.includes('right')) return '↱';
    if (lowerInstruction.includes('straight') || lowerInstruction.includes('continue')) return '↑';
    if (lowerInstruction.includes('start')) return '🏁';
    if (lowerInstruction.includes('arrive') || lowerInstruction.includes('destination')) return '🎯';
    if (lowerInstruction.includes('roundabout')) return '⭕';
    if (lowerInstruction.includes('exit')) return '🛣️';
    
    return '➡️';
  };

  if (!waypoints || waypoints.length === 0) {
    return (
      <Card padding="$4" backgroundColor="$gray2">
        <YStack alignItems="center" space="$3">
          <Text fontSize="$6">🧭</Text>
          <Text fontSize="$4" fontWeight="bold" textAlign="center">
            No Directions Available
          </Text>
          <Text fontSize="$3" color="$gray11" textAlign="center">
            Turn-by-turn directions are not available for this route.
          </Text>
        </YStack>
      </Card>
    );
  }

  return (
    <YStack space="$3">
      <Text fontSize="$5" fontWeight="bold">
        Turn-by-Turn Directions
      </Text>
      
      {waypoints.map((waypoint, index) => (
        <React.Fragment key={index}>
          <Card padding="$3" backgroundColor="$background">
            <XStack space="$3" alignItems="flex-start">
              {/* Step Number & Icon */}
              <YStack alignItems="center" minWidth={40}>
                <YStack
                  width={32}
                  height={32}
                  backgroundColor="$blue7"
                  borderRadius={16}
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="$2"
                >
                  <Text fontSize="$3" color="white" fontWeight="bold">
                    {index + 1}
                  </Text>
                </YStack>
                <Text fontSize="$4">
                  {getDirectionIcon(waypoint.instructions || '')}
                </Text>
              </YStack>

              {/* Direction Details */}
              <YStack flex={1} space="$2">
                <Text fontSize="$4" fontWeight="600">
                  {waypoint.instructions || `Step ${index + 1}`}
                </Text>
                
                <XStack space="$4">
                  {waypoint.distance !== undefined && waypoint.distance > 0 && (
                    <XStack alignItems="center" space="$1">
                      <Text fontSize="$2" color="$gray11">📏</Text>
                      <Text fontSize="$2" color="$gray11">
                        {formatDistance(waypoint.distance)}
                      </Text>
                    </XStack>
                  )}
                  
                  {waypoint.duration !== undefined && waypoint.duration > 0 && (
                    <XStack alignItems="center" space="$1">
                      <Text fontSize="$2" color="$gray11">⏱️</Text>
                      <Text fontSize="$2" color="$gray11">
                        {formatDuration(waypoint.duration)}
                      </Text>
                    </XStack>
                  )}
                </XStack>

                {/* Coordinates for reference */}
                <Text fontSize="$1" color="$gray9">
                  {waypoint.location.latitude.toFixed(6)}, {waypoint.location.longitude.toFixed(6)}
                </Text>
              </YStack>
            </XStack>
          </Card>
          
          {/* Connecting Line */}
          {index < waypoints.length - 1 && (
            <YStack alignItems="flex-start" paddingLeft={20}>
              <YStack
                width={2}
                height={20}
                backgroundColor="$gray7"
                marginLeft={15}
              />
            </YStack>
          )}
        </React.Fragment>
      ))}

      {/* Summary */}
      <Card padding="$3" backgroundColor="$blue2">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$4" fontWeight="bold">
            Total Journey
          </Text>
          <XStack space="$4">
            <Text fontSize="$3">
              📏 {formatDistance(waypoints.reduce((sum, wp) => sum + (wp.distance || 0), 0))}
            </Text>
            <Text fontSize="$3">
              ⏱️ {formatDuration(waypoints.reduce((sum, wp) => sum + (wp.duration || 0), 0))}
            </Text>
          </XStack>
        </XStack>
      </Card>
    </YStack>
  );
} 