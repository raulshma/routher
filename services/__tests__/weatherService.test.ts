import { WeatherService, type WeatherProvider } from '../weatherService';
import { Location } from '@/types';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock environment variables
const originalEnv = process.env;

describe('WeatherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default provider
    WeatherService.setProvider('openweather');
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const mockLocation: Location = {
    latitude: 52.5200,
    longitude: 13.4050,
    address: 'Berlin, Germany',
  };

  const mockOpenWeatherResponse = {
    main: {
      temp: 20,
      humidity: 65,
    },
    weather: [
      {
        main: 'Clear',
        description: 'clear sky',
        icon: '01d',
      },
    ],
    wind: {
      speed: 5.2,
    },
    rain: {
      '1h': 0,
    },
  };

  const mockWeatherAPIResponse = {
    current: {
      temp_c: 20,
      humidity: 65,
      condition: {
        text: 'Clear sky',
        code: 1000,
      },
      wind_kph: 18.72, // 5.2 m/s = 18.72 km/h
      precip_mm: 0,
      is_day: 1,
    },
  };

  describe('Provider Management', () => {
    beforeAll(() => {
      process.env = {
        ...originalEnv,
        EXPO_PUBLIC_OPEN_WEATHER_API_KEY: 'test_openweather_key',
        EXPO_PUBLIC_WEATHER_API_KEY: 'test_weatherapi_key',
      };
    });

    it('should set and get current provider', () => {
      WeatherService.setProvider('weatherapi');
      expect(WeatherService.getCurrentProvider()).toBe('weatherapi');

      WeatherService.setProvider('openweather');
      expect(WeatherService.getCurrentProvider()).toBe('openweather');
    });

    it('should return available providers based on API keys', () => {
      const providers = WeatherService.getAvailableProviders();
      expect(providers).toContain('openweather');
      expect(providers).toContain('weatherapi');
    });

    it('should only return available providers when API keys are present', () => {
      process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY = '';
      process.env.EXPO_PUBLIC_WEATHER_API_KEY = 'test_key';

      const providers = WeatherService.getAvailableProviders();
      expect(providers).toEqual(['weatherapi']);
    });
  });

  describe('OpenWeather Provider', () => {
    beforeAll(() => {
      process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY = 'test_openweather_key';
    });

    beforeEach(() => {
      WeatherService.setProvider('openweather');
    });

    it('should fetch weather data from OpenWeather', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenWeatherResponse,
      });

      const result = await WeatherService.getWeatherForLocation(mockLocation);

      expect(result).toMatchObject({
        temperature: 20,
        description: 'clear sky',
        icon: '01d',
        humidity: 65,
        windSpeed: 5.2,
        precipitation: 0,
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('openweathermap.org')
      );
    });

    it('should handle missing rain data from OpenWeather', async () => {
      const responseWithoutRain = {
        ...mockOpenWeatherResponse,
        rain: undefined,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutRain,
      });

      const result = await WeatherService.getWeatherForLocation(mockLocation);
      expect(result.precipitation).toBe(0);
    });

    it('should handle snow data from OpenWeather', async () => {
      const responseWithSnow = {
        ...mockOpenWeatherResponse,
        rain: undefined,
        snow: { '1h': 2.5 },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithSnow,
      });

      const result = await WeatherService.getWeatherForLocation(mockLocation);
      expect(result.precipitation).toBe(2.5);
    });
  });

  describe('WeatherAPI Provider', () => {
    beforeAll(() => {
      process.env.EXPO_PUBLIC_WEATHER_API_KEY = 'test_weatherapi_key';
    });

    beforeEach(() => {
      WeatherService.setProvider('weatherapi');
    });

    it('should fetch weather data from WeatherAPI', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherAPIResponse,
      });

      const result = await WeatherService.getWeatherForLocation(mockLocation);

      expect(result).toMatchObject({
        temperature: 20,
        description: 'clear sky',
        icon: '01d', // Mapped from WeatherAPI condition code 1000
        humidity: 65,
        windSpeed: 5.2, // Converted from km/h to m/s
        precipitation: 0,
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('weatherapi.com')
      );
    });

    it('should convert wind speed from km/h to m/s', async () => {
      const responseWithWind = {
        ...mockWeatherAPIResponse,
        current: {
          ...mockWeatherAPIResponse.current,
          wind_kph: 36, // 10 m/s
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithWind,
      });

      const result = await WeatherService.getWeatherForLocation(mockLocation);
      expect(result.windSpeed).toBe(10);
    });

    it('should map WeatherAPI condition codes to OpenWeather icons', async () => {
      const testCases = [
        { code: 1000, isDay: 1, expected: '01d' }, // Sunny
        { code: 1000, isDay: 0, expected: '01n' }, // Clear night
        { code: 1003, isDay: 1, expected: '02d' }, // Partly cloudy
        { code: 1087, isDay: 1, expected: '11d' }, // Thundery
        { code: 1225, isDay: 1, expected: '13d' }, // Heavy snow
      ];

      for (const testCase of testCases) {
        const response = {
          ...mockWeatherAPIResponse,
          current: {
            ...mockWeatherAPIResponse.current,
            condition: {
              ...mockWeatherAPIResponse.current.condition,
              code: testCase.code,
            },
            is_day: testCase.isDay,
          },
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => response,
        });

        const result = await WeatherService.getWeatherForLocation(mockLocation);
        expect(result.icon).toBe(testCase.expected);
      }
    });
  });

  describe('Error Handling', () => {
    beforeAll(() => {
      process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY = 'test_key';
    });

    it('should throw error when API key is not configured', async () => {
      process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY = '';
      WeatherService.setProvider('openweather');

      await expect(
        WeatherService.getWeatherForLocation(mockLocation)
      ).rejects.toThrow('OpenWeather API key not configured');
    });

    it('should handle API errors gracefully and return fallback data', async () => {
      process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY = 'test_key';
      WeatherService.setProvider('openweather');

      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await WeatherService.getWeatherForLocation(mockLocation);

      // Should return fallback weather data
      expect(result).toMatchObject({
        temperature: 20,
        description: 'Clear sky',
        icon: '01d',
        humidity: 50,
        windSpeed: 3.5,
        precipitation: 0,
      });
    });

    it('should handle non-200 HTTP responses', async () => {
      process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY = 'test_key';
      WeatherService.setProvider('openweather');

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await WeatherService.getWeatherForLocation(mockLocation);

      // Should return fallback weather data
      expect(result.temperature).toBe(20);
    });
  });

  describe('getWeatherForRoute', () => {
    beforeAll(() => {
      process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY = 'test_key';
    });

    beforeEach(() => {
      WeatherService.setProvider('openweather');
    });

    it('should fetch weather data for multiple locations', async () => {
      const locations: Location[] = [
        mockLocation,
        { latitude: 48.8566, longitude: 2.3522, address: 'Paris, France' },
      ];

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockOpenWeatherResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...mockOpenWeatherResponse,
            main: { ...mockOpenWeatherResponse.main, temp: 18 },
          }),
        });

      const results = await WeatherService.getWeatherForRoute(locations);

      expect(results).toHaveLength(2);
      expect(results[0].temperature).toBe(20);
      expect(results[1].temperature).toBe(18);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle empty locations array', async () => {
      const results = await WeatherService.getWeatherForRoute([]);

      expect(results).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle partial failures in batch requests', async () => {
      const locations: Location[] = [
        mockLocation,
        { latitude: 48.8566, longitude: 2.3522, address: 'Paris, France' },
      ];

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockOpenWeatherResponse,
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const results = await WeatherService.getWeatherForRoute(locations);

      expect(results).toHaveLength(2);
      expect(results[0].temperature).toBe(20);
      expect(results[1].temperature).toBe(20); // Fallback data
    });
  });
}); 