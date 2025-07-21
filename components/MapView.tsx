import React, { useState, useRef, useCallback, useMemo } from 'react';
import { StyleSheet, Alert, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Location, WeatherPoint, Waypoint } from '@/types';
import { RouteAlternative } from '@/services/routingService';

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

const MapViewComponent = React.memo(({
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
}: MapViewComponentProps) => {
  const [selectedMarker, setSelectedMarker] = useState<{
    location: Location;
    type: 'start' | 'end' | 'waypoint';
    waypointId?: string;
  } | null>(null);
  const mapRef = useRef<MapView>(null);

  const handleMapPress = useCallback((event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    const location: Location = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    };
    
    if (onMapPress) {
      onMapPress(location);
    }
  }, [onMapPress]);

  const handleMapLongPress = useCallback((event: any) => {
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
  }, [onMapLongPress, onWaypointAdd]);

  const handleMarkerPress = useCallback((location: Location, type: 'start' | 'end' | 'waypoint', waypointId?: string) => {
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

    if (type === 'waypoint' && waypointId && onWaypointRemove) {
      actions.push({
        text: 'Remove Waypoint',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Remove Waypoint',
            'Are you sure you want to remove this waypoint?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                  onWaypointRemove(waypointId);
                  setSelectedMarker(null);
                },
              },
            ]
          );
        },
      });
    }

    Alert.alert(title, location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`, actions);
  }, [waypoints, onWaypointRemove]);

  // Google Maps style route colors
  const routeColors = useMemo(() => ({
    'route-0': '#4285F4', // Google Blue
    'route-1': '#34A853', // Google Green
    'route-2': '#FBBC04', // Google Yellow
  }), []);

  const getRouteColor = useCallback((routeId: string, isSelected: boolean) => {
    if (isSelected) return routeColors[routeId as keyof typeof routeColors] || '#4285F4';
    return '#9AA0A6'; // Google Gray
  }, [routeColors]);

  const getRouteStrokeWidth = useCallback((routeId: string, isSelected: boolean) => {
    return isSelected ? 6 : 4;
  }, []);

  const getRouteZIndex = useCallback((routeId: string, isSelected: boolean) => {
    return isSelected ? 100 : 50;
  }, []);

  const calculateRegion = useMemo(() => {
    const allPoints: Location[] = [];
    
    if (startPoint) allPoints.push(startPoint);
    if (endPoint) allPoints.push(endPoint);
    if (waypoints) allPoints.push(...waypoints.map(wp => wp.location));
    if (routeCoordinates.length > 0) allPoints.push(...routeCoordinates);
    
    if (allPoints.length === 0) {
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
    
    const latitudes = allPoints.map(point => point.latitude);
    const longitudes = allPoints.map(point => point.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const latDelta = Math.max(maxLat - minLat, 0.01) * 1.3;
    const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.3;
    
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [startPoint, endPoint, waypoints, routeCoordinates]);

  // Memoized route alternative coordinates
  const routeAlternativeCoordinates = useMemo(() => {
    return routeAlternatives.map(alternative => ({
      id: alternative.id,
      coordinates: alternative.geometry.map(coord => ({
        latitude: coord.latitude,
        longitude: coord.longitude
      })),
      isSelected: selectedRouteId === alternative.id,
    }));
  }, [routeAlternatives, selectedRouteId]);

  // Memoized legacy route coordinates
  const legacyRouteCoordinates = useMemo(() => {
    return routeCoordinates.map(coord => ({
      latitude: coord.latitude,
      longitude: coord.longitude
    }));
  }, [routeCoordinates]);

  const handleRouteAlternativePress = useCallback((routeId: string) => {
    if (onRouteAlternativePress) {
      onRouteAlternativePress(routeId);
    }
  }, [onRouteAlternativePress]);

  // Google Maps style markers
  const StartMarker = () => (
    <View style={styles.startMarker}>
      <View style={styles.startMarkerInner}>
        <Text style={styles.markerText}>A</Text>
      </View>
    </View>
  );

  const EndMarker = () => (
    <View style={styles.endMarker}>
      <View style={styles.endMarkerInner}>
        <Text style={styles.markerText}>B</Text>
      </View>
    </View>
  );

  const WaypointMarker = ({ order }: { order: number }) => (
    <View style={styles.waypointMarker}>
      <View style={styles.waypointMarkerInner}>
        <Text style={styles.waypointMarkerText}>{order}</Text>
      </View>
    </View>
  );

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_DEFAULT}
      region={calculateRegion}
      onPress={handleMapPress}
      onLongPress={handleMapLongPress}
      showsUserLocation
      showsMyLocationButton={false} // We'll use our custom FAB
      loadingEnabled
      loadingIndicatorColor="#4285F4"
      loadingBackgroundColor="#FFFFFF"
      mapType="standard"
      showsCompass={false}
      showsScale={false}
      showsBuildings
      showsTraffic={false}
      showsIndoors
      toolbarEnabled={false}
    >
      {/* Route Alternatives Polylines (render first, so they appear behind selected route) */}
      {routeAlternativeCoordinates.map((route) => (
        <Polyline
          key={route.id}
          coordinates={route.coordinates}
          strokeColor={getRouteColor(route.id, route.isSelected)}
          strokeWidth={getRouteStrokeWidth(route.id, route.isSelected)}
          zIndex={getRouteZIndex(route.id, route.isSelected)}
          lineDashPattern={route.isSelected ? undefined : [10, 10]} // Dashed line for non-selected alternatives
          tappable={true}
          onPress={() => handleRouteAlternativePress(route.id)}
        />
      ))}

      {/* Legacy route coordinates (for backward compatibility) */}
      {legacyRouteCoordinates.length > 0 && routeAlternatives.length === 0 && (
        <Polyline
          coordinates={legacyRouteCoordinates}
          strokeColor="#4285F4"
          strokeWidth={6}
          zIndex={50}
        />
      )}

      {/* Start Point Marker */}
      {startPoint && (
        <Marker
          coordinate={startPoint}
          title="Start Point"
          description="Your starting location"
          onPress={() => handleMarkerPress(startPoint, 'start')}
          anchor={{ x: 0.5, y: 1 }}
        >
          <StartMarker />
        </Marker>
      )}

      {/* Waypoint Markers */}
      {waypoints.map((waypoint) => (
        <Marker
          key={waypoint.id}
          coordinate={waypoint.location}
          title={`Waypoint ${waypoint.order}`}
          description={waypoint.location.address || "Intermediate stop"}
          onPress={() => handleMarkerPress(waypoint.location, 'waypoint', waypoint.id)}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <WaypointMarker order={waypoint.order} />
        </Marker>
      ))}

      {/* End Point Marker */}
      {endPoint && (
        <Marker
          coordinate={endPoint}
          title="End Point"
          description="Your destination"
          onPress={() => handleMarkerPress(endPoint, 'end')}
          anchor={{ x: 0.5, y: 1 }}
        >
          <EndMarker />
        </Marker>
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
});

MapViewComponent.displayName = 'MapViewComponent';

export { MapViewComponent };

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  // Google Maps style start marker (Green)
  startMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  startMarkerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34A853',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  // Google Maps style end marker (Red)
  endMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  endMarkerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA4335',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Google Maps style waypoint marker (Blue)
  waypointMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  waypointMarkerInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  waypointMarkerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 