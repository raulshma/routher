import { Location, WeatherData, WeatherCondition, WeatherSettings } from '@/types';
import { StorageService } from './storageService';

// Weather provider configuration
export type WeatherProvider = 'openweather' | 'weatherapi';

interface WeatherProviderConfig {
  provider: WeatherProvider;
  apiKey: string;
}

// Environment variables for API keys
const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY;
const WEATHERAPI_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

// Base URLs for weather services
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const WEATHERAPI_BASE_URL = 'https://api.weatherapi.com/v1';

export class WeatherService {
  private static currentProvider: WeatherProvider = 'weatherapi'; // Default provider

  static setProvider(provider: WeatherProvider): void {
    this.currentProvider = provider;
  }

  // Helper function to map weather description to condition
  private static mapWeatherCondition(description: string, iconCode: string, precipitation: number): WeatherCondition {
    const desc = description.toLowerCase();
    
    if (desc.includes('thunder') || desc.includes('storm')) return 'thunderstorm';
    if (desc.includes('snow') || desc.includes('blizzard')) return 'snow';
    if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) return 'fog';
    if (precipitation > 5) return 'heavy-rain';
    if (precipitation > 0 || desc.includes('rain') || desc.includes('drizzle')) return 'rainy';
    if (desc.includes('cloud') && desc.includes('few')) return 'partly-cloudy';
    if (desc.includes('cloud') || desc.includes('overcast')) return 'cloudy';
    if (desc.includes('clear') || desc.includes('sunny') || iconCode.includes('01')) return 'sunny';
    
