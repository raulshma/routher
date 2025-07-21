import { RoutingService } from '../routingService';
import { Location, VehicleType, Waypoint } from '@/types';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('RoutingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache before each test
    (RoutingService as any).routeCache?.clear?.();
  });

  const mockStartPoint: Location = {
    latitude: 52.5200,
    longitude: 13.4050,
    address: 'Berlin, Germany',
  };

  const mockEndPoint: Location = {
    latitude: 48.8566,
    longitude: 2.3522,
    address: 'Paris, France',
  };

  const mockWaypoints: Waypoint[] = [
    {
      id: '1',
      location: { latitude: 50.9375, longitude: 6.9603, address: 'Cologne, Germany' },
      order: 1,
    },
  ];

  describe('calculateRoute', () => {
    it('should calculate route between two points', async () => {
      const mockResponse = {
        routes: [
          {
            geometry: 'encoded_polyline_string',
            legs: [
              {
                steps: [
                  {
                    maneuver: { instruction: 'Head north on Main St' },
                    distance: 1000,
                    duration: 120,
                  },
                ],
                distance: 1000,
                duration: 120,
              },
            ],
            distance: 1000,
            duration: 120,
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await RoutingService.calculateRoute(
        mockStartPoint,
        mockEndPoint,
        'car'
      );

      expect(result).toHaveProperty('routePoints');
      expect(result).toHaveProperty('totalDistance', 1000);
      expect(result).toHaveProperty('totalDuration', 120);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('router.project-osrm.org'),
        expect.any(Object)
      );
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        RoutingService.calculateRoute(mockStartPoint, mockEndPoint, 'car')
      ).rejects.toThrow('Failed to calculate route');
    });

    it('should validate different vehicle types', async () => {
      const mockResponse = {
        routes: [
          {
            geometry: 'encoded_polyline_string',
            legs: [{ steps: [], distance: 1000, duration: 120 }],
            distance: 1000,
            duration: 120,
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const vehicleTypes: VehicleType[] = ['car', 'bicycle', 'walking'];

      for (const vehicle of vehicleTypes) {
        await RoutingService.calculateRoute(mockStartPoint, mockEndPoint, vehicle);
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(vehicle === 'bicycle' ? 'bike' : vehicle === 'walking' ? 'foot' : 'driving'),
          expect.any(Object)
        );
      }
    });
  });

  describe('calculateMultiWaypointRoute', () => {
    it('should handle routes with waypoints', async () => {
      const mockResponse = {
        routes: [
          {
            geometry: 'encoded_polyline_string',
            legs: [
              { steps: [], distance: 500, duration: 60 },
              { steps: [], distance: 500, duration: 60 },
            ],
            distance: 1000,
            duration: 120,
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await RoutingService.calculateMultiWaypointRoute(
        mockStartPoint,
        mockEndPoint,
        mockWaypoints,
        'car'
      );

      expect(result.totalDistance).toBe(1000);
      expect(result.totalDuration).toBe(120);
      expect(result.routePoints.length).toBeGreaterThan(0);
    });

    it('should handle empty waypoints array', async () => {
      const mockResponse = {
        routes: [
          {
            geometry: 'encoded_polyline_string',
            legs: [{ steps: [], distance: 1000, duration: 120 }],
            distance: 1000,
            duration: 120,
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await RoutingService.calculateMultiWaypointRoute(
        mockStartPoint,
        mockEndPoint,
        [],
        'car'
      );

      expect(result).toBeDefined();
      expect(result.totalDistance).toBe(1000);
    });
  });

  describe('generateRoutePointsAtIntervals', () => {
    it('should generate points at specified intervals', () => {
      const routePoints = [
        { location: mockStartPoint, distance: 0 },
        { location: { latitude: 52.0, longitude: 13.0 }, distance: 500 },
        { location: { latitude: 51.5, longitude: 12.5 }, distance: 1000 },
        { location: mockEndPoint, distance: 1500 },
      ];

      const result = RoutingService.generateRoutePointsAtIntervals(routePoints, 1000);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual(mockStartPoint);
    });

    it('should handle short routes', () => {
      const routePoints = [
        { location: mockStartPoint, distance: 0 },
        { location: mockEndPoint, distance: 500 },
      ];

      const result = RoutingService.generateRoutePointsAtIntervals(routePoints, 1000);

      expect(result.length).toBe(2);
      expect(result[0]).toEqual(mockStartPoint);
      expect(result[1]).toEqual(mockEndPoint);
    });
  });

  describe('caching', () => {
    it('should cache route calculation results', async () => {
      const mockResponse = {
        routes: [
          {
            geometry: 'encoded_polyline_string',
            legs: [{ steps: [], distance: 1000, duration: 120 }],
            distance: 1000,
            duration: 120,
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // First call should hit the API
      await RoutingService.calculateRoute(mockStartPoint, mockEndPoint, 'car');
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await RoutingService.calculateRoute(mockStartPoint, mockEndPoint, 'car');
      expect(fetch).toHaveBeenCalledTimes(1); // Should not call API again
    });
  });
}); 