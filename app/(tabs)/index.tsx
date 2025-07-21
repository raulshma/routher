import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { YStack, XStack, Button, Text, ScrollView, Switch } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { MapViewComponent } from '@/components/MapView';
import { VehicleSelector } from '@/components/VehicleSelector';
import { LocationSearch } from '@/components/LocationSearch';
import { RouteOptions } from '@/components/RouteOptions';
import { Location as LocationType, VehicleType, Route, WeatherPoint, Waypoint } from '@/types';
import { RoutingService, RouteAlternative } from '@/services/routingService';
import { WeatherService } from '@/services/weatherService';
import { StorageService } from '@/services/storageService';
import { useRoute } from '@/contexts/RouteContext';

export default function RoutePlannerScreen() {
  const [startPoint, setStartPoint] = useState<LocationType | undefined>();
  const [endPoint, setEndPoint] = useState<LocationType | undefined>();
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('car');
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

  const addWaypoint = (location: LocationType) => {
    const newWaypoint: Waypoint = {
      id: Date.now().toString(),
      location,
      order: waypoints.length + 1,
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const removeWaypoint = (waypointId: string) => {
    const updatedWaypoints = waypoints
      .filter(wp => wp.id !== waypointId)
      .map((wp, index) => ({ ...wp, order: index + 1 })); // Reorder after removal
    setWaypoints(updatedWaypoints);
  };

  const reorderWaypoint = (waypointId: string, newOrder: number) => {
    const updatedWaypoints = waypoints.map(wp => {
      if (wp.id === waypointId) {
        return { ...wp, order: newOrder };
      }
      // Adjust other waypoint orders
      if (wp.order >= newOrder) {
        return { ...wp, order: wp.order + 1 };
      }
      return wp;
    }).sort((a, b) => a.order - b.order);
    
    setWaypoints(updatedWaypoints);
  };

  const calculateRoute = async () => {
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
  };

  const handleRouteSelect = (routeId: string, alternative: RouteAlternative) => {
    setSelectedRouteId(routeId);
    
    // Update route info and weather for selected route
    setRouteInfo({
      distance: alternative.totalDistance,
      duration: alternative.totalDuration,
    });
    setRouteCoordinates(alternative.routePoints.map(point => point.location));
    
    // Optionally recalculate weather for the new route
    // (for now, we'll keep the existing weather data)
  };

  const handleRouteAlternativePress = (routeId: string) => {
    const alternative = routeAlternatives.find(alt => alt.id === routeId);
    if (alternative) {
      handleRouteSelect(routeId, alternative);
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
  };

  const clearRoute = () => {
    setStartPoint(undefined);
    setEndPoint(undefined);
    setWaypoints([]);
    setRouteCoordinates([]);
    setRouteAlternatives([]);
    setSelectedRouteId('route-0');
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
      setWaypoints(route.intermediateWaypoints || []);
      setRouteAlternatives([]);
      setSelectedRouteId('route-0');
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
        </YStack>

        {/* Controls */}
        <ScrollView>
          <YStack padding="$3" space="$3" backgroundColor="$background">
            {/* Vehicle Selection */}
            <VehicleSelector
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
            />

            {/* Alternative Routes Toggle */}
            <XStack justifyContent="space-between" alignItems="center" padding="$2" backgroundColor="$gray1" borderRadius="$3">
              <Text fontSize="$3" fontWeight="bold">
                🔄 Show Route Alternatives
              </Text>
              <Switch
                checked={showAlternatives}
                onCheckedChange={setShowAlternatives}
                size="$3"
              />
            </XStack>

            {/* Route Alternatives Display */}
            {routeAlternatives.length > 0 && (
              <RouteOptions
                alternatives={routeAlternatives}
                selectedRouteId={selectedRouteId}
                onRouteSelect={handleRouteSelect}
              />
            )}

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
                    // If both are set, add as waypoint
                    addWaypoint(location);
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
            {(startPoint || endPoint || waypoints.length > 0) && (
              <YStack space="$2" padding="$3" backgroundColor="$gray2" borderRadius="$3">
                {startPoint && (
                  <Text fontSize="$3">
                    📍 Start: {startPoint.address || `${startPoint.latitude.toFixed(4)}, ${startPoint.longitude.toFixed(4)}`}
                  </Text>
                )}
                {waypoints.map((waypoint) => (
                  <XStack key={waypoint.id} justifyContent="space-between" alignItems="center">
                    <Text fontSize="$3" flex={1}>
                      🔵 Stop {waypoint.order}: {waypoint.location.address || `${waypoint.location.latitude.toFixed(4)}, ${waypoint.location.longitude.toFixed(4)}`}
                    </Text>
                    <Button
                      size="$2"
                      backgroundColor="$red7"
                      onPress={() => removeWaypoint(waypoint.id)}
                    >
                      ✕
                    </Button>
                  </XStack>
                ))}
                {endPoint && (
                  <Text fontSize="$3">
                    🎯 End: {endPoint.address || `${endPoint.latitude.toFixed(4)}, ${endPoint.longitude.toFixed(4)}`}
                  </Text>
                )}
              </YStack>
            )}

            {/* Waypoint Instructions */}
            {waypoints.length === 0 && startPoint && endPoint && (
              <YStack padding="$3" backgroundColor="$blue1" borderRadius="$3">
                <Text fontSize="$3" textAlign="center" color="$blue11">
                  💡 Long press on the map to add waypoints (intermediate stops)
                </Text>
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
                {isCalculatingRoute ? 'Calculating...' : showAlternatives ? '🗺️ Get Route Options' : '🧭 Get Directions'}
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
                  {routeAlternatives.length > 0 && (
                    <Text fontSize="$3" color="$blue11">
                      {' '}({routeAlternatives.find(alt => alt.id === selectedRouteId)?.description || 'Selected route'})
                    </Text>
                  )}
                </Text>
                <XStack justifyContent="space-between">
                  <Text fontSize="$3">
                    📏 Distance: {formatDistance(routeInfo.distance)}
                  </Text>
                  <Text fontSize="$3">
                    ⏱️ Duration: {formatDuration(routeInfo.duration)}
                  </Text>
                </XStack>
                {waypoints.length > 0 && (
                  <Text fontSize="$3" textAlign="center">
                    🔢 Stops: {waypoints.length} waypoint{waypoints.length > 1 ? 's' : ''}
                  </Text>
                )}
                {routeAlternatives.length > 0 && (
                  <Text fontSize="$3" textAlign="center">
                    🗺️ Alternatives: {routeAlternatives.length} route{routeAlternatives.length > 1 ? 's' : ''}
                  </Text>
                )}
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
