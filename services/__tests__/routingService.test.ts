import { RoutingService } from '../routingService';
import { Location, VehicleType, Waypoint, RoutePoint } from '@/types';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('RoutingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache before each test
    (RoutingService as any).routeCache?.clear?.();
  });

  const mockStartPoint: Location = {
    latitude: 40.7128,
    longitude: -74.0060,
    address: 'New York, NY'
  };

  const mockEndPoint: Location = {
    latitude: 34.0522,
    longitude: -118.2437,
    address: 'Los Angeles, CA'
  };

  const mockWaypoints: Waypoint[] = [
    {
      id: 'waypoint-1',
      location: { latitude: 39.7392, longitude: -104.9903, address: 'Denver, CO' },
      order: 1
    }
  ];

  describe('calculateRoute', () => {
    it('should calculate route between two points', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          routes: [{
            overview_polyline: {
              points: 'mock-polyline-data'
            },
            legs: [{
              distance: { value: 1000 },
              duration: { value: 120 },
              steps: [
                {
                  start_location: { lat: 40.7128, lng: -74.0060 },
                  end_location: { lat: 40.7130, lng: -74.0062 },
                  distance: { value: 500 },
                  duration: { value: 60 },
                  html_instructions: 'Head north'
                }
              ]
            }]
          }]
        })
      };

      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await RoutingService.calculateRoute(
        mockStartPoint,
        mockEndPoint,
        'driving'
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
        RoutingService.calculateRoute(mockStartPoint, mockEndPoint, 'driving')
      ).rejects.toThrow('Network error');
    });

    it('should validate different vehicle types', async () => {
      const vehicleTypes: VehicleType[] = ['driving', 'bicycle', 'walking'];
      
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          routes: [{
            overview_polyline: { points: 'mock-data' },
            legs: [{ distance: { value: 1000 }, duration: { value: 120 }, steps: [] }]
          }]
        })
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

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
        ok: true,
        json: () => Promise.resolve({
          routes: [{
            overview_polyline: { points: 'mock-polyline-data' },
            legs: [{
              distance: { value: 1000 },
              duration: { value: 120 },
              steps: []
            }]
          }]
        })
      };

      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await RoutingService.calculateMultiWaypointRoute(
        mockStartPoint,
        mockEndPoint,
        mockWaypoints,
        'driving'
      );

      expect(result.totalDistance).toBe(1000);
      expect(result.totalDuration).toBe(120);
      expect(result.routePoints.length).toBeGreaterThan(0);
    });

    it('should handle empty waypoints array', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          routes: [{
            overview_polyline: { points: 'mock-polyline-data' },
            legs: [{
              distance: { value: 1000 },
              duration: { value: 120 },
              steps: []
            }]
          }]
        })
      };

      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await RoutingService.calculateMultiWaypointRoute(
        mockStartPoint,
        mockEndPoint,
        [],
        'driving'
      );

      expect(result).toBeDefined();
      expect(result.totalDistance).toBe(1000);
    });
  });

  describe('generateRoutePointsAtIntervals', () => {
    it('should generate points at specified intervals', () => {
      const mockRoutePoints: RoutePoint[] = [
        { location: mockStartPoint, distance: 0, duration: 0 },
        { location: mockEndPoint, distance: 1000, duration: 120 }
      ];

      const result = RoutingService.generateRoutePointsAtIntervals(mockRoutePoints, 500);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual(mockStartPoint);
    });

    it('should handle short routes', () => {
      const mockRoutePoints: RoutePoint[] = [
        { location: mockStartPoint, distance: 0, duration: 0 },
        { location: mockEndPoint, distance: 100, duration: 12 }
      ];

      const result = RoutingService.generateRoutePointsAtIntervals(mockRoutePoints, 500);

      expect(result.length).toBe(2);
      expect(result[0]).toEqual(mockStartPoint);
      expect(result[1]).toEqual(mockEndPoint);
    });
  });

  describe('caching', () => {
    it('should cache route calculation results', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          routes: [{
            overview_polyline: { points: 'mock-data' },
            legs: [{ distance: { value: 1000 }, duration: { value: 120 }, steps: [] }]
          }]
        })
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      // First call
      await RoutingService.calculateRoute(mockStartPoint, mockEndPoint, 'driving');
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call (should use cache)
      await RoutingService.calculateRoute(mockStartPoint, mockEndPoint, 'driving');
      expect(fetch).toHaveBeenCalledTimes(1); // Should not call API again
    });
  });
}); 