    return 'unknown';
  }

  // Helper function to calculate chance of rain
  private static calculateChanceOfRain(description: string, humidity: number, precipitation: number): number {
    const desc = description.toLowerCase();
    
    if (precipitation > 0) return Math.min(95, 60 + precipitation * 5);
    if (desc.includes('thunder') || desc.includes('storm')) return 90;
    if (desc.includes('rain') || desc.includes('drizzle')) return 80;
    if (desc.includes('shower')) return 70;
    if (humidity > 80) return Math.min(60, 20 + (humidity - 80) * 2);
    if (humidity > 60) return Math.min(40, 10 + (humidity - 60));
    
    return Math.max(0, humidity / 4);
  }

  static getCurrentProvider(): WeatherProvider {
    return this.currentProvider;
  }

  static getAvailableProviders(): WeatherProvider[] {
    const providers: WeatherProvider[] = [];
    if (OPENWEATHER_API_KEY) providers.push('openweather');
    if (WEATHERAPI_API_KEY) providers.push('weatherapi');
    return providers;
  }

  private static getProviderConfig(): WeatherProviderConfig {
    switch (this.currentProvider) {
      case 'openweather':
        if (!OPENWEATHER_API_KEY) {
          throw new Error('OpenWeather API key not configured');
        }
        return { provider: 'openweather', apiKey: OPENWEATHER_API_KEY };
      case 'weatherapi':
        if (!WEATHERAPI_API_KEY) {
          throw new Error('WeatherAPI key not configured');
        }
        return { provider: 'weatherapi', apiKey: WEATHERAPI_API_KEY };
      default:
        throw new Error(`Unsupported weather provider: ${this.currentProvider}`);
    }
  }

  static async getWeatherForLocation(location: Location): Promise<WeatherData> {
    try {
      const config = this.getProviderConfig();
      
      switch (config.provider) {
        case 'openweather':
          return await this.getOpenWeatherData(location, config.apiKey);
        case 'weatherapi':
          return await this.getWeatherAPIData(location, config.apiKey);
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Return dummy data for demo purposes
      const fallbackData = {
        temperature: 20,
        description: 'Clear sky',
        icon: '01d',
        humidity: 50,
        windSpeed: 3.5,
        precipitation: 0,
      };
      return {
        ...fallbackData,
        condition: this.mapWeatherCondition(fallbackData.description, fallbackData.icon, fallbackData.precipitation),
        chanceOfRain: this.calculateChanceOfRain(fallbackData.description, fallbackData.humidity, fallbackData.precipitation),
      };
    }
  }

  private static async getOpenWeatherData(location: Location, apiKey: string): Promise<WeatherData> {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const baseData = {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: this.mapOpenWeatherIcon(data.weather[0].icon),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
    };

    return {
      ...baseData,
      condition: this.mapWeatherCondition(baseData.description, baseData.icon, baseData.precipitation),
      chanceOfRain: this.calculateChanceOfRain(baseData.description, baseData.humidity, baseData.precipitation),
    };
  }

  private static async getWeatherAPIData(location: Location, apiKey: string): Promise<WeatherData> {
    const response = await fetch(
      `${WEATHERAPI_BASE_URL}/current.json?key=${apiKey}&q=${location.latitude},${location.longitude}&aqi=no`
    );
    
    if (!response.ok) {
      throw new Error(`WeatherAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const baseData = {
      temperature: Math.round(data.current.temp_c),
      description: data.current.condition.text.toLowerCase(),
      icon: this.mapWeatherAPIIcon(data.current.condition.code, data.current.is_day),
      humidity: data.current.humidity,
      windSpeed: data.current.wind_kph / 3.6, // Convert km/h to m/s
      precipitation: data.current.precip_mm,
    };

    return {
      ...baseData,
      condition: this.mapWeatherCondition(baseData.description, baseData.icon, baseData.precipitation),
      chanceOfRain: this.calculateChanceOfRain(baseData.description, baseData.humidity, baseData.precipitation),
    };
  }

  // Map OpenWeather icons to a consistent format
  private static mapOpenWeatherIcon(icon: string): string {
    return icon; // Keep original OpenWeather icon format
  }

  // Map WeatherAPI condition codes to OpenWeather-style icons for consistency
  private static mapWeatherAPIIcon(conditionCode: number, isDay: number): string {
    const iconMap: Record<number, { day: string; night: string }> = {
      1000: { day: '01d', night: '01n' }, // Sunny/Clear
      1003: { day: '02d', night: '02n' }, // Partly cloudy
      1006: { day: '03d', night: '03n' }, // Cloudy
      1009: { day: '04d', night: '04n' }, // Overcast
      1030: { day: '50d', night: '50n' }, // Mist
      1063: { day: '10d', night: '10n' }, // Patchy rain possible
      1066: { day: '13d', night: '13n' }, // Patchy snow possible
      1069: { day: '13d', night: '13n' }, // Patchy sleet possible
      1072: { day: '09d', night: '09n' }, // Patchy freezing drizzle possible
      1087: { day: '11d', night: '11n' }, // Thundery outbreaks possible
      1114: { day: '13d', night: '13n' }, // Blowing snow
      1117: { day: '13d', night: '13n' }, // Blizzard
      1135: { day: '50d', night: '50n' }, // Fog
      1147: { day: '50d', night: '50n' }, // Freezing fog
      1150: { day: '09d', night: '09n' }, // Patchy light drizzle
      1153: { day: '09d', night: '09n' }, // Light drizzle
      1168: { day: '09d', night: '09n' }, // Freezing drizzle
      1171: { day: '09d', night: '09n' }, // Heavy freezing drizzle
      1180: { day: '10d', night: '10n' }, // Patchy light rain
      1183: { day: '10d', night: '10n' }, // Light rain
      1186: { day: '10d', night: '10n' }, // Moderate rain at times
      1189: { day: '10d', night: '10n' }, // Moderate rain
      1192: { day: '10d', night: '10n' }, // Heavy rain at times
      1195: { day: '10d', night: '10n' }, // Heavy rain
      1198: { day: '09d', night: '09n' }, // Light freezing rain
      1201: { day: '09d', night: '09n' }, // Moderate or heavy freezing rain
      1204: { day: '13d', night: '13n' }, // Light sleet
      1207: { day: '13d', night: '13n' }, // Moderate or heavy sleet
      1210: { day: '13d', night: '13n' }, // Patchy light snow
      1213: { day: '13d', night: '13n' }, // Light snow
      1216: { day: '13d', night: '13n' }, // Patchy moderate snow
      1219: { day: '13d', night: '13n' }, // Moderate snow
      1222: { day: '13d', night: '13n' }, // Patchy heavy snow
      1225: { day: '13d', night: '13n' }, // Heavy snow
      1237: { day: '13d', night: '13n' }, // Ice pellets
      1240: { day: '09d', night: '09n' }, // Light rain shower
      1243: { day: '09d', night: '09n' }, // Moderate or heavy rain shower
      1246: { day: '09d', night: '09n' }, // Torrential rain shower
      1249: { day: '13d', night: '13n' }, // Light sleet showers
      1252: { day: '13d', night: '13n' }, // Moderate or heavy sleet showers
      1255: { day: '13d', night: '13n' }, // Light snow showers
      1258: { day: '13d', night: '13n' }, // Moderate or heavy snow showers
      1261: { day: '13d', night: '13n' }, // Light showers of ice pellets
      1264: { day: '13d', night: '13n' }, // Moderate or heavy showers of ice pellets
      1273: { day: '11d', night: '11n' }, // Patchy light rain with thunder
      1276: { day: '11d', night: '11n' }, // Moderate or heavy rain with thunder
      1279: { day: '11d', night: '11n' }, // Patchy light snow with thunder
      1282: { day: '11d', night: '11n' }, // Moderate or heavy snow with thunder
    };

    const mapping = iconMap[conditionCode];
    if (mapping) {
      return isDay ? mapping.day : mapping.night;
    }
    
    // Default fallback
    return isDay ? '01d' : '01n';
  }

  static async getWeatherForRoute(locations: Location[]): Promise<WeatherData[]> {
    const weatherPromises = locations.map(location => 
      this.getWeatherForLocation(location)
    );
    
    return Promise.all(weatherPromises);
  }

  // Generate weather points at configurable intervals
  static generateWeatherPoints(
    routeGeometry: Location[],
    totalDistanceMeters: number,
    intervalKm: number = 4
  ): Location[] {
    if (routeGeometry.length === 0) return [];
    
    const intervalMeters = intervalKm * 1000;
    const weatherPoints: Location[] = [];
    
    // Always include the start point
    weatherPoints.push(routeGeometry[0]);
    
    if (totalDistanceMeters <= intervalMeters) {
      // If route is shorter than interval, only add start and end
      if (routeGeometry.length > 1) {
        weatherPoints.push(routeGeometry[routeGeometry.length - 1]);
      }
      return weatherPoints;
    }
    
    let currentDistance = 0;
    let nextWeatherDistance = intervalMeters;
    
    for (let i = 0; i < routeGeometry.length - 1; i++) {
      const currentPoint = routeGeometry[i];
      const nextPoint = routeGeometry[i + 1];
      const segmentDistance = this.calculateDistance(currentPoint, nextPoint);
      
      // Check if we need to add weather points in this segment
      while (currentDistance + segmentDistance >= nextWeatherDistance) {
        // Calculate position of weather point along this segment
        const distanceIntoSegment = nextWeatherDistance - currentDistance;
        const ratio = distanceIntoSegment / segmentDistance;
        
        const weatherPoint: Location = {
          latitude: currentPoint.latitude + (nextPoint.latitude - currentPoint.latitude) * ratio,
          longitude: currentPoint.longitude + (nextPoint.longitude - currentPoint.longitude) * ratio,
        };
        
        weatherPoints.push(weatherPoint);
        nextWeatherDistance += intervalMeters;
      }
      
      currentDistance += segmentDistance;
    }
    
    // Always include the end point if we haven't already
    const lastPoint = routeGeometry[routeGeometry.length - 1];
    const lastWeatherPoint = weatherPoints[weatherPoints.length - 1];
    if (
      lastWeatherPoint.latitude !== lastPoint.latitude ||
      lastWeatherPoint.longitude !== lastPoint.longitude
    ) {
      weatherPoints.push(lastPoint);
    }
    
    return weatherPoints;
  }

  // Helper function to calculate distance between two points in meters
  private static calculateDistance(point1: Location, point2: Location): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
} 