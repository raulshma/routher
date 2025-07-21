import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { YStack, XStack, Button, Text, Card, Separator } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SavedRoute, VehicleType, WeatherPoint, RoutePoint } from '@/types';
import { StorageService } from '@/services/storageService';
import { RouteDirections } from '@/components/RouteDirections';
import { WeatherSegment } from '@/components/WeatherSegment';

export default function RouteDetailsScreen() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const [route, setRoute] = useState<SavedRoute | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'directions' | 'weather'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    loadRouteDetails();
  }, [routeId]);

  const loadRouteDetails = async () => {
    if (!routeId) {
      Alert.alert('Error', 'No route ID provided');
      router.back();
      return;
    }

    setIsLoading(true);
    try {
      const routes = await StorageService.getSavedRoutes();
      const foundRoute = routes.find(r => r.id === routeId);
      
      if (!foundRoute) {
        Alert.alert('Error', 'Route not found');
        router.back();
        return;
      }
      
      setRoute(foundRoute);
    } catch (error) {
      console.error('Error loading route details:', error);
      Alert.alert('Error', 'Failed to load route details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const getVehicleIcon = (vehicleType: VehicleType) => {
    const iconMap = {
      car: '🚗',
      bicycle: '🚴',
      walking: '🚶',
    };
    return iconMap[vehicleType] || '🚗';
  };

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleFavorite = async () => {
    if (!route) return;
    
    try {
      await StorageService.updateRoute(route.id, { isFavorite: !route.isFavorite });
      setRoute({ ...route, isFavorite: !route.isFavorite });
    } catch (error) {
      console.error('Error updating favorite status:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const shareRoute = () => {
    Alert.alert('Coming Soon', 'Route sharing will be implemented in a future update');
  };

  const exportRoute = () => {
    Alert.alert('Coming Soon', 'Route export will be implemented in a future update');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text fontSize="$4">Loading route details...</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  if (!route) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Route Not Found' }} />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text fontSize="$4">Route not found</Text>
          <Button onPress={() => router.back()} marginTop="$4">
            Go Back
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: route.name,
          headerRight: () => (
            <XStack space="$2">
              <Button
                size="$2"
                variant="outlined"
                onPress={toggleFavorite}
              >
                {route.isFavorite ? '⭐' : '☆'}
              </Button>
              <Button
                size="$2"
                variant="outlined"
                onPress={shareRoute}
              >
                📤
              </Button>
            </XStack>
          ),
        }}
      />
      
      <YStack flex={1}>
        {/* Tab Navigation */}
        <XStack backgroundColor="$background" borderBottomWidth={1} borderColor="$gray6">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'directions', label: 'Directions', icon: '🧭' },
            { key: 'weather', label: 'Weather', icon: '🌤️' },
          ].map((tab) => (
            <Button
              key={tab.key}
              flex={1}
              variant="outlined"
              backgroundColor={activeTab === tab.key ? '$blue2' : 'transparent'}
              borderColor={activeTab === tab.key ? '$blue7' : 'transparent'}
              borderBottomWidth={2}
              borderRadius={0}
              onPress={() => setActiveTab(tab.key as typeof activeTab)}
            >
              <YStack alignItems="center" space="$1">
                <Text fontSize="$4">{tab.icon}</Text>
                <Text 
                  fontSize="$2" 
                  color={activeTab === tab.key ? '$blue11' : '$gray11'}
                  fontWeight={activeTab === tab.key ? 'bold' : 'normal'}
                >
                  {tab.label}
                </Text>
              </YStack>
            </Button>
          ))}
        </XStack>

        {/* Tab Content */}
        <ScrollView style={{ flex: 1 }}>
          <YStack padding="$3" space="$3">
            {activeTab === 'overview' && (
              <>
                {/* Route Header */}
                <Card padding="$4" backgroundColor="$blue2">
                  <YStack space="$3">
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack flex={1}>
                        <XStack alignItems="center" space="$2">
                          <Text fontSize="$3">{getVehicleIcon(route.vehicleType)}</Text>
                          <Text fontSize="$6" fontWeight="bold">
                            {route.name}
                          </Text>
                        </XStack>
                        <Text fontSize="$3" color="$gray11">
                          Created {formatDate(route.createdAt)}
                        </Text>
                      </YStack>
                    </XStack>

                    {/* Key Metrics */}
                    <XStack justifyContent="space-around">
                      <YStack alignItems="center">
                        <Text fontSize="$5" fontWeight="bold">
                          {formatDistance(route.totalDistance)}
                        </Text>
                        <Text fontSize="$2" color="$gray11">
                          Distance
                        </Text>
                      </YStack>
                      <YStack alignItems="center">
                        <Text fontSize="$5" fontWeight="bold">
                          {formatDuration(route.totalDuration)}
                        </Text>
                        <Text fontSize="$2" color="$gray11">
                          Duration
                        </Text>
                      </YStack>
                      <YStack alignItems="center">
                        <Text fontSize="$5" fontWeight="bold">
                          {route.weatherPoints.length}
                        </Text>
                        <Text fontSize="$2" color="$gray11">
                          Weather Points
                        </Text>
                      </YStack>
                    </XStack>
                  </YStack>
                </Card>

                {/* Route Points */}
                <Card padding="$3">
                  <YStack space="$3">
                    <Text fontSize="$4" fontWeight="bold">
                      Route Points
                    </Text>
                    
                    <YStack space="$2">
                      <XStack alignItems="center" space="$3">
                        <Text fontSize="$4" color="$green9">📍</Text>
                        <YStack flex={1}>
                          <Text fontSize="$3" fontWeight="bold">Start</Text>
                          <Text fontSize="$2" color="$gray11" numberOfLines={2}>
                            {route.startPoint.address || 
                             `${route.startPoint.latitude.toFixed(4)}, ${route.startPoint.longitude.toFixed(4)}`}
                          </Text>
                        </YStack>
                      </XStack>
                      
                      <Separator borderColor="$gray4" />
                      
                      <XStack alignItems="center" space="$3">
                        <Text fontSize="$4" color="$red9">🎯</Text>
                        <YStack flex={1}>
                          <Text fontSize="$3" fontWeight="bold">Destination</Text>
                          <Text fontSize="$2" color="$gray11" numberOfLines={2}>
                            {route.endPoint.address || 
                             `${route.endPoint.latitude.toFixed(4)}, ${route.endPoint.longitude.toFixed(4)}`}
                          </Text>
                        </YStack>
                      </XStack>
                    </YStack>
                  </YStack>
                </Card>

                {/* Action Buttons */}
                <XStack space="$2">
                  <Button flex={1} backgroundColor="$blue7" onPress={() => router.push('/')}>
                    📍 Load to Map
                  </Button>
                  <Button flex={1} variant="outlined" onPress={exportRoute}>
                    📤 Export
                  </Button>
                </XStack>
              </>
            )}

            {activeTab === 'directions' && (
              <RouteDirections waypoints={route.waypoints} />
            )}

            {activeTab === 'weather' && (
              <WeatherSegment weatherPoints={route.weatherPoints} />
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 