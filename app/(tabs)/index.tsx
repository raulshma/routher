import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity, Dimensions, Animated, PanResponder } from 'react-native';
import * as Location from 'expo-location';
import { YStack, XStack, Button, Text, ScrollView, Switch, Card, Input } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { MapViewComponent } from '@/components/MapView';
import { VehicleSelector } from '@/components/VehicleSelector';
import { LocationSearch } from '@/components/LocationSearch';
import { RouteOptions } from '@/components/RouteOptions';
import { RouteAlternatives } from '@/components/RouteAlternatives';
import { MapErrorBoundary, RouteErrorBoundary, SearchErrorBoundary } from '@/components/ErrorBoundary';
import { Location as LocationType, VehicleType, Route, WeatherPoint, Waypoint } from '@/types';
import { RoutingService, RouteAlternative } from '@/services/routingService';
import { WeatherService } from '@/services/weatherService';
import { StorageService } from '@/services/storageService';
import { useRoute } from '@/contexts/RouteContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function RoutePlannerScreen() {
  const [startPoint, setStartPoint] = useState<LocationType | undefined>();
  const [endPoint, setEndPoint] = useState<LocationType | undefined>();
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('driving');
  const [routeCoordinates, setRouteCoordinates] = useState<LocationType[]>([]);
  const [routeAlternatives, setRouteAlternatives] = useState<RouteAlternative[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-0');
  const [showAlternatives, setShowAlternatives] = useState<boolean>(false);
  const [weatherPoints, setWeatherPoints] = useState<WeatherPoint[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);
  
  // UI State
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [bottomSheetHeight] = useState(new Animated.Value(120)); // Initial height for route info
  const [searchQuery, setSearchQuery] = useState('');
  const [showRouteControls, setShowRouteControls] = useState(false);
  
  const { loadedRoute, setLoadedRoute, isRouteLoaded } = useRoute();

  // Request location permissions on component mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Handle loaded route from saved routes
  useFocusEffect(
    React.useCallback(() => {
      if (loadedRoute && isRouteLoaded) {
        loadRouteData(loadedRoute);
      }
    }, [loadedRoute, isRouteLoaded])
  );

  // Pan responder for bottom sheet
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (evt, gestureState) => {
      const newHeight = Math.max(120, Math.min(screenHeight * 0.6, 120 - gestureState.dy));
      bottomSheetHeight.setValue(newHeight);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const velocity = gestureState.vy;
      const currentHeight = (bottomSheetHeight as any)._value;
      
      let targetHeight = 120;
      if (velocity > 0.5 || currentHeight < 200) {
        targetHeight = 120; // Snap to collapsed
      } else if (velocity < -0.5 || currentHeight > 300) {
        targetHeight = screenHeight * 0.6; // Snap to expanded
      } else {
        targetHeight = currentHeight > 200 ? screenHeight * 0.6 : 120;
      }
      
      Animated.spring(bottomSheetHeight, {
        toValue: targetHeight,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    },
  });

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to use your current location as a starting point.'
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to use your current location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const currentLocation: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: 'Current Location',
      };
      
      setStartPoint(currentLocation);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get your current location. Please try again.');
    }
  }, []);

  // Memoized waypoint management functions
  const addWaypoint = useCallback((location: LocationType) => {
    const newWaypoint: Waypoint = {
      id: Date.now().toString(),
      location,
      order: waypoints.length + 1,
    };
    setWaypoints(prev => [...prev, newWaypoint]);
  }, [waypoints.length]);

  const removeWaypoint = useCallback((waypointId: string) => {
    setWaypoints(prev => {
      const updatedWaypoints = prev
        .filter(wp => wp.id !== waypointId)
        .map((wp, index) => ({ ...wp, order: index + 1 })); // Reorder after removal
      return updatedWaypoints;
    });
  }, []);

  const reorderWaypoint = useCallback((waypointId: string, newOrder: number) => {
    setWaypoints(prev => {
      const updatedWaypoints = prev.map(wp => {
        if (wp.id === waypointId) {
          return { ...wp, order: newOrder };
        }
        // Adjust other waypoint orders
        if (wp.order >= newOrder) {
          return { ...wp, order: wp.order + 1 };
        }
        return wp;
      }).sort((a, b) => a.order - b.order);
      
      return updatedWaypoints;
    });
  }, []);

  // Memoized route validation
  const canCalculateRoute = useMemo(() => {
    return !!(startPoint && endPoint && !isCalculatingRoute);
  }, [startPoint, endPoint, isCalculatingRoute]);

  const calculateRoute = useCallback(async () => {
    if (!startPoint || !endPoint) {
      Alert.alert('Missing Information', 'Please set both start and end points.');
      return;
    }

    setIsCalculatingRoute(true);
    
    try {
      if (showAlternatives) {
        // Calculate route alternatives
        const alternatives = await RoutingService.calculateRouteAlternatives(
          startPoint,
          endPoint,
          selectedVehicle,
          waypoints,
          3 // Get up to 3 alternatives
        );

        setRouteAlternatives(alternatives);
        setSelectedRouteId(alternatives[0]?.id || 'route-0');

        // Use the first (recommended) route for weather and route info
        const selectedRoute = alternatives[0];
        if (selectedRoute) {
          // Generate weather points along the route
          const weatherLocations = RoutingService.generateRoutePointsAtIntervals(selectedRoute.routePoints);
          const weatherData = await WeatherService.getWeatherForRoute(weatherLocations);
          
          const weatherPointsWithDistance: WeatherPoint[] = weatherLocations.map((location, index) => ({
            location,
            weather: weatherData[index],
            distanceFromStart: index * 1000, // Approximate distance in meters
          }));

          setWeatherPoints(weatherPointsWithDistance);
          setRouteCoordinates(selectedRoute.routePoints.map(point => point.location));
          setRouteInfo({
            distance: selectedRoute.totalDistance,
            duration: selectedRoute.totalDuration,
          });
        }
      } else {
        // Calculate single route (legacy mode)
        const result = await RoutingService.calculateMultiWaypointRoute(
          startPoint,
          endPoint,
          waypoints,
          selectedVehicle
        );

        // Generate weather points along the route
        const weatherLocations = RoutingService.generateRoutePointsAtIntervals(result.routePoints);
        const weatherData = await WeatherService.getWeatherForRoute(weatherLocations);
        
        const weatherPointsWithDistance: WeatherPoint[] = weatherLocations.map((location, index) => ({
          location,
          weather: weatherData[index],
          distanceFromStart: index * 1000, // Approximate distance in meters
        }));

        setRouteCoordinates(result.routePoints.map(point => point.location));
        setWeatherPoints(weatherPointsWithDistance);
        setRouteAlternatives([]);
        setRouteInfo({
          distance: result.totalDistance,
          duration: result.totalDuration,
        });
      }
      
      // Expand bottom sheet when route is calculated
      Animated.spring(bottomSheetHeight, {
        toValue: 280,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
      
    } catch (error) {
      console.error('Error calculating route:', error);
      Alert.alert('Error', 'Failed to calculate route. Please try again.');
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [startPoint, endPoint, waypoints, selectedVehicle, showAlternatives]);

  const handleRouteSelect = useCallback((routeId: string, alternative: RouteAlternative) => {
    setSelectedRouteId(routeId);
    
    // Update route info and weather for selected route
    setRouteInfo({
      distance: alternative.totalDistance,
      duration: alternative.totalDuration,
    });
    setRouteCoordinates(alternative.routePoints.map(point => point.location));
    
    // Optionally recalculate weather for the new route
    // (for now, we'll keep the existing weather data)
  }, []);

  const handleRouteAlternativePress = useCallback((routeId: string) => {
    const alternative = routeAlternatives.find(alt => alt.id === routeId);
    if (alternative) {
      handleRouteSelect(routeId, alternative);
    }
  }, [routeAlternatives, handleRouteSelect]);

  const saveRoute = useCallback(async () => {
    if (!startPoint || !endPoint || !routeInfo) {
      Alert.alert('Error', 'No route to save. Please calculate a route first.');
      return;
    }

    Alert.prompt(
      'Save Route',
      'Enter a name for this route:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (routeName) => {
            if (!routeName || routeName.trim() === '') {
              Alert.alert('Error', 'Please enter a valid route name.');
              return;
            }

            try {
              const route: Route = {
                id: Date.now().toString(),
                name: routeName.trim(),
                startPoint,
                endPoint,
                waypoints: routeCoordinates.map(location => ({ location })),
                intermediateWaypoints: waypoints,
                weatherPoints,
                vehicleType: selectedVehicle,
                totalDistance: routeInfo.distance,
                totalDuration: routeInfo.duration,
                createdAt: new Date(),
              };

              await StorageService.saveRoute(route);
              Alert.alert('Success', 'Route saved successfully!');
            } catch (error) {
              console.error('Error saving route:', error);
              Alert.alert('Error', 'Failed to save route. Please try again.');
            }
          },
        },
      ],
      'plain-text'
    );
  }, [startPoint, endPoint, routeInfo, routeCoordinates, waypoints, weatherPoints, selectedVehicle]);

  const clearRoute = useCallback(() => {
    setStartPoint(undefined);
    setEndPoint(undefined);
    setWaypoints([]);
    setRouteCoordinates([]);
    setRouteAlternatives([]);
    setSelectedRouteId('route-0');
    setWeatherPoints([]);
    setRouteInfo(null);
    setSearchQuery('');
    if (isRouteLoaded) {
      setLoadedRoute(null);
    }
    
    // Collapse bottom sheet
    Animated.spring(bottomSheetHeight, {
      toValue: 120,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [isRouteLoaded, setLoadedRoute]);

  const loadRouteData = useCallback((route: Route) => {
    setStartPoint(route.startPoint);
    setEndPoint(route.endPoint);
    setWaypoints(route.intermediateWaypoints || []);
    setSelectedVehicle(route.vehicleType);
    setRouteCoordinates(route.waypoints?.map(wp => wp.location) || []);
    setWeatherPoints(route.weatherPoints || []);
    setRouteAlternatives([]);
    setSelectedRouteId('route-0');
    setRouteInfo({
      distance: route.totalDistance,
      duration: route.totalDuration,
    });
    
    // Expand bottom sheet for loaded route
    Animated.spring(bottomSheetHeight, {
      toValue: 280,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  // Memoized route statistics formatting
  const routeStats = useMemo(() => {
    if (!routeInfo) return null;
    
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

    return {
      distance: formatDistance(routeInfo.distance),
      duration: formatDuration(routeInfo.duration),
      waypoints: waypoints.length,
    };
  }, [routeInfo, waypoints.length]);

  const toggleRouteControls = () => {
    setShowRouteControls(!showRouteControls);
  };

  const swapStartAndEnd = () => {
    if (startPoint && endPoint) {
      const temp = startPoint;
      setStartPoint(endPoint);
      setEndPoint(temp);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map View with Error Boundary */}
      <MapErrorBoundary>
        <MapViewComponent
          startPoint={startPoint}
          endPoint={endPoint}
          waypoints={waypoints}
          routeCoordinates={routeCoordinates}
          routeAlternatives={routeAlternatives}
          selectedRouteId={selectedRouteId}
          weatherPoints={weatherPoints}
          onStartPointChange={setStartPoint}
          onEndPointChange={setEndPoint}
          onWaypointAdd={addWaypoint}
          onWaypointRemove={removeWaypoint}
          onRouteAlternativePress={handleRouteAlternativePress}
        />
      </MapErrorBoundary>

      {/* Top Search Bar Overlay */}
      <View style={styles.searchOverlay}>
        <SafeAreaView>
          <Card style={styles.searchCard}>
            <XStack space="sm" alignItems="center" padding={12}>
              <View style={styles.searchIcon}>
                <Ionicons name="search" size={20} color="#666" />
              </View>
              <YStack flex={1} space="xs">
                <SearchErrorBoundary>
                  <LocationSearch
                    onLocationSelect={setStartPoint}
                    placeholder="From"
                    value={startPoint?.address}
                  />
                  <View style={styles.searchSeparator} />
                  <LocationSearch
                    onLocationSelect={setEndPoint}
                    placeholder="To"
                    value={endPoint?.address}
                  />
                </SearchErrorBoundary>
              </YStack>
              <TouchableOpacity 
                style={styles.swapButton}
                onPress={swapStartAndEnd}
                disabled={!startPoint || !endPoint}
              >
                <Ionicons 
                  name="swap-vertical" 
                  size={20} 
                  color={startPoint && endPoint ? "#4285F4" : "#ccc"} 
                />
              </TouchableOpacity>
            </XStack>
          </Card>
        </SafeAreaView>
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        {/* Current Location Button */}
        <TouchableOpacity style={styles.fab} onPress={getCurrentLocation}>
          <Ionicons name="locate" size={24} color="#4285F4" />
        </TouchableOpacity>
        
        {/* Route Options Button */}
        <TouchableOpacity style={styles.fab} onPress={toggleRouteControls}>
          <Ionicons name="options" size={24} color="#4285F4" />
        </TouchableOpacity>
        
        {/* Directions Button (when route is ready) */}
        {canCalculateRoute && (
          <TouchableOpacity 
            style={[styles.fab, styles.primaryFab]} 
            onPress={calculateRoute}
            disabled={isCalculatingRoute}
          >
            <Ionicons 
              name={isCalculatingRoute ? "ellipsis-horizontal" : "navigate"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Route Controls Overlay */}
      {showRouteControls && (
        <View style={styles.routeControlsOverlay}>
          <Card style={styles.routeControlsCard}>
            <YStack padding={16} space="md">
              <XStack justifyContent="space-between" alignItems="center">
                <Text variant="titleMedium" fontWeight="600">Route Options</Text>
                <TouchableOpacity onPress={toggleRouteControls}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </XStack>
              
              <VehicleSelector
                selectedVehicle={selectedVehicle}
                onVehicleSelect={setSelectedVehicle}
              />
              
              <XStack justifyContent="space-between" alignItems="center">
                <Text variant="bodyMedium">Show Alternatives</Text>
                <Switch
                  checked={showAlternatives}
                  onCheckedChange={setShowAlternatives}
                />
              </XStack>
            </YStack>
          </Card>
        </View>
      )}

      {/* Bottom Sheet */}
      <Animated.View 
        style={[styles.bottomSheet, { height: bottomSheetHeight }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.bottomSheetHandle} />
        
        <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
          <YStack space="md" padding={20}>
            {/* Header with route status */}
            {!routeInfo && (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateIcon}>🗺️</Text>
                <Text style={styles.emptyStateTitle}>Plan your route</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Enter start and destination points to get directions with real-time weather data
                </Text>
              </View>
            )}

            {/* Quick Actions when no route */}
            {!routeInfo && (
              <View style={styles.actionButtonsContainer}>
                <Button
                  onPress={getCurrentLocation}
                  variant="gradient"
                  size="medium"
                  style={styles.quickActionButton}
                  icon={<Ionicons name="locate" size={18} color="white" />}
                >
                  Current Location
                </Button>
                
                <Button
                  onPress={toggleRouteControls}
                  variant="outlined"
                  size="medium"
                  style={styles.quickActionButton}
                  icon={<Ionicons name="options" size={18} color="#6366F1" />}
                >
                  Options
                </Button>
              </View>
            )}

            {/* Route Controls when route exists */}
            {routeInfo && (
              <XStack space="sm" justifyContent="center">
                <Button
                  onPress={saveRoute}
                  variant="tonal"
                  style={styles.secondaryButton}
                >
                  <Ionicons name="bookmark-outline" size={16} color="#4285F4" />
                </Button>
                
                <Button
                  onPress={clearRoute}
                  variant="outlined"
                  style={styles.secondaryButton}
                >
                  <Ionicons name="close" size={16} color="#666" />
                </Button>
              </XStack>
            )}

            {/* Route Information */}
            {routeStats && (
              <Card variant="glass" style={styles.routeInfoCard} borderRadius={20}>
                <View style={styles.routeStatsContainer}>
                  <View style={styles.routeStatItem}>
                    <View style={styles.routeStatIcon}>
                      <Ionicons name="location" size={20} color="#6366F1" />
                    </View>
                    <Text style={styles.routeStatLabel}>Distance</Text>
                    <Text style={styles.routeStatValue}>{routeStats.distance}</Text>
                  </View>
                  <View style={styles.routeStatItem}>
                    <View style={styles.routeStatIcon}>
                      <Ionicons name="time" size={20} color="#6366F1" />
                    </View>
                    <Text style={styles.routeStatLabel}>Duration</Text>
                    <Text style={styles.routeStatValue}>{routeStats.duration}</Text>
                  </View>
                  <View style={styles.routeStatItem}>
                    <View style={styles.routeStatIcon}>
                      <Ionicons name="car" size={20} color="#6366F1" />
                    </View>
                    <Text style={styles.routeStatLabel}>Transport</Text>
                    <Text style={styles.routeStatValue}>{selectedVehicle}</Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Route Alternatives */}
            {routeAlternatives.length > 0 && (
              <RouteErrorBoundary>
                <RouteAlternatives
                  alternatives={routeAlternatives}
                  selectedRouteId={selectedRouteId}
                  onRouteSelect={handleRouteSelect}
                />
              </RouteErrorBoundary>
            )}

            {/* Route Status */}
            {isRouteLoaded && (
              <Card style={styles.statusCard}>
                <XStack alignItems="center" padding={12} space="sm">
                  <Ionicons name="folder-open" size={16} color="#007AFF" />
                  <Text variant="bodyMedium" flex={1}>
                    Loaded: "{loadedRoute?.name}"
                  </Text>
                </XStack>
              </Card>
            )}
          </YStack>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  searchCard: {
    margin: 16,
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSeparator: {
    height: 1,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    marginVertical: 8,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    zIndex: 100,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  primaryFab: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  routeControlsOverlay: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  routeControlsCard: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(99, 102, 241, 0.1)',
  },
  bottomSheetHandle: {
    width: 48,
    height: 5,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  bottomSheetContent: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  routeInfoCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  statusCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  routeStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  routeStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  routeStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  routeStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});
