import { Location, WeatherData } from '@/types';

const OPENWEATHER_API_KEY = 'your-api-key-here'; // Replace with actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export class WeatherService {
  static async getWeatherForLocation(location: Location): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Return dummy data for demo purposes
      return {
        temperature: 20,
        description: 'Clear sky',
        icon: '01d',
        humidity: 50,
        windSpeed: 3.5,
        precipitation: 0,
      };
    }
  }

  static async getWeatherForRoute(locations: Location[]): Promise<WeatherData[]> {
    const weatherPromises = locations.map(location => 
      this.getWeatherForLocation(location)
    );
    
    return Promise.all(weatherPromises);
  }
} 