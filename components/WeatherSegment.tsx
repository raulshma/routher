import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import { Card, Text, YStack, XStack } from './ui';
import { WeatherData, WeatherPoint } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface WeatherSegmentProps {
  weatherPoints: WeatherPoint[];
  onWeatherPointSelect?: (index: number) => void;
  selectedIndex?: number;
}

// Size mappings for consistent styling
const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 22,
  xxl: 28,
} as const;

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const WeatherSegment: React.FC<WeatherSegmentProps> = ({
  weatherPoints,
  onWeatherPointSelect,
  selectedIndex,
}) => {
  const { colors } = useTheme();

  const weatherStats = useMemo(() => {
    if (weatherPoints.length === 0) return null;

    const temperatures = weatherPoints.map(point => point.weather.temperature);
    const humidities = weatherPoints.map(point => point.weather.humidity);
    const precipitations = weatherPoints.map(point => point.weather.precipitation);
    const rainChances = weatherPoints.map(point => point.weather.chanceOfRain);

    // Count weather conditions
    const conditionCounts = weatherPoints.reduce((acc, point) => {
      acc[point.weather.condition] = (acc[point.weather.condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantCondition = Object.entries(conditionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';

    return {
      avgTemp: Math.round(temperatures.reduce((a, b) => a + b, 0) / temperatures.length),
      avgHumidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length),
      maxPrecipitation: Math.max(...precipitations),
      maxRainChance: Math.max(...rainChances),
      minTemp: Math.min(...temperatures),
      maxTemp: Math.max(...temperatures),
      dominantCondition,
      intervalKm: weatherPoints.length > 1 ? 
        Math.round(weatherPoints[1].distanceFromStart / 1000) : 4,
    };
  }, [weatherPoints]);

  const getTemperatureColor = (temp: number): string => {
    if (temp <= 0) return '#0066CC';
    if (temp <= 10) return '#3399FF';
    if (temp <= 20) return '#66B2FF';
    if (temp <= 30) return '#FFB366';
    return '#FF6633';
  };

  const getWeatherIcon = (weather: WeatherData): string => {
    // Use the condition field for more accurate icons
    switch (weather.condition) {
      case 'sunny': return '☀️';
      case 'partly-cloudy': return '⛅';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'heavy-rain': return '🌦️';
      case 'thunderstorm': return '⛈️';
      case 'snow': return '❄️';
      case 'fog': return '🌫️';
      default: return '🌡️';
    }
  };

  const getWeatherStatusText = (weather: WeatherData): string => {
    switch (weather.condition) {
      case 'sunny': return 'Sunny';
      case 'partly-cloudy': return 'Partly Cloudy';
      case 'cloudy': return 'Cloudy';
      case 'rainy': return 'Rainy';
      case 'heavy-rain': return 'Heavy Rain';
      case 'thunderstorm': return 'Thunderstorm';
      case 'snow': return 'Snow';
      case 'fog': return 'Foggy';
      default: return weather.description || 'Unknown';
    }
  };

  if (!weatherStats) {
    return (
      <Card padding={SPACING.md} backgroundColor={colors.surface}>
        <YStack space="md">
          <Text fontSize={FONT_SIZES.lg} fontWeight="600" color={colors.primary}>
            No Weather Data Available
          </Text>
          <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>
            Weather information will be displayed once route data is available.
          </Text>
        </YStack>
      </Card>
    );
  }

  const { avgTemp, avgHumidity, maxPrecipitation, maxRainChance, dominantCondition, intervalKm } = weatherStats;

  return (
    <YStack space="md">
      {/* Weather Summary Card */}
      <Card padding={SPACING.md}>
        <YStack space="md">
          <Text fontSize={FONT_SIZES.lg} fontWeight="600" color={colors.primary}>
            Weather Summary - {getWeatherStatusText({ condition: dominantCondition } as WeatherData)}
          </Text>
          <XStack justifyContent="space-around">
            <YStack alignItems="center">
              <Text fontSize={FONT_SIZES.lg} fontWeight="700" color={getTemperatureColor(avgTemp)}>
                {avgTemp}°C
              </Text>
              <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>
                Avg Temp
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize={FONT_SIZES.lg} fontWeight="700">
                {avgHumidity}%
              </Text>
              <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>
                Avg Humidity
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize={FONT_SIZES.lg} fontWeight="700">
                {maxRainChance}%
              </Text>
              <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>
                Max Rain Chance
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </Card>

      {/* Weather Points */}
      <Text fontSize={FONT_SIZES.lg} fontWeight="600">
        Weather at {intervalKm}km intervals ({weatherPoints.length} points)
      </Text>
      
      {weatherPoints.map((weatherPoint, index) => (
        <Card 
          key={index} 
          padding={SPACING.md} 
          backgroundColor={selectedIndex === index ? colors.primaryContainer : colors.surface}
          style={{
            borderWidth: selectedIndex === index ? 2 : 1,
            borderColor: selectedIndex === index ? colors.primary : colors.outline,
          }}
        >
          <Pressable
            onPress={() => onWeatherPointSelect?.(index)}
            style={{ flex: 1 }}
          >
            <XStack space="md" alignItems="center">
              {/* Weather Icon */}
              <YStack
                width={48}
                height={48}
                backgroundColor={colors.primary}
                borderRadius={24}
                alignItems="center"
                justifyContent="center"
                style={{ marginBottom: SPACING.xs }}
              >
                <Text fontSize={FONT_SIZES.sm} color="white" fontWeight="700">
                  {getWeatherIcon(weatherPoint.weather)}
                </Text>
              </YStack>

              {/* Distance */}
              <Text fontSize={FONT_SIZES.xl}>
                {index === 0 ? 'Start' : `${(weatherPoint.distanceFromStart / 1000).toFixed(1)}km`}
              </Text>

              {/* Weather Details */}
              <YStack flex={1} space="xs">
                {/* Temperature */}
                <Text fontSize={FONT_SIZES.lg} fontWeight="700" color={getTemperatureColor(weatherPoint.weather.temperature)}>
                  {weatherPoint.weather.temperature}°C
                </Text>
                <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>
                  {getWeatherStatusText(weatherPoint.weather)}
                </Text>
                {weatherPoint.weather.chanceOfRain > 20 && (
                  <Text fontSize={FONT_SIZES.sm} color={colors.primary}>
                    {weatherPoint.weather.chanceOfRain}% chance of rain
                  </Text>
                )}
              </YStack>

              {/* Additional Info */}
              <YStack 
                alignItems="flex-end"
                style={{ minWidth: 80 }}
              >
                {/* Wind and Humidity */}
                <XStack space="md">
                  <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>
                    Wind: {weatherPoint.weather.windSpeed.toFixed(1)} m/s
                  </Text>
                  <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>
                    Humidity: {weatherPoint.weather.humidity}%
                  </Text>
                  {weatherPoint.weather.precipitation > 0 && (
                    <Text fontSize={FONT_SIZES.sm} color={colors.primary}>
                      Rain: {weatherPoint.weather.precipitation.toFixed(1)}mm
                    </Text>
                  )}
                </XStack>
              </YStack>
            </XStack>

            {/* Location Info */}
            <Text fontSize={FONT_SIZES.md} color={colors.onSurface}>
              No location data available
            </Text>

            {/* Expanded Details when selected */}
            {selectedIndex === index && (
              <YStack margin={SPACING.md} style={{ paddingTop: SPACING.md, borderTopWidth: 1, borderColor: colors.outline }}>
                <YStack space="sm">
                  <Text fontSize={FONT_SIZES.md} fontWeight="700">
                    Detailed Weather Information
                  </Text>
                  <XStack justifyContent="space-between">
                    <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>Temperature:</Text>
                    <Text fontSize={FONT_SIZES.sm}>{weatherPoint.weather.temperature}°C</Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>Humidity:</Text>
                    <Text fontSize={FONT_SIZES.sm}>{weatherPoint.weather.humidity}%</Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>Wind Speed:</Text>
                    <Text fontSize={FONT_SIZES.sm}>{weatherPoint.weather.windSpeed.toFixed(1)} m/s</Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>Precipitation:</Text>
                    <Text fontSize={FONT_SIZES.sm}>{weatherPoint.weather.precipitation.toFixed(1)}mm</Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>Location:</Text>
                    <Text fontSize={FONT_SIZES.sm}>
                      {weatherPoint.location.latitude.toFixed(4)}, {weatherPoint.location.longitude.toFixed(4)}
                    </Text>
                  </XStack>
                </YStack>
              </YStack>
            )}
          </Pressable>
        </Card>
      ))}

      {/* Warning if severe weather */}
      {maxPrecipitation > 5 && (
        <Card padding={SPACING.md} backgroundColor={colors.errorContainer}>
          <YStack space="sm">
            <Text fontSize={FONT_SIZES.md} fontWeight="700" color={colors.error}>
              ⚠️ Weather Warning
            </Text>
            <Text fontSize={FONT_SIZES.sm} color={colors.error}>
              Heavy precipitation expected ({maxPrecipitation.toFixed(1)}mm). Consider adjusting your travel plans.
            </Text>
          </YStack>
        </Card>
      )}
    </YStack>
  );
}; 