import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { YStack, XStack, Text, Card, Button } from 'tamagui';
import { WeatherPoint } from '@/types';

interface WeatherSegmentProps {
  weatherPoints: WeatherPoint[];
}

export function WeatherSegment({ weatherPoints }: WeatherSegmentProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${Math.round(meters / 1000 * 10) / 10}km`;
  };

  const getWeatherIcon = (iconCode: string) => {
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

  const getTemperatureColor = (temp: number) => {
    if (temp <= 0) return '$blue9';
    if (temp <= 10) return '$blue7';
    if (temp <= 20) return '$green7';
    if (temp <= 30) return '$yellow7';
    return '$red7';
  };

  const getWeatherConditionColor = (description: string) => {
    const lower = description.toLowerCase();
    if (lower.includes('rain') || lower.includes('storm')) return '$blue9';
    if (lower.includes('snow')) return '$gray9';
    if (lower.includes('cloud')) return '$gray7';
    if (lower.includes('clear') || lower.includes('sun')) return '$yellow7';
    return '$gray7';
  };

  if (!weatherPoints || weatherPoints.length === 0) {
    return (
      <Card padding="$4" backgroundColor="$gray2">
        <YStack alignItems="center" space="$3">
          <Text fontSize="$6">🌤️</Text>
          <Text fontSize="$4" fontWeight="bold" textAlign="center">
            No Weather Data Available
          </Text>
          <Text fontSize="$3" color="$gray11" textAlign="center">
            Weather information is not available for this route.
          </Text>
        </YStack>
      </Card>
    );
  }

  // Calculate weather summary
  const avgTemp = Math.round(
    weatherPoints.reduce((sum, wp) => sum + wp.weather.temperature, 0) / weatherPoints.length
  );
  const avgHumidity = Math.round(
    weatherPoints.reduce((sum, wp) => sum + wp.weather.humidity, 0) / weatherPoints.length
  );
  const maxPrecipitation = Math.max(
    ...weatherPoints.map(wp => wp.weather.precipitation)
  );

  return (
    <YStack space="$3">
      <Text fontSize="$5" fontWeight="bold">
        Weather Along Route
      </Text>
      
      {/* Weather Summary */}
      <Card padding="$3" backgroundColor="$blue2">
        <YStack space="$3">
          <Text fontSize="$4" fontWeight="bold">
            Weather Summary
          </Text>
          <XStack justifyContent="space-around">
            <YStack alignItems="center">
              <Text fontSize="$4" fontWeight="bold" color={getTemperatureColor(avgTemp)}>
                {avgTemp}°C
              </Text>
              <Text fontSize="$2" color="$gray11">
                Avg Temp
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize="$4" fontWeight="bold">
                {avgHumidity}%
              </Text>
              <Text fontSize="$2" color="$gray11">
                Avg Humidity
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize="$4" fontWeight="bold">
                {maxPrecipitation.toFixed(1)}mm
              </Text>
              <Text fontSize="$2" color="$gray11">
                Max Rain
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </Card>

      {/* Weather Points */}
      <Text fontSize="$4" fontWeight="600">
        Weather at {weatherPoints.length} kilometer intervals
      </Text>
      
      {weatherPoints.map((weatherPoint, index) => (
        <Card 
          key={index} 
          padding="$3" 
          backgroundColor={selectedIndex === index ? '$blue1' : '$background'}
          borderColor={selectedIndex === index ? '$blue7' : '$gray6'}
          borderWidth={1}
          onPress={() => setSelectedIndex(selectedIndex === index ? null : index)}
        >
          <XStack space="$3" alignItems="center">
            {/* Distance Marker */}
            <YStack alignItems="center" minWidth={60}>
              <YStack
                width={32}
                height={32}
                backgroundColor="$blue7"
                borderRadius={16}
                alignItems="center"
                justifyContent="center"
                marginBottom="$1"
              >
                <Text fontSize="$2" color="white" fontWeight="bold">
                  {Math.round(weatherPoint.distanceFromStart / 1000)}
                </Text>
              </YStack>
              <Text fontSize="$1" color="$gray11">
                km
              </Text>
            </YStack>

            {/* Weather Icon */}
            <Text fontSize="$6">
              {getWeatherIcon(weatherPoint.weather.icon)}
            </Text>

            {/* Weather Info */}
            <YStack flex={1} space="$1">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$4" fontWeight="bold" color={getTemperatureColor(weatherPoint.weather.temperature)}>
                  {weatherPoint.weather.temperature}°C
                </Text>
                <Text fontSize="$2" color="$gray11">
                  {formatDistance(weatherPoint.distanceFromStart)} from start
                </Text>
              </XStack>
              
              <Text 
                fontSize="$3" 
                color={getWeatherConditionColor(weatherPoint.weather.description)}
                style={{ textTransform: 'capitalize' }}
              >
                {weatherPoint.weather.description}
              </Text>
              
              <XStack space="$3">
                <Text fontSize="$2" color="$gray11">
                  💧 {weatherPoint.weather.humidity}%
                </Text>
                <Text fontSize="$2" color="$gray11">
                  💨 {weatherPoint.weather.windSpeed.toFixed(1)} m/s
                </Text>
                {weatherPoint.weather.precipitation > 0 && (
                  <Text fontSize="$2" color="$blue9">
                    🌧️ {weatherPoint.weather.precipitation.toFixed(1)}mm
                  </Text>
                )}
              </XStack>
            </YStack>

            {/* Expand Icon */}
            <Text fontSize="$3" color="$gray9">
              {selectedIndex === index ? '▼' : '▶'}
            </Text>
          </XStack>

          {/* Expanded Details */}
          {selectedIndex === index && (
            <YStack marginTop="$3" paddingTop="$3" borderTopWidth={1} borderColor="$gray4">
              <YStack space="$2">
                <Text fontSize="$3" fontWeight="bold">
                  Detailed Weather Information
                </Text>
                
                <XStack justifyContent="space-between">
                  <Text fontSize="$2" color="$gray11">Temperature:</Text>
                  <Text fontSize="$2">{weatherPoint.weather.temperature}°C</Text>
                </XStack>
                
                <XStack justifyContent="space-between">
                  <Text fontSize="$2" color="$gray11">Humidity:</Text>
                  <Text fontSize="$2">{weatherPoint.weather.humidity}%</Text>
                </XStack>
                
                <XStack justifyContent="space-between">
                  <Text fontSize="$2" color="$gray11">Wind Speed:</Text>
                  <Text fontSize="$2">{weatherPoint.weather.windSpeed.toFixed(1)} m/s</Text>
                </XStack>
                
                <XStack justifyContent="space-between">
                  <Text fontSize="$2" color="$gray11">Precipitation:</Text>
                  <Text fontSize="$2">{weatherPoint.weather.precipitation.toFixed(1)}mm</Text>
                </XStack>
                
                <XStack justifyContent="space-between">
                  <Text fontSize="$2" color="$gray11">Location:</Text>
                  <Text fontSize="$2">
                    {weatherPoint.location.latitude.toFixed(4)}, {weatherPoint.location.longitude.toFixed(4)}
                  </Text>
                </XStack>
              </YStack>
            </YStack>
          )}
        </Card>
      ))}

      {/* Weather Tips */}
      <Card padding="$3" backgroundColor="$yellow1">
        <YStack space="$2">
          <Text fontSize="$3" fontWeight="bold" color="$yellow11">
            💡 Weather Tips
          </Text>
          <Text fontSize="$2" color="$yellow11">
            • Check weather conditions before departure
            • Bring appropriate clothing for temperature changes
            • Consider rain gear if precipitation is expected
            • Plan for longer travel times in adverse weather
          </Text>
        </YStack>
      </Card>
    </YStack>
  );
} 