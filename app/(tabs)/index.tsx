import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { YStack, XStack, Button, Text, ScrollView, Switch } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

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
    if (isRouteLoaded) {
      setLoadedRoute(null);
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <YStack flex={1}>
        {/* Map View with Error Boundary */}
        <YStack flex={1}>
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
        </YStack>

        {/* Controls */}
        <ScrollView>
          <YStack padding={24} space="lg">
            {/* Vehicle Selection */}
            <VehicleSelector
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
            />

            {/* Alternative Routes Toggle */}
            <XStack justifyContent="space-between" alignItems="center" padding={16} borderRadius={12}>
              <Text variant="titleMedium" fontWeight="600">
                🔄 Show Route Alternatives
              </Text>
              <Switch
                checked={showAlternatives}
                onCheckedChange={setShowAlternatives}
              />
            </XStack>

            {/* Route Alternatives Display with Error Boundary */}
            {routeAlternatives.length > 0 && (
              <RouteErrorBoundary>
                <RouteAlternatives
                  alternatives={routeAlternatives}
                  selectedRouteId={selectedRouteId}
                  onRouteSelect={handleRouteSelect}
                />
              </RouteErrorBoundary>
            )}

            {/* Location Search with Error Boundary */}
            <SearchErrorBoundary>
              <LocationSearch
                onLocationSelect={setStartPoint}
                placeholder="Search for starting location..."
                buttonText="Set Start"
              />

              <LocationSearch
                onLocationSelect={setEndPoint}
                placeholder="Search for destination..."
                buttonText="Set End"
              />
            </SearchErrorBoundary>

            {/* Action Buttons */}
            <XStack space="md" justifyContent="center">
              <Button
                onPress={getCurrentLocation}
                variant="tonal"
                style={{ flex: 1 }}
              >
                📍 Use Current Location
              </Button>
              
              <Button
                onPress={calculateRoute}
                disabled={!canCalculateRoute}
                variant="filled"
                style={{ flex: 1 }}
              >
                {isCalculatingRoute ? 'Calculating...' : '🗺️ Get Directions'}
              </Button>
            </XStack>

            {/* Route Information */}
            {routeStats && (
              <YStack space="sm" padding={24} borderRadius={12}>
                <Text variant="titleMedium" fontWeight="600" textAlign="center">
                  Route Information
                </Text>
                <XStack justifyContent="space-around">
                  <YStack alignItems="center">
                    <Text variant="bodySmall">Distance</Text>
                    <Text variant="titleSmall" fontWeight="600">{routeStats.distance}</Text>
                  </YStack>
                  <YStack alignItems="center">
                    <Text variant="bodySmall">Duration</Text>
                    <Text variant="titleSmall" fontWeight="600">{routeStats.duration}</Text>
                  </YStack>
                  <YStack alignItems="center">
                    <Text variant="bodySmall">Waypoints</Text>
                    <Text variant="titleSmall" fontWeight="600">{routeStats.waypoints}</Text>
                  </YStack>
                </XStack>
              </YStack>
            )}

            {/* Save/Clear Route */}
            <XStack space="md" justifyContent="center">
              <Button
                onPress={saveRoute}
                disabled={!routeInfo}
                variant="tonal"
                style={{ flex: 1 }}
              >
                💾 Save Route
              </Button>
              
              <Button
                onPress={clearRoute}
                variant="outlined"
                style={{ flex: 1 }}
              >
                🗑️ Clear Route
              </Button>
            </XStack>

            {/* Route Status */}
            {isRouteLoaded && (
              <YStack padding={16} borderRadius={12}>
                <Text variant="bodyMedium" textAlign="center">
                  📂 Loaded saved route: "{loadedRoute?.name}"
                </Text>
              </YStack>
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
