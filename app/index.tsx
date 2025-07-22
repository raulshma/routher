import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity, Dimensions, Animated, PanResponder, StatusBar } from 'react-native';
import * as Location from 'expo-location';
import { YStack, XStack, Button, Text, ScrollView, Card, Input } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { MapViewComponent } from '@/components/MapView';
import { VehicleSelector } from '@/components/VehicleSelector';
import { LocationSearch } from '@/components/LocationSearch';
import { CompactSearch } from '@/components/CompactSearch';
import { QuickActions } from '@/components/QuickActions';
import { RouteOptions } from '@/components/RouteOptions';
import { RouteAlternatives } from '@/components/RouteAlternatives';
import { MapErrorBoundary, RouteErrorBoundary, SearchErrorBoundary } from '@/components/ErrorBoundary';
import { Location as LocationType, VehicleType, Route, WeatherPoint, Waypoint, RouteOptions as RouteOptionsType } from '@/types';
import { RoutingService, RouteAlternative } from '@/services/routingService';
import { WeatherService } from '@/services/weatherService';
import { StorageService } from '@/services/storageService';
import { useRoute } from '@/contexts/RouteContext';
import { useTheme } from '@/contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MainScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  // Route state
  const [startPoint, setStartPoint] = useState<LocationType | undefined>();
  const [endPoint, setEndPoint] = useState<LocationType | undefined>();
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('driving');
  const [routeCoordinates, setRouteCoordinates] = useState<LocationType[]>([]);
  const [routeAlternatives, setRouteAlternatives] = useState<RouteAlternative[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-0');
  const [weatherPoints, setWeatherPoints] = useState<WeatherPoint[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);
  
  // Route options
  const [routeOptions, setRouteOptions] = useState<RouteOptionsType>({
    vehicle: 'driving',
    avoidHighways: false,
    avoidTolls: false,
    avoidFerries: false,
    routeType: 'fastest',
  });
  
  // UI State
  const [searchHeight] = useState(new Animated.Value(120));
  const [bottomSheetHeight] = useState(new Animated.Value(120));
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  
  const { loadedRoute, setLoadedRoute, isRouteLoaded } = useRoute();

  // Request location permissions
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Handle loaded route
  useFocusEffect(
    React.useCallback(() => {
      if (loadedRoute && isRouteLoaded) {
        loadRouteData(loadedRoute);
      }
    }, [loadedRoute, isRouteLoaded])
  );

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to use route planning features.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        await requestLocationPermission();
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const currentLocation: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: 'Current Location',
      };

      setStartPoint(currentLocation);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Unable to get your current location. Please try again.');
    }
  };

  const loadRouteData = useCallback((route: Route) => {
    setStartPoint(route.startPoint);
    setEndPoint(route.endPoint);
    setWaypoints(route.intermediateWaypoints || []);
    setSelectedVehicle(route.vehicleType);
    setWeatherPoints(route.weatherPoints);
    
    if (route.waypoints && route.waypoints.length > 0) {
      const coordinates = route.waypoints.map(wp => wp.location);
      setRouteCoordinates(coordinates);
      setRouteInfo({
        distance: route.totalDistance,
        duration: route.totalDuration,
      });
    }
  }, []);

  const calculateRoute = async () => {
    if (!startPoint || !endPoint) {
      Alert.alert('Incomplete Route', 'Please select both start and end points.');
      return;
    }

    setIsCalculatingRoute(true);
    try {
      const routingOptions = {
        vehicleType: selectedVehicle,
        avoidHighways: routeOptions.avoidHighways,
        avoidTolls: routeOptions.avoidTolls,
        avoidFerries: routeOptions.avoidFerries,
        routeType: routeOptions.routeType,
      };

      const alternatives = await RoutingService.calculateRouteAlternatives(
        startPoint,
        endPoint,
        selectedVehicle,
        waypoints,
        3 // max alternatives
      );

      setRouteAlternatives(alternatives);
      
      if (alternatives.length > 0) {
        const mainRoute = alternatives[0];
        setRouteCoordinates(mainRoute.geometry);
        setRouteInfo({
          distance: mainRoute.totalDistance,
          duration: mainRoute.totalDuration,
        });

        // Get weather data
        try {
          const weatherData = await WeatherService.getWeatherForRoute(mainRoute.geometry);
          const weather = weatherData.map((data, index) => ({
            location: mainRoute.geometry[index],
            weather: data,
            distanceFromStart: index * (mainRoute.totalDistance / mainRoute.geometry.length),
          }));
          setWeatherPoints(weather);
        } catch (weatherError) {
          console.warn('Weather data unavailable:', weatherError);
        }

        // Animate bottom sheet up
        Animated.spring(bottomSheetHeight, {
          toValue: 300,
          useNativeDriver: false,
        }).start();
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      Alert.alert('Route Error', 'Unable to calculate route. Please try again.');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const saveCurrentRoute = async () => {
    if (!startPoint || !endPoint || !routeInfo) {
      Alert.alert('No Route', 'Please calculate a route before saving.');
      return;
    }

    try {
      const routeName = `Route from ${startPoint.address?.slice(0, 20) || 'Start'} to ${endPoint.address?.slice(0, 20) || 'End'}`;
      
      const savedRoute: Route = {
        id: Date.now().toString(),
        name: routeName,
        startPoint,
        endPoint,
        waypoints: routeCoordinates.map((coord, index) => ({
          location: coord,
          distance: index * (routeInfo.distance / routeCoordinates.length),
          duration: index * (routeInfo.duration / routeCoordinates.length),
        })),
        intermediateWaypoints: waypoints,
        weatherPoints,
        vehicleType: selectedVehicle,
        totalDistance: routeInfo.distance,
        totalDuration: routeInfo.duration,
        createdAt: new Date(),
      };

      await StorageService.saveRoute(savedRoute);
      Alert.alert('Route Saved', `"${routeName}" has been saved successfully.`);
    } catch (error) {
      console.error('Error saving route:', error);
      Alert.alert('Save Error', 'Unable to save route. Please try again.');
    }
  };

  const swapStartAndEnd = () => {
    if (startPoint && endPoint) {
      setStartPoint(endPoint);
      setEndPoint(startPoint);
    }
  };

  const clearRoute = () => {
    setStartPoint(undefined);
    setEndPoint(undefined);
    setWaypoints([]);
    setRouteCoordinates([]);
    setRouteAlternatives([]);
    setWeatherPoints([]);
    setRouteInfo(null);
    setLoadedRoute(null);
    
    // Animate bottom sheet down
    Animated.spring(bottomSheetHeight, {
      toValue: 120,
      useNativeDriver: false,
    }).start();
  };

  const addWaypoint = (location: LocationType) => {
    const newWaypoint: Waypoint = {
      id: `waypoint-${Date.now()}`,
      location,
      order: waypoints.length + 1,
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const removeWaypoint = (waypointId: string) => {
    setWaypoints(waypoints.filter(wp => wp.id !== waypointId));
  };

  const handleRouteSelect = (routeId: string, alternative?: RouteAlternative) => {
    setSelectedRouteId(routeId);
    if (alternative) {
      setRouteCoordinates(alternative.geometry);
      setRouteInfo({
        distance: alternative.totalDistance,
        duration: alternative.totalDuration,
      });
    }
  };

  const handleRouteAlternativePress = (routeId: string) => {
    const alternative = routeAlternatives.find(alt => alt.id === routeId);
    if (alternative) {
      handleRouteSelect(routeId, alternative);
    }
  };

  // Format helpers
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

  const canCalculateRoute = startPoint && endPoint;
  const hasRoute = routeInfo !== null;

  // Pan responder for bottom sheet
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 20,
    onPanResponderMove: (_, gestureState) => {
      const newHeight = Math.max(120, Math.min(500, 300 - gestureState.dy));
      bottomSheetHeight.setValue(newHeight);
    },
    onPanResponderRelease: (_, gestureState) => {
      const targetHeight = gestureState.dy > 50 ? 120 : gestureState.dy < -50 ? 500 : 300;
      Animated.spring(bottomSheetHeight, {
        toValue: targetHeight,
        useNativeDriver: false,
      }).start();
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Map View */}
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

      {/* Search Bar */}
      <SafeAreaView style={styles.searchContainer}>
        <SearchErrorBoundary>
          <CompactSearch
            startPoint={startPoint}
            endPoint={endPoint}
            onStartPointChange={setStartPoint}
            onEndPointChange={setEndPoint}
            onSwap={swapStartAndEnd}
            onMenuPress={() => setShowMenu(!showMenu)}
            expanded={searchExpanded}
            onToggleExpanded={() => setSearchExpanded(!searchExpanded)}
          />
        </SearchErrorBoundary>
      </SafeAreaView>

      {/* Side Menu */}
      {showMenu && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.sideMenu, { backgroundColor: colors.surface }]}>
            <YStack space="md" padding={20}>
              <Text variant="headlineSmall" style={{ color: colors.onSurface }}>Menu</Text>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  router.push('/saved-routes');
                }}
              >
                <Ionicons name="bookmark-outline" size={24} color={colors.onSurface} />
                <Text style={{ color: colors.onSurface, marginLeft: 12 }}>Saved Routes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  router.push('/settings');
                }}
              >
                <Ionicons name="settings-outline" size={24} color={colors.onSurface} />
                <Text style={{ color: colors.onSurface, marginLeft: 12 }}>Settings</Text>
              </TouchableOpacity>
              
              <View style={[styles.separator, { backgroundColor: colors.outline }]} />
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  setShowRouteOptions(true);
                }}
              >
                <Ionicons name="options-outline" size={24} color={colors.onSurface} />
                <Text style={{ color: colors.onSurface, marginLeft: 12 }}>Route Options</Text>
              </TouchableOpacity>
            </YStack>
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <QuickActions
          hasRoute={hasRoute}
          routeInfo={routeInfo}
          onStartNavigation={() => {
            Alert.alert('Navigation', 'Turn-by-turn navigation would start here in a real implementation.');
          }}
          onSaveRoute={saveCurrentRoute}
          onShareRoute={() => {
            Alert.alert('Share Route', 'Route sharing functionality would be implemented here.');
          }}
          onShowDirections={() => {
            Animated.spring(bottomSheetHeight, {
              toValue: 500,
              useNativeDriver: false,
            }).start();
          }}
        />
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: colors.surface }]}
          onPress={getCurrentLocation}
        >
          <Ionicons name="locate" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        {canCalculateRoute && !hasRoute && (
          <TouchableOpacity 
            style={[styles.primaryFab, { backgroundColor: colors.primary }]}
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

        {hasRoute && (
          <TouchableOpacity 
            style={[styles.fab, { backgroundColor: colors.surface }]}
            onPress={clearRoute}
          >
            <Ionicons name="close" size={24} color={colors.onSurface} />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Sheet */}
      <Animated.View 
        style={[styles.bottomSheet, { 
          height: bottomSheetHeight,
          backgroundColor: colors.surface 
        }]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.bottomSheetHandle, { backgroundColor: colors.outline }]} />
        
        <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
          <YStack space="md" padding={20}>
            {!hasRoute ? (
              // Empty state
              <YStack space="md" alignItems="center" style={styles.emptyState}>
                <Ionicons name="map-outline" size={48} color={colors.outline} />
                <YStack space="sm" alignItems="center">
                  <Text variant="headlineSmall" style={{ color: colors.onSurface }}>
                    Plan Your Route
                  </Text>
                  <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
                    Enter your starting point and destination to get directions with real-time weather information
                  </Text>
                </YStack>
              </YStack>
            ) : (
              // Route information
              <YStack space="lg">
                {/* Route Summary */}
                <Card style={{ backgroundColor: colors.primaryContainer }}>
                  <YStack space="sm" padding={16}>
                    <Text variant="titleMedium" style={{ color: colors.onPrimaryContainer }}>
                      Route Summary
                    </Text>
                    <XStack space="lg">
                      <XStack alignItems="center" space="xs">
                        <Ionicons name="location" size={16} color={colors.onPrimaryContainer} />
                        <Text style={{ color: colors.onPrimaryContainer }}>
                          {formatDistance(routeInfo.distance)}
                        </Text>
                      </XStack>
                      <XStack alignItems="center" space="xs">
                        <Ionicons name="time" size={16} color={colors.onPrimaryContainer} />
                        <Text style={{ color: colors.onPrimaryContainer }}>
                          {formatDuration(routeInfo.duration)}
                        </Text>
                      </XStack>
                      <XStack alignItems="center" space="xs">
                        <Ionicons 
                          name={selectedVehicle === 'driving' ? 'car' : selectedVehicle === 'bicycle' ? 'bicycle' : 'walk'} 
                          size={16} 
                          color={colors.onPrimaryContainer} 
                        />
                        <Text style={{ color: colors.onPrimaryContainer }}>
                          {selectedVehicle}
                        </Text>
                      </XStack>
                    </XStack>
                  </YStack>
                </Card>

                {/* Route Alternatives */}
                {routeAlternatives.length > 1 && (
                  <RouteErrorBoundary>
                    <RouteAlternatives
                      alternatives={routeAlternatives}
                      selectedRouteId={selectedRouteId}
                      onRouteSelect={handleRouteSelect}
                    />
                  </RouteErrorBoundary>
                )}

                {/* Loaded Route Status */}
                {isRouteLoaded && (
                  <Card style={{ backgroundColor: colors.secondaryContainer }}>
                    <XStack alignItems="center" padding={16} space="sm">
                      <Ionicons name="folder-open" size={20} color={colors.onSecondaryContainer} />
                      <YStack flex={1}>
                        <Text style={{ color: colors.onSecondaryContainer }}>Loaded Route</Text>
                        <Text variant="bodySmall" style={{ color: colors.onSecondaryContainer }}>
                          {loadedRoute?.name}
                        </Text>
                      </YStack>
                    </XStack>
                  </Card>
                )}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </Animated.View>

      {/* Route Options Modal */}
      <RouteOptions
        isVisible={showRouteOptions}
        onClose={() => setShowRouteOptions(false)}
        onOptionsChange={(options) => {
          setRouteOptions(options);
          setSelectedVehicle(options.vehicle);
        }}
        currentOptions={routeOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Search bar
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },

  // Side menu
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 200,
  },
  sideMenu: {
    width: 280,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  separator: {
    height: 1,
    marginVertical: 8,
  },

  // Quick Actions
  quickActionsContainer: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    zIndex: 90,
  },

  // FABs
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 240,
    zIndex: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },

  // Bottom sheet
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  bottomSheetContent: {
    flex: 1,
  },
  
  // Empty state
  emptyState: {
    paddingVertical: 40,
  },
}); 