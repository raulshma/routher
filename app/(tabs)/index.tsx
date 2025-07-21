import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { YStack, XStack, Button, Text, ScrollView } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { MapViewComponent } from '@/components/MapView';
import { VehicleSelector } from '@/components/VehicleSelector';
import { LocationSearch } from '@/components/LocationSearch';
import { Location as LocationType, VehicleType, Route, WeatherPoint } from '@/types';
import { RoutingService } from '@/services/routingService';
import { WeatherService } from '@/services/weatherService';
import { StorageService } from '@/services/storageService';
import { useRoute } from '@/contexts/RouteContext';

export default function RoutePlannerScreen() {
  const [startPoint, setStartPoint] = useState<LocationType | undefined>();
  const [endPoint, setEndPoint] = useState<LocationType | undefined>();
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('car');
  const [routeCoordinates, setRouteCoordinates] = useState<LocationType[]>([]);
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

  const requestLocationPermission = async () => {
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
  };

  const getCurrentLocation = async () => {
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
  };

  const calculateRoute = async () => {
    if (!startPoint || !endPoint) {
      Alert.alert('Missing Information', 'Please set both start and end points.');
      return;
    }

    setIsCalculatingRoute(true);
    
    try {
      // Calculate route
      const routePoints = await RoutingService.calculateRoute(
        startPoint,
        endPoint,
        selectedVehicle
      );

      // Generate weather points along the route
      const weatherLocations = RoutingService.generateRoutePointsAtIntervals(routePoints);
      const weatherData = await WeatherService.getWeatherForRoute(weatherLocations);
      
      const weatherPointsWithDistance: WeatherPoint[] = weatherLocations.map((location, index) => ({
        location,
        weather: weatherData[index],
        distanceFromStart: index * 1000, // Approximate distance in meters
      }));

      // Calculate total distance and duration
      const totalDistance = routePoints.reduce((sum, point) => sum + (point.distance || 0), 0);
      const totalDuration = routePoints.reduce((sum, point) => sum + (point.duration || 0), 0);

      setRouteCoordinates(routePoints.map(point => point.location));
      setWeatherPoints(weatherPointsWithDistance);
      setRouteInfo({
        distance: totalDistance,
        duration: totalDuration,
      });
    } catch (error) {
      console.error('Error calculating route:', error);
      Alert.alert('Error', 'Failed to calculate route. Please try again.');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const saveRoute = async () => {
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
  };

  const clearRoute = () => {
    setStartPoint(undefined);
    setEndPoint(undefined);
    setRouteCoordinates([]);
    setWeatherPoints([]);
    setRouteInfo(null);
    setLoadedRoute(null);
  };

  const loadRouteData = (route: Route) => {
    try {
      setStartPoint(route.startPoint);
      setEndPoint(route.endPoint);
      setSelectedVehicle(route.vehicleType);
      setRouteCoordinates(route.waypoints.map(wp => wp.location));
      setWeatherPoints(route.weatherPoints);
      setRouteInfo({
        distance: route.totalDistance,
        duration: route.totalDuration,
      });
      
      // Clear the loaded route after applying it
      setLoadedRoute(null);
    } catch (error) {
      console.error('Error loading route data:', error);
      Alert.alert('Error', 'Failed to load route data.');
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <YStack flex={1}>
        {/* Map View */}
        <YStack flex={1}>
          <MapViewComponent
            startPoint={startPoint}
            endPoint={endPoint}
            routeCoordinates={routeCoordinates}
            weatherPoints={weatherPoints}
            onStartPointChange={setStartPoint}
            onEndPointChange={setEndPoint}
          />
        </YStack>

        {/* Controls */}
        <ScrollView>
          <YStack padding="$3" space="$3" backgroundColor="$background">
            {/* Vehicle Selection */}
            <VehicleSelector
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
            />

            {/* Location Search */}
            <YStack space="$2">
              <Text fontSize="$3" fontWeight="bold">
                Search Locations
              </Text>
              <LocationSearch
                onLocationSelect={(location) => {
                  if (!startPoint) {
                    setStartPoint(location);
                  } else if (!endPoint) {
                    setEndPoint(location);
                  } else {
                    // If both are set, replace end point
                    setEndPoint(location);
                  }
                }}
                placeholder="Search for addresses, landmarks, or places..."
              />
            </YStack>

            {/* Location Controls */}
            <XStack space="$2">
              <Button flex={1} onPress={getCurrentLocation}>
                📍 Use Current Location
              </Button>
              <Button flex={1} variant="outlined" onPress={clearRoute}>
                Clear
              </Button>
            </XStack>

            {/* Location Display */}
            {(startPoint || endPoint) && (
              <YStack space="$2" padding="$3" backgroundColor="$gray2" borderRadius="$3">
                {startPoint && (
                  <Text fontSize="$3">
                    📍 Start: {startPoint.address || `${startPoint.latitude.toFixed(4)}, ${startPoint.longitude.toFixed(4)}`}
                  </Text>
                )}
                {endPoint && (
                  <Text fontSize="$3">
                    🎯 End: {endPoint.address || `${endPoint.latitude.toFixed(4)}, ${endPoint.longitude.toFixed(4)}`}
                  </Text>
                )}
              </YStack>
            )}

            {/* Route Calculation */}
            <XStack space="$2">
              <Button
                flex={1}
                backgroundColor="$blue7"
                disabled={!startPoint || !endPoint || isCalculatingRoute}
                onPress={calculateRoute}
              >
                {isCalculatingRoute ? 'Calculating...' : '🧭 Get Directions'}
              </Button>
              
              {routeInfo && (
                <Button flex={1} variant="outlined" onPress={saveRoute}>
                  💾 Save Route
                </Button>
              )}
            </XStack>

            {/* Route Information */}
            {routeInfo && (
              <YStack space="$2" padding="$3" backgroundColor="$blue2" borderRadius="$3">
                <Text fontSize="$4" fontWeight="bold" textAlign="center">
                  Route Information
                </Text>
                <XStack justifyContent="space-between">
                  <Text fontSize="$3">
                    📏 Distance: {formatDistance(routeInfo.distance)}
                  </Text>
                  <Text fontSize="$3">
                    ⏱️ Duration: {formatDuration(routeInfo.duration)}
                  </Text>
                </XStack>
                <Text fontSize="$2" color="$gray11" textAlign="center">
                  Weather shown at 1km intervals along route
                </Text>
              </YStack>
            )}

            {/* Loaded Route Indicator */}
            {isRouteLoaded && (
              <YStack padding="$3" backgroundColor="$green2" borderRadius="$3">
                <Text fontSize="$3" textAlign="center" color="$green11" fontWeight="bold">
                  📍 Route "{loadedRoute?.name}" loaded from saved routes
                </Text>
              </YStack>
            )}

            {/* Instructions */}
            {!startPoint && !endPoint && !isRouteLoaded && (
              <YStack padding="$3" backgroundColor="$gray1" borderRadius="$3">
                <Text fontSize="$3" textAlign="center" color="$gray11">
                  Tap on the map to set start and end points, or use "Use Current Location" button
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
