import { WeatherService } from '../weatherService';
import { Location } from '@/types';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('WeatherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockLocation: Location = {
    latitude: 52.5200,
    longitude: 13.4050,
    address: 'Berlin, Germany',
  };

  const mockWeatherResponse = {
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

  describe('getWeatherForLocation', () => {
    it('should fetch weather data for a location', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherResponse,
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
        expect.stringContaining('openweathermap.org'),
        expect.any(Object)
      );
    });

    it('should handle missing rain data', async () => {
      const responseWithoutRain = {
        ...mockWeatherResponse,
        rain: undefined,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutRain,
      });

      const result = await WeatherService.getWeatherForLocation(mockLocation);

      expect(result.precipitation).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        WeatherService.getWeatherForLocation(mockLocation)
      ).rejects.toThrow('Failed to fetch weather data');
    });

    it('should handle non-200 HTTP responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        WeatherService.getWeatherForLocation(mockLocation)
      ).rejects.toThrow('Weather API request failed');
    });
  });

  describe('getWeatherForRoute', () => {
    it('should fetch weather data for multiple locations', async () => {
      const locations: Location[] = [
        mockLocation,
        { latitude: 48.8566, longitude: 2.3522, address: 'Paris, France' },
      ];

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeatherResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...mockWeatherResponse,
            main: { ...mockWeatherResponse.main, temp: 18 },
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
          json: async () => mockWeatherResponse,
        })
        .mockRejectedValueOnce(new Error('Network error'));

      await expect(
        WeatherService.getWeatherForRoute(locations)
      ).rejects.toThrow();

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('weather icon mapping', () => {
    it('should handle various weather icons', async () => {
      const weatherIcons = ['01d', '02n', '10d', '11d', '13d', '50d'];

      for (const icon of weatherIcons) {
        const response = {
          ...mockWeatherResponse,
          weather: [{ ...mockWeatherResponse.weather[0], icon }],
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => response,
        });

        const result = await WeatherService.getWeatherForLocation(mockLocation);
        expect(result.icon).toBe(icon);
      }
    });
  });

  describe('temperature conversion', () => {
    it('should handle temperature conversion from Kelvin', async () => {
      const responseInKelvin = {
        ...mockWeatherResponse,
        main: { ...mockWeatherResponse.main, temp: 293.15 }, // 20°C in Kelvin
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseInKelvin,
      });

      const result = await WeatherService.getWeatherForLocation(mockLocation);

      expect(result.temperature).toBeCloseTo(20, 0);
    });
  });
}); 