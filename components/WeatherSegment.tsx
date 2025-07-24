import React, { useMemo } from 'react';
import { Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  const getWeatherGradient = (condition: string): [string, string] => {
    switch (condition) {
      case 'sunny': return ['#FEF3C7', '#FCD34D'];
      case 'partly-cloudy': return ['#DBEAFE', '#93C5FD'];
      case 'cloudy': return ['#F3F4F6', '#D1D5DB'];
      case 'rainy': return ['#DBEAFE', '#3B82F6'];
      case 'heavy-rain': return ['#1E40AF', '#1E3A8A'];
      case 'thunderstorm': return ['#DDD6FE', '#7C3AED'];
      case 'snow': return ['#F8FAFC', '#E2E8F0'];
      case 'fog': return ['#F1F5F9', '#CBD5E1'];
      default: return ['#F0F9FF', '#E0F2FE'];
    }
  };

  const getConditionColor = (condition: string): string => {
    switch (condition) {
      case 'sunny': return '#F59E0B';
      case 'partly-cloudy': return '#3B82F6';
      case 'cloudy': return '#6B7280';
      case 'rainy': return '#2563EB';
      case 'heavy-rain': return '#1E40AF';
      case 'thunderstorm': return '#7C3AED';
      case 'snow': return '#64748B';
      case 'fog': return '#94A3B8';
      default: return '#06B6D4';
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
      {/* Enhanced Weather Summary Card */}
      <Card variant="gradient" gradient={getWeatherGradient(dominantCondition)} padding={SPACING.lg}>
        <YStack space="md">
          <XStack alignItems="center" space="md">
            <Text fontSize={32}>
              {getWeatherIcon({ condition: dominantCondition } as WeatherData)}
            </Text>
            <YStack flex={1}>
              <Text fontSize={FONT_SIZES.xl} fontWeight="700" color="white">
                Weather Overview
              </Text>
              <Text fontSize={FONT_SIZES.md} color="rgba(255, 255, 255, 0.9)">
                {getWeatherStatusText({ condition: dominantCondition } as WeatherData)} conditions along route
              </Text>
            </YStack>
          </XStack>
          
          <XStack justifyContent="space-around" style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.15)', 
            borderRadius: 16, 
            padding: SPACING.md 
          }}>
            <YStack alignItems="center">
              <Text fontSize={FONT_SIZES.xl} fontWeight="700" color="white">
                {avgTemp}°C
              </Text>
              <Text fontSize={FONT_SIZES.sm} color="rgba(255, 255, 255, 0.8)" fontWeight="500">
                AVG TEMP
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize={FONT_SIZES.xl} fontWeight="700" color="white">
                {avgHumidity}%
              </Text>
              <Text fontSize={FONT_SIZES.sm} color="rgba(255, 255, 255, 0.8)" fontWeight="500">
                HUMIDITY
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize={FONT_SIZES.xl} fontWeight="700" color="white">
                {maxRainChance}%
              </Text>
              <Text fontSize={FONT_SIZES.sm} color="rgba(255, 255, 255, 0.8)" fontWeight="500">
                RAIN CHANCE
              </Text>
            </YStack>
          </XStack>
          
          {/* Temperature Range */}
          <XStack justifyContent="space-between" alignItems="center" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            padding: SPACING.sm
          }}>
            <Text fontSize={FONT_SIZES.sm} color="rgba(255, 255, 255, 0.9)" fontWeight="600">
              Temperature Range: {weatherStats.minTemp}°C - {weatherStats.maxTemp}°C
            </Text>
            <Text fontSize={FONT_SIZES.sm} color="rgba(255, 255, 255, 0.9)" fontWeight="600">
              {weatherPoints.length} checkpoints
            </Text>
          </XStack>
        </YStack>
      </Card>

      {/* Enhanced Weather Points Header */}
      <XStack justifyContent="space-between" alignItems="center" style={{ marginTop: SPACING.md }}>
        <Text fontSize={FONT_SIZES.lg} fontWeight="700" color={colors.onSurface}>
          Route Weather Points
        </Text>
        <Card variant="outlined" padding={SPACING.xs} style={{ borderRadius: 20 }}>
          <Text fontSize={FONT_SIZES.sm} fontWeight="600" color={colors.primary}>
            {intervalKm}km intervals • {weatherPoints.length} points
          </Text>
        </Card>
      </XStack>
      
      {weatherPoints.map((weatherPoint, index) => {
        const isSelected = selectedIndex === index;
        const conditionGradient = getWeatherGradient(weatherPoint.weather.condition);
        
        return (
          <Card 
            key={index} 
            variant={isSelected ? "elevated" : "outlined"}
            padding={0}
            style={{
              borderWidth: isSelected ? 2 : 1,
              borderColor: isSelected ? getConditionColor(weatherPoint.weather.condition) : colors.outline,
              overflow: 'hidden',
            }}
          >
            <Pressable
              onPress={() => onWeatherPointSelect?.(index)}
              style={{ flex: 1 }}
            >
              {/* Main Content */}
              <XStack space="md" alignItems="center" padding={SPACING.md}>
                {/* Enhanced Weather Icon with Gradient Background */}
                <LinearGradient
                  colors={conditionGradient}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: getConditionColor(weatherPoint.weather.condition),
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text fontSize={28}>
                    {getWeatherIcon(weatherPoint.weather)}
                  </Text>
                </LinearGradient>

                {/* Distance Marker */}
                <YStack alignItems="center" style={{ minWidth: 60 }}>
                  <Text fontSize={FONT_SIZES.xl} fontWeight="700" color={colors.onSurface}>
                    {index === 0 ? 'START' : `${(weatherPoint.distanceFromStart / 1000).toFixed(1)}km`}
                  </Text>
                  <Text fontSize={FONT_SIZES.xs} color={colors.onSurfaceVariant} fontWeight="500">
                    {index === 0 ? 'ORIGIN' : 'CHECKPOINT'}
                  </Text>
                </YStack>

                {/* Weather Details */}
                <YStack flex={1} space="xs">
                  <XStack alignItems="baseline" space="sm">
                    <Text fontSize={FONT_SIZES.xxl} fontWeight="700" color={getTemperatureColor(weatherPoint.weather.temperature)}>
                      {weatherPoint.weather.temperature}°
                    </Text>
                    <Text fontSize={FONT_SIZES.md} color={colors.onSurface} fontWeight="600">
                      {getWeatherStatusText(weatherPoint.weather)}
                    </Text>
                  </XStack>
                  
                  <XStack space="md" alignItems="center">
                    {weatherPoint.weather.chanceOfRain > 20 && (
                      <XStack alignItems="center" space="xs">
                        <Text fontSize={FONT_SIZES.sm}>🌧️</Text>
                        <Text fontSize={FONT_SIZES.sm} color={colors.primary} fontWeight="600">
                          {weatherPoint.weather.chanceOfRain}%
                        </Text>
                      </XStack>
                    )}
                    <XStack alignItems="center" space="xs">
                      <Text fontSize={FONT_SIZES.sm}>💨</Text>
                      <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>
                        {weatherPoint.weather.windSpeed.toFixed(1)} m/s
                      </Text>
                    </XStack>
                    <XStack alignItems="center" space="xs">
                      <Text fontSize={FONT_SIZES.sm}>💧</Text>
                      <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant}>
                        {weatherPoint.weather.humidity}%
                      </Text>
                    </XStack>
                  </XStack>
                </YStack>

                {/* Status Indicator */}
                <YStack alignItems="center" style={{ minWidth: 40 }}>
                  {weatherPoint.weather.precipitation > 0 && (
                    <Card variant="filled" padding={SPACING.xs} backgroundColor={colors.errorContainer} style={{ borderRadius: 12, marginBottom: 4 }}>
                      <Text fontSize={FONT_SIZES.xs} color={colors.error} fontWeight="700">
                        {weatherPoint.weather.precipitation.toFixed(1)}mm
                      </Text>
                    </Card>
                  )}
                  <Text fontSize={FONT_SIZES.lg} color={isSelected ? colors.primary : colors.onSurfaceVariant}>
                    {isSelected ? '📍' : '○'}
                  </Text>
                </YStack>
              </XStack>

              {/* Expanded Details when selected */}
              {isSelected && (
                <LinearGradient
                  colors={['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.02)']}
                  style={{ 
                    marginHorizontal: SPACING.md, 
                    marginBottom: SPACING.md,
                    borderRadius: 12,
                    padding: SPACING.md,
                    borderWidth: 1,
                    borderColor: 'rgba(59, 130, 246, 0.1)'
                  }}
                >
                  <YStack space="md">
                    <Text fontSize={FONT_SIZES.md} fontWeight="700" color={colors.primary}>
                      📊 Detailed Weather Information
                    </Text>
                    
                    <XStack justifyContent="space-between" style={{ flexWrap: 'wrap', gap: SPACING.sm }}>
                      <YStack alignItems="center" style={{ minWidth: '30%' }}>
                        <Text fontSize={FONT_SIZES.lg} fontWeight="700" color={getTemperatureColor(weatherPoint.weather.temperature)}>
                          {weatherPoint.weather.temperature}°C
                        </Text>
                        <Text fontSize={FONT_SIZES.xs} color={colors.onSurfaceVariant} fontWeight="500">TEMPERATURE</Text>
                      </YStack>
                      
                      <YStack alignItems="center" style={{ minWidth: '30%' }}>
                        <Text fontSize={FONT_SIZES.lg} fontWeight="700" color={colors.onSurface}>
                          {weatherPoint.weather.humidity}%
                        </Text>
                        <Text fontSize={FONT_SIZES.xs} color={colors.onSurfaceVariant} fontWeight="500">HUMIDITY</Text>
                      </YStack>
                      
                      <YStack alignItems="center" style={{ minWidth: '30%' }}>
                        <Text fontSize={FONT_SIZES.lg} fontWeight="700" color={colors.onSurface}>
                          {weatherPoint.weather.windSpeed.toFixed(1)}
                        </Text>
                        <Text fontSize={FONT_SIZES.xs} color={colors.onSurfaceVariant} fontWeight="500">WIND (M/S)</Text>
                      </YStack>
                    </XStack>
                    
                    <Card variant="outlined" padding={SPACING.sm} style={{ borderRadius: 8 }}>
                      <Text fontSize={FONT_SIZES.sm} color={colors.onSurfaceVariant} fontWeight="500">
                        📍 Location: {weatherPoint.location.latitude.toFixed(4)}, {weatherPoint.location.longitude.toFixed(4)}
                      </Text>
                    </Card>
                  </YStack>
                </LinearGradient>
              )}
            </Pressable>
          </Card>
        );
      })}

      {/* Enhanced Weather Warnings */}
      {(maxPrecipitation > 5 || maxRainChance > 70) && (
        <Card 
          variant="gradient" 
          gradient={['#FEE2E2', '#FECACA']} 
          padding={SPACING.lg}
          style={{
            borderWidth: 2,
            borderColor: colors.error,
            shadowColor: colors.error,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <YStack space="md">
            <XStack alignItems="center" space="md">
              <Text fontSize={32}>⚠️</Text>
              <YStack flex={1}>
                <Text fontSize={FONT_SIZES.lg} fontWeight="700" color={colors.error}>
                  Weather Advisory
                </Text>
                <Text fontSize={FONT_SIZES.sm} color={colors.error} fontWeight="500">
                  Challenging conditions detected along your route
                </Text>
              </YStack>
            </XStack>
            
            <YStack space="sm" style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 12,
              padding: SPACING.md
            }}>
              {maxPrecipitation > 5 && (
                <XStack alignItems="center" space="sm">
                  <Text fontSize={FONT_SIZES.md}>🌧️</Text>
                  <Text fontSize={FONT_SIZES.sm} color={colors.error} fontWeight="600">
                    Heavy precipitation expected: {maxPrecipitation.toFixed(1)}mm
                  </Text>
                </XStack>
              )}
              {maxRainChance > 70 && (
                <XStack alignItems="center" space="sm">
                  <Text fontSize={FONT_SIZES.md}>☔</Text>
                  <Text fontSize={FONT_SIZES.sm} color={colors.error} fontWeight="600">
                    High chance of rain: {maxRainChance}%
                  </Text>
                </XStack>
              )}
              <Text fontSize={FONT_SIZES.sm} color={colors.error}>
                Consider adjusting your travel plans or bringing appropriate gear.
              </Text>
            </YStack>
          </YStack>
        </Card>
      )}
    </YStack>
  );
}; 