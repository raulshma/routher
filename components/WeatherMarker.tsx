import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { WeatherPoint } from '@/types';

interface WeatherMarkerProps {
  weatherPoint: WeatherPoint;
}

export function WeatherMarker({ weatherPoint }: WeatherMarkerProps) {
  const getWeatherIcon = (iconCode: string) => {
    // Map OpenWeather icon codes to emojis
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '⛅',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌦️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️',
    };
    return iconMap[iconCode] || '🌤️';
  };

  const formatDistance = (distanceMeters: number) => {
    if (distanceMeters < 1000) {
      return `${Math.round(distanceMeters)}m`;
    }
    return `${Math.round(distanceMeters / 1000 * 10) / 10}km`;
  };

  return (
    <Marker
      coordinate={weatherPoint.location}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={styles.weatherMarker}>
        <Text style={styles.weatherIcon}>
          {getWeatherIcon(weatherPoint.weather.icon)}
        </Text>
        <Text style={styles.temperature}>
          {weatherPoint.weather.temperature}°
        </Text>
      </View>
      
      <Callout style={styles.callout}>
        <View style={styles.calloutContent}>
          <Text style={styles.calloutTitle}>
            Weather at {formatDistance(weatherPoint.distanceFromStart)}
          </Text>
          <Text style={styles.calloutDescription}>
            {weatherPoint.weather.description}
          </Text>
          <Text style={styles.calloutDetails}>
            Temperature: {weatherPoint.weather.temperature}°C
          </Text>
          <Text style={styles.calloutDetails}>
            Humidity: {weatherPoint.weather.humidity}%
          </Text>
          <Text style={styles.calloutDetails}>
            Wind: {weatherPoint.weather.windSpeed} m/s
          </Text>
          {weatherPoint.weather.precipitation > 0 && (
            <Text style={styles.calloutDetails}>
              Precipitation: {weatherPoint.weather.precipitation}mm
            </Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  weatherMarker: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  weatherIcon: {
    fontSize: 16,
  },
  temperature: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  callout: {
    width: 200,
  },
  calloutContent: {
    padding: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  calloutDetails: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
}); 