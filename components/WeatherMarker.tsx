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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 8,
    borderWidth: 2,
    borderColor: '#06B6D4',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  weatherIcon: {
    fontSize: 18,
  },
  temperature: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#06B6D4',
    marginTop: 2,
  },
  callout: {
    width: 220,
    borderRadius: 12,
  },
  calloutContent: {
    padding: 12,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1F2937',
  },
  calloutDescription: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
    textTransform: 'capitalize',
    color: '#6B7280',
  },
  calloutDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 3,
  },
}); 