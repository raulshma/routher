import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Alert, RefreshControl } from 'react-native';
import { YStack, XStack, Button, Text, ScrollView, Card } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

import { SavedRoute, VehicleType } from '@/types';
import { StorageService } from '@/services/storageService';
import { useRoute } from '@/contexts/RouteContext';

export default function SavedRoutesScreen() {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setLoadedRoute } = useRoute();

  // Load saved routes when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSavedRoutes();
    }, [])
  );

  const loadSavedRoutes = async () => {
    setIsLoading(true);
    try {
      const routes = await StorageService.getSavedRoutes();
      setSavedRoutes(routes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error loading saved routes:', error);
      Alert.alert('Error', 'Failed to load saved routes.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRoute = async (routeId: string) => {
    Alert.alert(
      'Delete Route',
      'Are you sure you want to delete this route?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteRoute(routeId);
              await loadSavedRoutes();
              Alert.alert('Success', 'Route deleted successfully.');
            } catch (error) {
              console.error('Error deleting route:', error);
              Alert.alert('Error', 'Failed to delete route.');
            }
          },
        },
      ]
    );
  };

  const toggleFavorite = async (routeId: string, currentFavorite: boolean) => {
    try {
      await StorageService.updateRoute(routeId, { isFavorite: !currentFavorite });
      await loadSavedRoutes();
    } catch (error) {
      console.error('Error updating favorite status:', error);
      Alert.alert('Error', 'Failed to update favorite status.');
    }
  };

  const clearAllRoutes = () => {
    if (savedRoutes.length === 0) {
      Alert.alert('No Routes', 'There are no saved routes to clear.');
      return;
    }

    Alert.alert(
      'Clear All Routes',
      'Are you sure you want to delete all saved routes? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllRoutes();
              setSavedRoutes([]);
              Alert.alert('Success', 'All routes cleared successfully.');
            } catch (error) {
              console.error('Error clearing all routes:', error);
              Alert.alert('Error', 'Failed to clear all routes.');
            }
          },
        },
      ]
    );
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const loadRouteToMap = (route: SavedRoute) => {
    try {
      setLoadedRoute(route);
      router.push('/');
      Alert.alert('Route Loaded', `"${route.name}" has been loaded to the map!`);
    } catch (error) {
      console.error('Error loading route to map:', error);
      Alert.alert('Error', 'Failed to load route to map. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <YStack flex={1} padding="$3" space="$3">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" padding="$2">
          <Text fontSize="$6" fontWeight="bold">
            Saved Routes ({savedRoutes.length})
          </Text>
          <Button
            size="$2"
            variant="outlined"
            onPress={clearAllRoutes}
            disabled={savedRoutes.length === 0}
          >
            Clear All
          </Button>
        </XStack>

        {/* Routes List */}
        <ScrollView
          flex={1}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadSavedRoutes} />
          }
        >
          <YStack space="$3">
            {savedRoutes.length === 0 ? (
              <Card padding="$4" backgroundColor="$gray2">
                <YStack alignItems="center" space="$3">
                  <Text fontSize="$6">📋</Text>
                  <Text fontSize="$4" fontWeight="bold" textAlign="center">
                    No Saved Routes
                  </Text>
                  <Text fontSize="$3" color="$gray11" textAlign="center">
                    Routes you save will appear here. Go to the Route Planner tab to create and save your first route!
                  </Text>
                </YStack>
              </Card>
            ) : (
              savedRoutes.map((route) => (
                <Card key={route.id} padding="$3" backgroundColor="$background">
                  <YStack space="$2">
                    {/* Route Header */}
                    <XStack justifyContent="space-between" alignItems="center">
                      <XStack alignItems="center" space="$2" flex={1}>
                        <Text fontSize="$3">{getVehicleIcon(route.vehicleType)}</Text>
                        <Text fontSize="$4" fontWeight="bold" flex={1} numberOfLines={1}>
                          {route.name}
                        </Text>
                        <Button
                          size="$2"
                          variant="outlined"
                          onPress={() => toggleFavorite(route.id, route.isFavorite || false)}
                        >
                          {route.isFavorite ? '⭐' : '☆'}
                        </Button>
                      </XStack>
                    </XStack>

                    {/* Route Details */}
                    <YStack space="$1">
                      <Text fontSize="$2" color="$gray11" numberOfLines={1}>
                        📍 From: {route.startPoint.address || `${route.startPoint.latitude.toFixed(4)}, ${route.startPoint.longitude.toFixed(4)}`}
                      </Text>
                      <Text fontSize="$2" color="$gray11" numberOfLines={1}>
                        🎯 To: {route.endPoint.address || `${route.endPoint.latitude.toFixed(4)}, ${route.endPoint.longitude.toFixed(4)}`}
                      </Text>
                    </YStack>

                    {/* Route Stats */}
                    <XStack justifyContent="space-between" alignItems="center">
                      <XStack space="$3">
                        <Text fontSize="$2" color="$gray11">
                          📏 {formatDistance(route.totalDistance)}
                        </Text>
                        <Text fontSize="$2" color="$gray11">
                          ⏱️ {formatDuration(route.totalDuration)}
                        </Text>
                        <Text fontSize="$2" color="$gray11">
                          🌤️ {route.weatherPoints.length} points
                        </Text>
                      </XStack>
                      <Text fontSize="$1" color="$gray9">
                        {formatDate(route.createdAt)}
                      </Text>
                    </XStack>

                    {/* Action Buttons */}
                    <XStack space="$2" marginTop="$2">
                      <Button
                        flex={1}
                        size="$2"
                        backgroundColor="$blue7"
                        onPress={() => loadRouteToMap(route)}
                      >
                        📍 Load Route
                      </Button>
                      <Button
                        size="$2"
                        variant="outlined"
                        onPress={() => router.push(`./route-details?routeId=${route.id}` as any)}
                      >
                        📋
                      </Button>
                      <Button
                        size="$2"
                        variant="outlined"
                        borderColor="$red7"
                        color="$red9"
                        onPress={() => deleteRoute(route.id)}
                      >
                        🗑️
                      </Button>
                    </XStack>
                  </YStack>
                </Card>
              ))
            )}
          </YStack>
        </ScrollView>

        {/* Quick Stats */}
        {savedRoutes.length > 0 && (
          <Card padding="$3" backgroundColor="$blue2">
            <YStack space="$2">
              <Text fontSize="$3" fontWeight="bold" textAlign="center">
                Quick Stats
              </Text>
              <XStack justifyContent="space-around">
                <YStack alignItems="center">
                  <Text fontSize="$4" fontWeight="bold">
                    {savedRoutes.length}
                  </Text>
                  <Text fontSize="$2" color="$gray11">
                    Total Routes
                  </Text>
                </YStack>
                <YStack alignItems="center">
                  <Text fontSize="$4" fontWeight="bold">
                    {savedRoutes.filter(route => route.isFavorite).length}
                  </Text>
                  <Text fontSize="$2" color="$gray11">
                    Favorites
                  </Text>
                </YStack>
                <YStack alignItems="center">
                  <Text fontSize="$4" fontWeight="bold">
                    {formatDistance(
                      savedRoutes.reduce((sum, route) => sum + route.totalDistance, 0)
                    )}
                  </Text>
                  <Text fontSize="$2" color="$gray11">
                    Total Distance
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          </Card>
        )}
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
