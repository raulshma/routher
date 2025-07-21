import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, Button, ScrollView, Card } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'driving': return 'car';
      case 'cycling': return 'bicycle';
      case 'walking': return 'walk';
      default: return 'car';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Saved Routes</Text>
            <Text style={styles.headerSubtitle}>
              {savedRoutes.length} {savedRoutes.length === 1 ? 'route' : 'routes'} saved
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/settings' as any)}
          >
            <Ionicons name="settings-outline" size={24} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading saved routes...</Text>
          </View>
        ) : savedRoutes.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateIcon}>🗺️</Text>
            <Text style={styles.emptyStateTitle}>No Saved Routes</Text>
            <Text style={styles.emptyStateSubtitle}>
              Save routes from the route planner to see them here
            </Text>
            <Button
              variant="gradient"
              onPress={() => router.back()}
              style={styles.emptyStateButton}
              icon={<Ionicons name="map" size={18} color="white" />}
            >
              Plan a Route
            </Button>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.routesList}>
              {savedRoutes.map((route) => (
                <Card key={route.id} variant="elevated" style={styles.routeCard} borderRadius={20}>
                  <View style={styles.routeCardContent}>
                    {/* Route Header */}
                    <View style={styles.routeHeader}>
                      <View style={styles.routeTitleContainer}>
                        <Text style={styles.routeTitle}>{route.name}</Text>
                        {route.isFavorite && (
                          <View style={styles.favoriteIcon}>
                            <Ionicons name="star" size={16} color="#F59E0B" />
                          </View>
                        )}
                      </View>
                      <View style={styles.vehicleIconContainer}>
                        <Ionicons 
                          name={getVehicleIcon(route.vehicleType)} 
                          size={20} 
                          color="#6366F1" 
                        />
                      </View>
                    </View>

                    {/* Route Stats */}
                    <View style={styles.routeStats}>
                      <View style={styles.routeStat}>
                        <View style={styles.routeStatIcon}>
                          <Ionicons name="location" size={16} color="#6366F1" />
                        </View>
                        <Text style={styles.routeStatValue}>{formatDistance(route.totalDistance)}</Text>
                      </View>
                      <View style={styles.routeStat}>
                        <View style={styles.routeStatIcon}>
                          <Ionicons name="time" size={16} color="#10B981" />
                        </View>
                        <Text style={styles.routeStatValue}>{formatDuration(route.totalDuration)}</Text>
                      </View>
                      {route.intermediateWaypoints && route.intermediateWaypoints.length > 0 && (
                        <View style={styles.routeStat}>
                          <View style={styles.routeStatIcon}>
                            <Ionicons name="flag" size={16} color="#F59E0B" />
                          </View>
                          <Text style={styles.routeStatValue}>{route.intermediateWaypoints.length} stops</Text>
                        </View>
                      )}
                    </View>

                    {/* Route Details */}
                    <View style={styles.routeDetails}>
                      <View style={styles.routePoint}>
                        <View style={styles.routePointIcon}>
                          <Ionicons name="radio-button-on" size={12} color="#10B981" />
                        </View>
                        <Text style={styles.routePointText} numberOfLines={1}>
                          {route.startPoint.address || `${route.startPoint.latitude.toFixed(4)}, ${route.startPoint.longitude.toFixed(4)}`}
                        </Text>
                      </View>
                      <View style={styles.routePoint}>
                        <View style={styles.routePointIcon}>
                          <Ionicons name="location" size={12} color="#EF4444" />
                        </View>
                        <Text style={styles.routePointText} numberOfLines={1}>
                          {route.endPoint.address || `${route.endPoint.latitude.toFixed(4)}, ${route.endPoint.longitude.toFixed(4)}`}
                        </Text>
                      </View>
                      <Text style={styles.routeDate}>
                        Saved {formatDate(route.createdAt)}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      <Button
                        variant="gradient"
                        onPress={() => handleRouteLoad(route)}
                        style={styles.actionButton}
                        icon={<Ionicons name="map" size={16} color="white" />}
                      >
                        Load
                      </Button>
                      <Button
                        variant="outlined"
                        onPress={() => handleRouteDetails(route)}
                        style={styles.actionButton}
                        icon={<Ionicons name="information-circle-outline" size={16} color="#6366F1" />}
                      >
                        Details
                      </Button>
                      <Button
                        variant="text"
                        onPress={() => handleDeleteRoute(route)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </Button>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
  },
  scrollView: {
    flex: 1,
  },
  routesList: {
    paddingBottom: 20,
  },
  routeCard: {
    marginBottom: 16,
  },
  routeCardContent: {
    padding: 20,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  routeTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  favoriteIcon: {
    marginLeft: 8,
  },
  vehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  routeStatIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  routeStatValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  routeDetails: {
    marginBottom: 20,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routePointIcon: {
    marginRight: 8,
  },
  routePointText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  routeDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
