import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity, RefreshControl } from 'react-native';
import { YStack, XStack, Text, Button, ScrollView, Card } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SavedRoute } from '@/types';
import { StorageService } from '@/services/storageService';
import { useRoute } from '@/contexts/RouteContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function SavedRoutesScreen() {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { setLoadedRoute } = useRoute();
  const router = useRouter();
  const { colors } = useTheme();

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
      setSavedRoutes(routes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading saved routes:', error);
      Alert.alert('Error', 'Failed to load saved routes');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedRoutes();
    setRefreshing(false);
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
    router.push(`/route-details?routeId=${route.id}`);
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
              setSavedRoutes(savedRoutes.filter(r => r.id !== route.id));
            } catch (error) {
              console.error('Error deleting route:', error);
              Alert.alert('Error', 'Failed to delete route');
            }
          },
        },
      ]
    );
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    }
    return `${(distance / 1000).toFixed(1)} km`;
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getVehicleIcon = (vehicle: string) => {
    switch (vehicle) {
      case 'driving': return 'car';
      case 'bicycle': return 'bicycle';
      case 'walking': return 'walk';
      default: return 'map';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <YStack space="md" alignItems="center">
            <View style={[styles.loadingSpinner, { borderColor: colors.primary }]}>
              <Ionicons name="map" size={32} color={colors.primary} />
            </View>
            <Text variant="bodyLarge" style={{ color: colors.onSurface }}>
              Loading saved routes...
            </Text>
          </YStack>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {savedRoutes.length === 0 ? (
          // Empty state
          <View style={styles.emptyContainer}>
            <YStack space="lg" alignItems="center">
              <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
                <Ionicons name="bookmark-outline" size={64} color={colors.outline} />
              </View>
              
              <YStack space="sm" alignItems="center">
                <Text variant="headlineMedium" style={{ color: colors.onSurface }}>
                  No Saved Routes
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={{ 
                    color: colors.onSurfaceVariant, 
                    textAlign: 'center',
                    paddingHorizontal: 32 
                  }}
                >
                  Save your favorite routes to access them quickly. Calculated routes can be saved from the main screen.
                </Text>
              </YStack>
              
              <Button
                onPress={() => router.back()}
                variant="filled"
                style={{ backgroundColor: colors.primary }}
              >
                <Text style={{ color: 'white' }}>Plan a Route</Text>
              </Button>
            </YStack>
          </View>
        ) : (
          // Routes list
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            <YStack space="md" padding={16}>
              <YStack space="sm">
                <Text variant="headlineSmall" style={{ color: colors.onSurface }}>
                  Saved Routes
                </Text>
                <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                  {savedRoutes.length} route{savedRoutes.length !== 1 ? 's' : ''} saved
                </Text>
              </YStack>

              {savedRoutes.map((route) => (
                <Card 
                  key={route.id} 
                  style={[styles.routeCard, { backgroundColor: colors.surface }]}
                >
                  <YStack space="md" padding={16}>
                    {/* Route Header */}
                    <XStack justifyContent="space-between" alignItems="flex-start">
                      <YStack flex={1} space="xs">
                        <Text 
                          variant="titleMedium" 
                          style={{ color: colors.onSurface }}
                          numberOfLines={2}
                        >
                          {route.name}
                        </Text>
                        <Text 
                          variant="bodySmall" 
                          style={{ color: colors.onSurfaceVariant }}
                        >
                          Saved on {formatDate(route.createdAt)}
                        </Text>
                      </YStack>
                      <View style={[styles.vehicleIcon, { backgroundColor: colors.primaryContainer }]}>
                        <Ionicons 
                          name={getVehicleIcon(route.vehicleType)} 
                          size={20} 
                          color={colors.onPrimaryContainer} 
                        />
                      </View>
                    </XStack>

                    {/* Route Stats */}
                    <XStack space="lg">
                      <XStack alignItems="center" space="xs">
                        <Ionicons name="location" size={16} color={colors.onSurfaceVariant} />
                        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                          {formatDistance(route.totalDistance)}
                        </Text>
                      </XStack>
                      <XStack alignItems="center" space="xs">
                        <Ionicons name="time" size={16} color={colors.onSurfaceVariant} />
                        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                          {formatDuration(route.totalDuration)}
                        </Text>
                      </XStack>
                      {route.waypoints && route.waypoints.length > 2 && (
                        <XStack alignItems="center" space="xs">
                          <Ionicons name="git-branch" size={16} color={colors.onSurfaceVariant} />
                          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                            {route.waypoints.length - 2} stops
                          </Text>
                        </XStack>
                      )}
                    </XStack>

                    {/* Route Points */}
                    <YStack space="xs">
                      <XStack alignItems="center" space="sm">
                        <View style={styles.routePointIcon}>
                          <Ionicons name="radio-button-on" size={12} color="#10B981" />
                        </View>
                        <Text 
                          variant="bodyMedium" 
                          style={{ color: colors.onSurface, flex: 1 }} 
                          numberOfLines={1}
                        >
                          {route.startPoint.address || `${route.startPoint.latitude.toFixed(4)}, ${route.startPoint.longitude.toFixed(4)}`}
                        </Text>
                      </XStack>
                      <XStack alignItems="center" space="sm">
                        <View style={styles.routePointIcon}>
                          <Ionicons name="location" size={12} color="#EF4444" />
                        </View>
                        <Text 
                          variant="bodyMedium" 
                          style={{ color: colors.onSurface, flex: 1 }} 
                          numberOfLines={1}
                        >
                          {route.endPoint.address || `${route.endPoint.latitude.toFixed(4)}, ${route.endPoint.longitude.toFixed(4)}`}
                        </Text>
                      </XStack>
                    </YStack>

                    {/* Action Buttons */}
                    <XStack space="sm" style={styles.actionButtons}>
                      <Button
                        variant="filled"
                        onPress={() => handleRouteLoad(route)}
                        style={styles.primaryActionButton}
                        flex={1}
                      >
                        <XStack alignItems="center" space="xs">
                          <Ionicons name="navigate" size={16} color="white" />
                          <Text style={{ color: 'white' }}>Load Route</Text>
                        </XStack>
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onPress={() => handleRouteDetails(route)}
                        style={styles.secondaryActionButton}
                      >
                        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                      </Button>
                      
                      <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: colors.errorContainer }]}
                        onPress={() => handleDeleteRoute(route)}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.onErrorContainer} />
                      </TouchableOpacity>
                    </XStack>
                  </YStack>
                </Card>
              ))}
            </YStack>
            <View style={styles.bottomPadding} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Route Cards
  routeCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routePointIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Action Buttons
  actionButtons: {
    marginTop: 8,
  },
  primaryActionButton: {
    borderRadius: 12,
    paddingVertical: 12,
  },
  secondaryActionButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  bottomPadding: {
    height: 40,
  },
}); 