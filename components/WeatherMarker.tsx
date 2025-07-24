import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { WeatherPoint } from '@/types';

interface WeatherMarkerProps {
  weatherPoint: WeatherPoint;
}

export function WeatherMarker({ weatherPoint }: WeatherMarkerProps) {
  const getWeatherIcon = (weather: WeatherPoint['weather']) => {
    // Use the condition field for more accurate icons
    switch (weather.condition) {
      case 'sunny':
        return '☀️';
      case 'partly-cloudy':
        return '⛅';
      case 'cloudy':
        return '☁️';
      case 'rainy':
        return '🌧️';
      case 'heavy-rain':
        return '🌦️';
      case 'thunderstorm':
        return '⛈️';
      case 'snow':
        return '❄️';
      case 'fog':
        return '🌫️';
      default:
        return '🌤️';
    }
  };

  const getWeatherGradient = (condition: string): [string, string] => {
    switch (condition) {
      case 'sunny':
        return ['#FCD34D', '#F59E0B'];
      case 'partly-cloudy':
        return ['#60A5FA', '#3B82F6'];
      case 'cloudy':
        return ['#9CA3AF', '#6B7280'];
      case 'rainy':
        return ['#3B82F6', '#1E40AF'];
      case 'heavy-rain':
        return ['#1E40AF', '#1E3A8A'];
      case 'thunderstorm':
        return ['#7C3AED', '#5B21B6'];
      case 'snow':
        return ['#E5E7EB', '#D1D5DB'];
      case 'fog':
        return ['#F3F4F6', '#E5E7EB'];
      default:
        return ['#60A5FA', '#3B82F6'];
    }
  };

  const getTemperatureColor = (temp: number): string => {
    if (temp <= 0) return '#3B82F6';
    if (temp <= 10) return '#06B6D4';
    if (temp <= 20) return '#10B981';
    if (temp <= 30) return '#F59E0B';
    return '#EF4444';
  };

  const formatDistance = (distanceMeters: number) => {
    if (distanceMeters < 1000) {
      return `${Math.round(distanceMeters)}m`;
    }
    return `${Math.round((distanceMeters / 1000) * 10) / 10}km`;
  };

  const gradient = getWeatherGradient(weatherPoint.weather.condition);

  return (
    <Marker coordinate={weatherPoint.location} anchor={{ x: 0.5, y: 0.5 }}>
      <View style={styles.markerContainer}>
        <LinearGradient
          colors={gradient}
          style={styles.weatherMarker}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.weatherIcon}>{getWeatherIcon(weatherPoint.weather)}</Text>
          <Text
            style={[
              styles.temperature,
              { color: getTemperatureColor(weatherPoint.weather.temperature) },
            ]}
          >
            {weatherPoint.weather.temperature}°
          </Text>
        </LinearGradient>
        <View style={styles.markerPulse} />
      </View>

      <Callout style={styles.callout}>
        <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.calloutGradient}>
          <View style={styles.calloutContent}>
            <View style={styles.calloutHeader}>
              <Text style={styles.weatherIconLarge}>{getWeatherIcon(weatherPoint.weather)}</Text>
              <View style={styles.calloutHeaderText}>
                <Text style={styles.calloutTitle}>
                  {formatDistance(weatherPoint.distanceFromStart)}
                </Text>
                <Text style={styles.calloutDescription}>{weatherPoint.weather.description}</Text>
              </View>
            </View>

            <View style={styles.calloutStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weatherPoint.weather.temperature}°C</Text>
                <Text style={styles.statLabel}>Temperature</Text>
              </View>

              {weatherPoint.weather.chanceOfRain > 20 && (
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#3B82F6' }]}>
                    {weatherPoint.weather.chanceOfRain}%
                  </Text>
                  <Text style={styles.statLabel}>Rain Chance</Text>
                </View>
              )}

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weatherPoint.weather.humidity}%</Text>
                <Text style={styles.statLabel}>Humidity</Text>
              </View>
            </View>

            <View style={styles.calloutDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>💨</Text>
                <Text style={styles.detailText}>
                  Wind: {weatherPoint.weather.windSpeed.toFixed(1)} m/s
                </Text>
              </View>

              {weatherPoint.weather.precipitation > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>🌧️</Text>
                  <Text style={styles.detailText}>
                    Precipitation: {weatherPoint.weather.precipitation.toFixed(1)}mm
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherMarker: {
    borderRadius: 28,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
    minHeight: 56,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  markerPulse: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    zIndex: -1,
  },
  weatherIcon: {
    fontSize: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  temperature: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  callout: {
    width: 280,
    borderRadius: 16,
    overflow: 'hidden',
  },
  calloutGradient: {
    borderRadius: 16,
  },
  calloutContent: {
    padding: 16,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherIconLarge: {
    fontSize: 32,
    marginRight: 12,
  },
  calloutHeaderText: {
    flex: 1,
  },
  calloutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  calloutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calloutDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 24,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
    flex: 1,
  },
});
