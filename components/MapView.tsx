import React, { useState, useRef } from 'react';
import { StyleSheet, Alert, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Location, WeatherPoint, Waypoint } from '@/types';
import { RouteAlternative } from '@/services/routingService';
// import { WeatherMarker } from './WeatherMarker';

interface MapViewComponentProps {
  startPoint?: Location;
  endPoint?: Location;
  waypoints?: Waypoint[];
  routeCoordinates?: Location[];
  routeAlternatives?: RouteAlternative[];
  selectedRouteId?: string;
  weatherPoints?: WeatherPoint[];
  onMapPress?: (location: Location) => void;
  onMapLongPress?: (location: Location) => void;
  onStartPointChange?: (location: Location) => void;
  onEndPointChange?: (location: Location) => void;
  onWaypointAdd?: (location: Location) => void;
  onWaypointRemove?: (waypointId: string) => void;
  onRouteAlternativePress?: (routeId: string) => void;
}

export function MapViewComponent({
  startPoint,
  endPoint,
  waypoints = [],
  routeCoordinates = [],
  routeAlternatives = [],
  selectedRouteId,
  weatherPoints = [],
  onMapPress,
  onMapLongPress,
  onStartPointChange,
  onEndPointChange,
  onWaypointAdd,
  onWaypointRemove,
  onRouteAlternativePress,
}: MapViewComponentProps) {
  const [selectedMarker, setSelectedMarker] = useState<{
    location: Location;
    type: 'start' | 'end' | 'waypoint';
    waypointId?: string;
  } | null>(null);
  const mapRef = useRef<MapView>(null);

  const handleMapPress = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    const location: Location = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    };
    
    if (onMapPress) {
      onMapPress(location);
    }
  };

  const handleMapLongPress = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    const location: Location = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    };
    
    if (onMapLongPress) {
      onMapLongPress(location);
    } else if (onWaypointAdd) {
      // Default behavior: add waypoint on long press
      Alert.alert(
        'Add Waypoint',
        'Do you want to add a waypoint at this location?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Add Waypoint', 
            onPress: () => onWaypointAdd(location)
          },
        ]
      );
    }
  };

  const handleMarkerPress = (location: Location, type: 'start' | 'end' | 'waypoint', waypointId?: string) => {
    setSelectedMarker({ location, type, waypointId });
    
    const title = type === 'start' ? 'Start Point' : 
                  type === 'end' ? 'End Point' : 
                  `Waypoint ${waypoints.find(w => w.id === waypointId)?.order || ''}`;
    
    const actions: any[] = [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Change', 
        onPress: () => {
          // Allow user to select a new point
          setSelectedMarker(null);
        }
      },
    ];

    // Add remove option for waypoints
    if (type === 'waypoint' && waypointId && onWaypointRemove) {
      actions.splice(1, 0, {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          onWaypointRemove(waypointId);
          setSelectedMarker(null);
        }
      });
    }
    
    Alert.alert(
      title,
      `${location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}`,
      actions
    );
  };

  const getRouteColor = (routeId: string, isSelected: boolean) => {
    if (isSelected) {
      return '#007AFF'; // Blue for selected route
    }
    
    switch (routeId) {
      case 'route-0':
        return '#007AFF'; // Blue for main route
      case 'route-1':
        return '#34C759'; // Green for first alternative
      case 'route-2':
        return '#FF9500'; // Orange for second alternative
      default:
        return '#8E8E93'; // Gray for other routes
    }
  };

  const getRouteStrokeWidth = (routeId: string, isSelected: boolean) => {
    if (isSelected) return 5;
    return routeId === 'route-0' ? 4 : 3;
  };

  const getRouteZIndex = (routeId: string, isSelected: boolean) => {
    if (isSelected) return 100;
    return routeId === 'route-0' ? 50 : 10;
  };

  const calculateRegion = () => {
    const allPoints = [
      ...(startPoint ? [startPoint] : []),
      ...(endPoint ? [endPoint] : []),
      ...waypoints.map(wp => wp.location),
      ...routeCoordinates,
      // Include all route alternatives in region calculation
      ...routeAlternatives.flatMap(alt => alt.geometry),
    ];

    if (allPoints.length > 0) {
      const latitudes = allPoints.map(coord => coord.latitude);
      const longitudes = allPoints.map(coord => coord.longitude);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      const deltaLat = maxLat - minLat;
      const deltaLng = maxLng - minLng;
      
      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(deltaLat * 1.2, 0.01),
        longitudeDelta: Math.max(deltaLng * 1.2, 0.01),
      };
    } else if (startPoint || endPoint) {
      const point = startPoint || endPoint!;
      return {
        latitude: point.latitude,
        longitude: point.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_DEFAULT}
      region={calculateRegion()}
      onPress={handleMapPress}
      onLongPress={handleMapLongPress}
      showsUserLocation
      showsMyLocationButton
    >
      {/* Route Alternatives Polylines (render first, so they appear behind selected route) */}
      {routeAlternatives.map((alternative) => {
        const isSelected = selectedRouteId === alternative.id;
        
        return (
          <Polyline
            key={alternative.id}
            coordinates={alternative.geometry.map(coord => ({
              latitude: coord.latitude,
              longitude: coord.longitude
            }))}
            strokeColor={getRouteColor(alternative.id, isSelected)}
            strokeWidth={getRouteStrokeWidth(alternative.id, isSelected)}
            zIndex={getRouteZIndex(alternative.id, isSelected)}
            lineDashPattern={isSelected ? undefined : [5, 5]} // Dashed line for non-selected alternatives
            tappable={true}
            onPress={() => {
              if (onRouteAlternativePress) {
                onRouteAlternativePress(alternative.id);
              }
            }}
          />
        );
      })}

      {/* Legacy route coordinates (for backward compatibility) */}
      {routeCoordinates.length > 0 && routeAlternatives.length === 0 && (
        <Polyline
          coordinates={routeCoordinates.map(coord => ({
            latitude: coord.latitude,
            longitude: coord.longitude
          }))}
          strokeColor="#007AFF"
          strokeWidth={4}
          zIndex={50}
        />
      )}

      {/* Start Point Marker */}
      {startPoint && (
        <Marker
          coordinate={startPoint}
          title="Start Point"
          description="Your starting location"
          pinColor="green"
          onPress={() => handleMarkerPress(startPoint, 'start')}
        />
      )}

      {/* Waypoint Markers */}
      {waypoints.map((waypoint) => (
        <Marker
          key={waypoint.id}
          coordinate={waypoint.location}
          title={`Waypoint ${waypoint.order}`}
          description={waypoint.location.address || "Intermediate stop"}
          pinColor="blue"
          onPress={() => handleMarkerPress(waypoint.location, 'waypoint', waypoint.id)}
        >
          {/* Custom marker view for waypoints */}
          <Text style={styles.waypointMarker}>{waypoint.order}</Text>
        </Marker>
      ))}

      {/* End Point Marker */}
      {endPoint && (
        <Marker
          coordinate={endPoint}
          title="End Point"
          description="Your destination"
          pinColor="red"
          onPress={() => handleMarkerPress(endPoint, 'end')}
        />
      )}

      {/* Weather Markers - Temporarily disabled */}
      {/* {weatherPoints.map((weatherPoint, index) => (
        <WeatherMarker
          key={index}
          weatherPoint={weatherPoint}
        />
      ))} */}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  waypointMarker: {
    backgroundColor: '#007AFF',
    color: 'white',
    borderRadius: 12,
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
}); 