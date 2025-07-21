import React, { useState, useRef } from 'react';
import { StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Location, WeatherPoint } from '@/types';
// import { WeatherMarker } from './WeatherMarker';

interface MapViewComponentProps {
  startPoint?: Location;
  endPoint?: Location;
  routeCoordinates?: Location[];
  weatherPoints?: WeatherPoint[];
  onMapPress?: (location: Location) => void;
  onStartPointChange?: (location: Location) => void;
  onEndPointChange?: (location: Location) => void;
}

export function MapViewComponent({
  startPoint,
  endPoint,
  routeCoordinates = [],
  weatherPoints = [],
  onMapPress,
  onStartPointChange,
  onEndPointChange,
}: MapViewComponentProps) {
  const [selectedMarker, setSelectedMarker] = useState<{
    location: Location;
    isStart: boolean;
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

  const handleMarkerPress = (location: Location, isStart: boolean) => {
    setSelectedMarker({ location, isStart });
    
    Alert.alert(
      isStart ? 'Start Point' : 'End Point',
      `${location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}`,
      [
        { 
          text: 'Change', 
          onPress: () => {
            // Allow user to select a new point
            setSelectedMarker(null);
          }
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const calculateRegion = () => {
    if (routeCoordinates.length > 0) {
      const latitudes = routeCoordinates.map(coord => coord.latitude);
      const longitudes = routeCoordinates.map(coord => coord.longitude);
      
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
      showsUserLocation
      showsMyLocationButton
    >
      {/* Start Point Marker */}
      {startPoint && (
        <Marker
          coordinate={startPoint}
          title="Start Point"
          description="Your starting location"
          pinColor="green"
          onPress={() => handleMarkerPress(startPoint, true)}
        />
      )}

      {/* End Point Marker */}
      {endPoint && (
        <Marker
          coordinate={endPoint}
          title="End Point"
          description="Your destination"
          pinColor="red"
          onPress={() => handleMarkerPress(endPoint, false)}
        />
      )}

      {/* Route Polyline */}
      {routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates.map(coord => ({
            latitude: coord.latitude,
            longitude: coord.longitude
          }))}
          strokeColor="#007AFF"
          strokeWidth={4}
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
}); 