import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { YStack, XStack, Button, Text, Card, Separator } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SavedRoute, VehicleType, WeatherPoint, RoutePoint } from '@/types';
import { StorageService } from '@/services/storageService';
import { ExportService } from '@/services/exportService';
import { RouteDirections } from '@/components/RouteDirections';
import { WeatherSegment } from '@/components/WeatherSegment';

export default function RouteDetailsScreen() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const [route, setRoute] = useState<SavedRoute | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'directions' | 'weather'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExport = async (format: 'gpx' | 'kml' | 'both') => {
    if (!route) return;
    
    setIsExporting(true);
    try {
      switch (format) {
        case 'gpx':
          await ExportService.exportGPX(route);
          Alert.alert('Success', 'Route exported as GPX file');
          break;
        case 'kml':
          await ExportService.exportKML(route);
          Alert.alert('Success', 'Route exported as KML file');
          break;
        case 'both':
          await ExportService.exportBoth(route);
          Alert.alert('Success', 'Route exported as both GPX and KML files');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export route. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const showExportOptions = () => {
    const formats = ExportService.getSupportedFormats();
    
    Alert.alert(
      'Export Route',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `📍 ${formats[0].name} (${formats[0].extension})`,
          onPress: () => handleExport('gpx'),
        },
        {
          text: `🌍 ${formats[1].name} (${formats[1].extension})`,
          onPress: () => handleExport('kml'),
        },
        {
          text: '📦 Both Formats',
          onPress: () => handleExport('both'),
        },
      ]
    );
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
        <Stack.Screen options={{ title: 'Error' }} />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text fontSize="$4">Route not found</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: route.name,
        headerRight: () => (
          <XStack space="$2">
            <Button
              size="$3"
              backgroundColor={route.isFavorite ? "$yellow7" : "$gray7"}
              onPress={toggleFavorite}
              circular
            >
              {route.isFavorite ? "⭐" : "☆"}
            </Button>
          </XStack>
        ),
      }} />
      
      <ScrollView style={styles.scrollView}>
        <YStack padding="$4" space="$4">
          {/* Route Header */}
          <Card padding="$4" backgroundColor="$blue2">
            <YStack space="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$6" fontWeight="bold" color="$blue11">
                  {getVehicleIcon(route.vehicleType)} {route.name}
                </Text>
                {route.isFavorite && (
                  <Text fontSize="$5">⭐</Text>
                )}
              </XStack>
              
              <XStack justifyContent="space-between">
                <YStack alignItems="center">
                  <Text fontSize="$2" color="$blue10">Distance</Text>
                  <Text fontSize="$4" fontWeight="bold" color="$blue11">
                    {formatDistance(route.totalDistance)}
                  </Text>
                </YStack>
                <YStack alignItems="center">
                  <Text fontSize="$2" color="$blue10">Duration</Text>
                  <Text fontSize="$4" fontWeight="bold" color="$blue11">
                    {formatDuration(route.totalDuration)}
                  </Text>
                </YStack>
                <YStack alignItems="center">
                  <Text fontSize="$2" color="$blue10">Vehicle</Text>
                  <Text fontSize="$4" fontWeight="bold" color="$blue11">
                    {route.vehicleType}
                  </Text>
                </YStack>
              </XStack>
              
              <Text fontSize="$3" color="$blue10" textAlign="center">
                Created on {formatDate(route.createdAt)}
              </Text>
            </YStack>
          </Card>

          {/* Action Buttons */}
          <XStack space="$2" justifyContent="center">
            <Button
              onPress={shareRoute}
              backgroundColor="$green7"
              flex={1}
              disabled={isExporting}
            >
              📤 Share
            </Button>
            
            <Button
              onPress={showExportOptions}
              backgroundColor="$purple7"
              flex={1}
              disabled={isExporting}
            >
              {isExporting ? '⏳ Exporting...' : '💾 Export'}
            </Button>
          </XStack>

          {/* Export Info */}
          <Card padding="$3" backgroundColor="$gray1">
            <YStack space="$2">
              <Text fontSize="$4" fontWeight="bold">
                📁 Export Options
              </Text>
              <Text fontSize="$3" color="$gray11">
                • GPX: For GPS devices and navigation apps
              </Text>
              <Text fontSize="$3" color="$gray11">
                • KML: For Google Earth and Google Maps
              </Text>
              <Text fontSize="$2" color="$gray10">
                Exported files include route path, waypoints, and weather data
              </Text>
            </YStack>
          </Card>

          {/* Tab Navigation */}
          <XStack backgroundColor="$gray2" borderRadius="$3" padding="$1">
            {(['overview', 'directions', 'weather'] as const).map((tab) => (
              <Button
                key={tab}
                flex={1}
                size="$3"
                backgroundColor={activeTab === tab ? '$blue7' : 'transparent'}
                color={activeTab === tab ? 'white' : '$gray11'}
                onPress={() => setActiveTab(tab)}
              >
                {tab === 'overview' && '📋 Overview'}
                {tab === 'directions' && '🧭 Directions'}
                {tab === 'weather' && '🌤️ Weather'}
              </Button>
            ))}
          </XStack>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <YStack space="$3">
              {/* Route Points */}
              <Card padding="$4" backgroundColor="$background">
                <YStack space="$3">
                  <Text fontSize="$5" fontWeight="bold">
                    📍 Route Points
                  </Text>
                  
                  <YStack space="$2">
                    <XStack alignItems="center" space="$3">
                      <Text fontSize="$4">🟢</Text>
                      <YStack flex={1}>
                        <Text fontSize="$3" fontWeight="bold">Start</Text>
                        <Text fontSize="$2" color="$gray11">
                          {route.startPoint.address || `${route.startPoint.latitude.toFixed(4)}, ${route.startPoint.longitude.toFixed(4)}`}
                        </Text>
                      </YStack>
                    </XStack>

                    {route.intermediateWaypoints?.map((waypoint, index) => (
                      <XStack key={waypoint.id} alignItems="center" space="$3">
                        <Text fontSize="$4">🔵</Text>
                        <YStack flex={1}>
                          <Text fontSize="$3" fontWeight="bold">Stop {waypoint.order}</Text>
                          <Text fontSize="$2" color="$gray11">
                            {waypoint.location.address || `${waypoint.location.latitude.toFixed(4)}, ${waypoint.location.longitude.toFixed(4)}`}
                          </Text>
                        </YStack>
                      </XStack>
                    )) || null}

                    <XStack alignItems="center" space="$3">
                      <Text fontSize="$4">🔴</Text>
                      <YStack flex={1}>
                        <Text fontSize="$3" fontWeight="bold">Destination</Text>
                        <Text fontSize="$2" color="$gray11">
                          {route.endPoint.address || `${route.endPoint.latitude.toFixed(4)}, ${route.endPoint.longitude.toFixed(4)}`}
                        </Text>
                      </YStack>
                    </XStack>
                  </YStack>
                </YStack>
              </Card>

              {/* Route Statistics */}
              <Card padding="$4" backgroundColor="$background">
                <YStack space="$3">
                  <Text fontSize="$5" fontWeight="bold">
                    📊 Statistics
                  </Text>
                  
                  <XStack justifyContent="space-between">
                    <YStack alignItems="center">
                      <Text fontSize="$2" color="$gray11">Total Waypoints</Text>
                      <Text fontSize="$4" fontWeight="bold">
                        {(route.intermediateWaypoints?.length || 0) + 2}
                      </Text>
                    </YStack>
                    <YStack alignItems="center">
                      <Text fontSize="$2" color="$gray11">Weather Points</Text>
                      <Text fontSize="$4" fontWeight="bold">
                        {route.weatherPoints?.length || 0}
                      </Text>
                    </YStack>
                    <YStack alignItems="center">
                      <Text fontSize="$2" color="$gray11">Route Points</Text>
                      <Text fontSize="$4" fontWeight="bold">
                        {route.waypoints?.length || 0}
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>
              </Card>
            </YStack>
          )}

          {activeTab === 'directions' && route.waypoints && (
            <RouteDirections 
              waypoints={route.waypoints.map(wp => ({
                location: wp.location,
                instructions: 'Continue on route',
                distance: 0,
                duration: 0,
              }))}
            />
          )}

          {activeTab === 'weather' && route.weatherPoints && (
            <WeatherSegment weatherPoints={route.weatherPoints} />
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
}); 