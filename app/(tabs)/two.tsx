import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { YStack, XStack, Text, Button, ScrollView, Card } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { SavedRoute } from '@/types';
import { StorageService } from '@/services/storageService';
import { useRoute } from '@/contexts/RouteContext';

export default function SavedRoutesScreen() {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setLoadedRoute } = useRoute();
  const router = useRouter();

  // Refresh saved routes when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSavedRoutes();
    }, [])
  );

  const loadSavedRoutes = async () => {
    try {
      setIsLoading(true);
      const routes = await StorageService.getSavedRoutes();
      setSavedRoutes(routes);
    } catch (error) {
      console.error('Error loading saved routes:', error);
      Alert.alert('Error', 'Failed to load saved routes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteLoad = (route: SavedRoute) => {
    Alert.alert(
      'Load Route',
      `Load "${route.name}" in the route planner?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load Route',
          onPress: () => {
            setLoadedRoute(route);
            router.back();
          },
        },
      ]
    );
  };

  const handleRouteDetails = (route: SavedRoute) => {
    // Navigate to route details screen with the route data
    router.push({
      pathname: '/route-details',
      params: { routeId: route.id },
    });
  };

  const handleDeleteRoute = (route: SavedRoute) => {
    Alert.alert(
      'Delete Route',
      `Are you sure you want to delete "${route.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteRoute(route.id);
              await loadSavedRoutes(); // Refresh the list
              Alert.alert('Success', 'Route deleted successfully');
            } catch (error) {
              console.error('Error deleting route:', error);
              Alert.alert('Error', 'Failed to delete route');
            }
          },
        },
      ]
    );
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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <YStack flex={1} padding={16} space={"md"}>
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={24} fontWeight={"700"}>
            Saved Routes
          </Text>
          <Button
            size={"large"}
            circular
            variant="outlined"
            onPress={() => router.push('/settings' as any)}
          >
            ⚙️
          </Button>
        </XStack>

        {/* Content */}
        {isLoading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text fontSize={16}>Loading saved routes...</Text>
          </YStack>
        ) : savedRoutes.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center" space={"md"}>
            <Text fontSize={20} textAlign="center">
              🗺️ No Saved Routes
            </Text>
            <Text fontSize={14} color="$gray11" textAlign="center">
              Save routes from the route planner to see them here
            </Text>
                         <Button
               backgroundColor="$blue7"
               onPress={() => router.back()}
             >
               🧭 Plan a Route
             </Button>
          </YStack>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack space={"md"}>
              {savedRoutes.map((route) => (
                <Card key={route.id} padding={16} backgroundColor="$gray2">
                  <YStack space={"sm"}>
                    {/* Route Header */}
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text fontSize={16} fontWeight={"700"} flex={1}>
                        {route.name}
                      </Text>
                      {route.isFavorite && (
                        <Text fontSize={14}>⭐</Text>
                      )}
                    </XStack>

                    {/* Route Info */}
                    <XStack justifyContent="space-between">
                      <Text fontSize={14} color="$gray11">
                        📏 {formatDistance(route.totalDistance)}
                      </Text>
                      <Text fontSize={14} color="$gray11">
                        ⏱️ {formatDuration(route.totalDuration)}
                      </Text>
                      <Text fontSize={14} color="$gray11">
                        🚗 {route.vehicleType}
                      </Text>
                    </XStack>

                    {/* Route Details */}
                    <YStack space={"xs"}>
                      <Text fontSize={12} color="$gray10">
                        📍 From: {route.startPoint.address || `${route.startPoint.latitude.toFixed(4)}, ${route.startPoint.longitude.toFixed(4)}`}
                      </Text>
                      <Text fontSize={12} color="$gray10">
                        🎯 To: {route.endPoint.address || `${route.endPoint.latitude.toFixed(4)}, ${route.endPoint.longitude.toFixed(4)}`}
                      </Text>
                      {route.intermediateWaypoints && route.intermediateWaypoints.length > 0 && (
                        <Text fontSize={12} color="$gray10">
                          🔢 Waypoints: {route.intermediateWaypoints.length}
                        </Text>
                      )}
                      <Text fontSize={12} color="$gray9">
                        📅 Saved: {formatDate(route.createdAt)}
                      </Text>
                    </YStack>

                    {/* Action Buttons */}
                    <XStack space={"sm"} marginTop={"sm"}>
                      <Button
                        flex={1}
                        backgroundColor="$blue7"
                        onPress={() => handleRouteLoad(route)}
                      >
                        📍 Load
                      </Button>
                      <Button
                        flex={1}
                        variant="outlined"
                        onPress={() => handleRouteDetails(route)}
                      >
                        📋 Details
                      </Button>
                      <Button
                        backgroundColor="$red7"
                        onPress={() => handleDeleteRoute(route)}
                      >
                        🗑️
                      </Button>
                    </XStack>
                  </YStack>
                </Card>
              ))}
            </YStack>
          </ScrollView>
        )}

        {/* Summary Footer */}
        {savedRoutes.length > 0 && (
          <XStack justifyContent="center" padding={8} backgroundColor="$gray1" borderRadius={16}>
            <Text fontSize={14} color="$gray11">
              {savedRoutes.length} route{savedRoutes.length > 1 ? 's' : ''} saved
            </Text>
          </XStack>
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
