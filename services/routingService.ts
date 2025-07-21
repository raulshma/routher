import { Location, RoutePoint, VehicleType, Waypoint } from '@/types';

const OSRM_BASE_URL = 'https://router.project-osrm.org';

// Route caching system
interface CacheEntry {
  result: any;
  timestamp: number;
  expiryTime: number;
}

class RouteCache {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached routes

  private generateCacheKey(
    startPoint: Location,
    endPoint: Location,
    vehicleType: VehicleType,
    waypoints?: Waypoint[]
  ): string {
    const waypointKey = waypoints 
      ? waypoints.map(wp => `${wp.location.latitude.toFixed(6)},${wp.location.longitude.toFixed(6)}`).join('|')
      : '';
    
    return `${startPoint.latitude.toFixed(6)},${startPoint.longitude.toFixed(6)}-${endPoint.latitude.toFixed(6)},${endPoint.longitude.toFixed(6)}-${vehicleType}-${waypointKey}`;
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiryTime) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.result;
  }

  set(key: string, result: any): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      expiryTime: Date.now() + this.CACHE_DURATION,
    });
  }

  getCacheKey(
    startPoint: Location,
    endPoint: Location,
    vehicleType: VehicleType,
    waypoints?: Waypoint[]
  ): string {
    return this.generateCacheKey(startPoint, endPoint, vehicleType, waypoints);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
    };
  }
}

export interface RouteAlternative {
  id: string;
  routePoints: RoutePoint[];
  totalDistance: number;
  totalDuration: number;
  geometry: Location[];
  description: string;
}

export class RoutingService {
  private static routeCache = new RouteCache();

  static getProfileForVehicle(vehicleType: VehicleType): string {
    switch (vehicleType) {
      case 'driving':
        return 'driving';
      case 'bicycle':
        return 'cycling';
      case 'walking':
        return 'foot';
      default:
        return 'driving';
    }
  }

  static async calculateRoute(
    startPoint: Location,
    endPoint: Location,
    vehicleType: VehicleType,
    intermediateWaypoints: Waypoint[] = []
  ): Promise<RoutePoint[]> {
    // Check cache first
    const cacheKey = this.routeCache.getCacheKey(startPoint, endPoint, vehicleType, intermediateWaypoints);
    const cachedResult = this.routeCache.get(cacheKey);
    if (cachedResult) {
      console.log('Using cached route result');
      return cachedResult;
    }

    try {
      const profile = this.getProfileForVehicle(vehicleType);
      
      // Sort waypoints by order and create coordinates string
      const sortedWaypoints = [...intermediateWaypoints].sort((a, b) => a.order - b.order);
      const allPoints = [startPoint, ...sortedWaypoints.map(wp => wp.location), endPoint];
      
      const coordinates = allPoints
        .map(point => `${point.longitude},${point.latitude}`)
        .join(';');
      
      const response = await fetch(
        `${OSRM_BASE_URL}/route/v1/${profile}/${coordinates}?steps=true&geometries=geojson&overview=full`
      );
      
      if (!response.ok) {
        throw new Error('Failed to calculate route');
      }
      
      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }
      
      const route = data.routes[0];
      const routePoints: RoutePoint[] = [];
      
      // Process each leg of the route (between consecutive points)
      route.legs.forEach((leg: any, legIndex: number) => {
        const steps = leg.steps || [];
        
        steps.forEach((step: any, stepIndex: number) => {
          routePoints.push({
            location: {
              latitude: step.maneuver.location[1],
              longitude: step.maneuver.location[0],
            },
            instructions: step.maneuver.instruction || 
              (stepIndex === 0 && legIndex === 0 ? 'Start your journey' : 
               stepIndex === steps.length - 1 && legIndex === route.legs.length - 1 ? 'Arrive at destination' :
               legIndex > 0 && stepIndex === 0 ? `Continue from waypoint ${legIndex}` :
               `Step ${stepIndex + 1}`),
            distance: step.distance,
            duration: step.duration,
          });
        });
      });
      
      // Cache the result
      this.routeCache.set(cacheKey, routePoints);
      
      return routePoints;
    } catch (error) {
      console.error('Error calculating route:', error);
      // Return a simple direct route for demo purposes
      const allPoints = [startPoint, ...intermediateWaypoints.map(wp => wp.location), endPoint];
      const fallbackResult = allPoints.map((point, index) => ({
        location: point,
        instructions: index === 0 ? 'Start your journey' : 
                     index === allPoints.length - 1 ? 'Arrive at destination' :
                     `Continue to waypoint ${index}`,
        distance: index > 0 ? this.calculateDistance(allPoints[index - 1], point) : 0,
        duration: index > 0 ? this.estimateDuration(allPoints[index - 1], point, vehicleType) : 0,
      }));
      
      // Cache fallback result too (with shorter expiry)
      this.routeCache.set(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  static async calculateRouteAlternatives(
    startPoint: Location,
    endPoint: Location,
    vehicleType: VehicleType,
    intermediateWaypoints: Waypoint[] = [],
    maxAlternatives: number = 3
  ): Promise<RouteAlternative[]> {
    // Check cache for alternatives
    const alternativesCacheKey = `alternatives-${this.routeCache.getCacheKey(startPoint, endPoint, vehicleType, intermediateWaypoints)}-${maxAlternatives}`;
    const cachedAlternatives = this.routeCache.get(alternativesCacheKey);
    if (cachedAlternatives) {
      console.log('Using cached route alternatives');
      return cachedAlternatives;
    }

    try {
      const profile = this.getProfileForVehicle(vehicleType);
      
      // Sort waypoints by order and create coordinates string
      const sortedWaypoints = [...intermediateWaypoints].sort((a, b) => a.order - b.order);
      const allPoints = [startPoint, ...sortedWaypoints.map(wp => wp.location), endPoint];
      
      const coordinates = allPoints
        .map(point => `${point.longitude},${point.latitude}`)
        .join(';');
      
      const response = await fetch(
        `${OSRM_BASE_URL}/route/v1/${profile}/${coordinates}?alternatives=${maxAlternatives}&steps=true&geometries=geojson&overview=full`
      );
      
      if (!response.ok) {
        throw new Error('Failed to calculate route alternatives');
      }
      
      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found');
      }
      
      const alternatives: RouteAlternative[] = data.routes.map((route: any, index: number) => {
        const routePoints: RoutePoint[] = [];
        
        // Process each leg of the route
        route.legs.forEach((leg: any, legIndex: number) => {
          const steps = leg.steps || [];
          
          steps.forEach((step: any, stepIndex: number) => {
            routePoints.push({
              location: {
                latitude: step.maneuver.location[1],
                longitude: step.maneuver.location[0],
              },
              instructions: step.maneuver.instruction || 
                (stepIndex === 0 && legIndex === 0 ? 'Start your journey' : 
                 stepIndex === steps.length - 1 && legIndex === route.legs.length - 1 ? 'Arrive at destination' :
                 legIndex > 0 && stepIndex === 0 ? `Continue from waypoint ${legIndex}` :
                 `Step ${stepIndex + 1}`),
              distance: step.distance,
              duration: step.duration,
            });
          });
        });
        
        // Generate description based on route characteristics
        let description = 'Alternative route';
        if (index === 0) {
          // Determine the best characteristic of the main route
          const fastestRoute = data.routes.reduce((fastest: any, current: any) => 
            current.duration < fastest.duration ? current : fastest
          );
          const shortestRoute = data.routes.reduce((shortest: any, current: any) => 
            current.distance < shortest.distance ? current : shortest
          );
          
          if (route.duration === fastestRoute.duration) {
            description = 'Fastest route';
          } else if (route.distance === shortestRoute.distance) {
            description = 'Shortest route';
          } else {
            description = 'Recommended route';
          }
        } else if (data.routes.length > 1) {
          // Compare with the first route to determine characteristics
          const mainRoute = data.routes[0];
          if (route.duration < mainRoute.duration) {
            description = 'Faster alternative';
          } else if (route.distance < mainRoute.distance) {
            description = 'Shorter alternative';
          } else {
            description = `Alternative route ${index + 1}`;
          }
        }
        
        return {
          id: `route-${index}`,
          routePoints,
          totalDistance: route.distance,
          totalDuration: route.duration,
          geometry: route.geometry.coordinates.map((coord: [number, number]) => ({
            latitude: coord[1],
            longitude: coord[0],
          })),
          description,
        };
      });
      
      // Cache the alternatives
      this.routeCache.set(alternativesCacheKey, alternatives);
      
      return alternatives;
    } catch (error) {
      console.error('Error calculating route alternatives:', error);
      
      // Fallback: return single route as alternative
      const fallbackRoute = await this.calculateRoute(startPoint, endPoint, vehicleType, intermediateWaypoints);
      const alternatives: RouteAlternative[] = [{
        id: 'route-0',
        routePoints: fallbackRoute,
        totalDistance: fallbackRoute.reduce((sum, point) => sum + (point.distance || 0), 0),
        totalDuration: fallbackRoute.reduce((sum, point) => sum + (point.duration || 0), 0),
        geometry: fallbackRoute.map(point => point.location),
        description: 'Route (offline mode)',
      }];
      
      // Cache fallback alternatives
      this.routeCache.set(alternativesCacheKey, alternatives);
      return alternatives;
    }
  }

  // Utility method to clear cache (useful for memory management)
  static clearCache(): void {
    this.routeCache.clear();
  }

  // Get cache statistics
  static getCacheStats(): { size: number; maxSize: number } {
    return this.routeCache.getStats();
  }

  private static generateRouteDescription(route: any, index: number): string {
    if (index === 0) {
      return 'Fastest route';
    }
    
    // Simple heuristic to categorize alternative routes
    const duration = route.duration;
    const distance = route.distance;
    
    if (distance < route.distance * 0.95) {
      return 'Shortest route';
    } else if (duration < route.duration * 1.1) {
      return 'Alternative route';
    } else {
      return `Route option ${index + 1}`;
    }
  }

  static async calculateMultiWaypointRoute(
    startPoint: Location,
    endPoint: Location,
    waypoints: Waypoint[],
    vehicleType: VehicleType
  ): Promise<{
    routePoints: RoutePoint[];
    totalDistance: number;
    totalDuration: number;
  }> {
    const routePoints = await this.calculateRoute(startPoint, endPoint, vehicleType, waypoints);
    
    const totalDistance = routePoints.reduce((sum, point) => sum + (point.distance || 0), 0);
    const totalDuration = routePoints.reduce((sum, point) => sum + (point.duration || 0), 0);
    
    return {
      routePoints,
      totalDistance,
      totalDuration,
    };
  }

  static calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(point1.latitude)) * Math.cos(this.deg2rad(point2.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distance in meters
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private static estimateDuration(
    point1: Location, 
    point2: Location, 
    vehicleType: VehicleType
  ): number {
    const distance = this.calculateDistance(point1, point2);
    const speedMap = {
      driving: 50, // km/h
      bicycle: 15, // km/h
      walking: 5, // km/h
    };
    
    const speed = speedMap[vehicleType];
    return (distance / 1000) / speed * 3600; // Duration in seconds
  }

  static generateRoutePointsAtIntervals(
    routePoints: RoutePoint[],
    intervalMeters: number = 1000
  ): Location[] {
    const result: Location[] = [];
    let currentDistance = 0;
    
    for (let i = 0; i < routePoints.length - 1; i++) {
      const currentPoint = routePoints[i];
      const nextPoint = routePoints[i + 1];
      const segmentDistance = currentPoint.distance || 0;
      
      result.push(currentPoint.location);
      
      // Add intermediate points if segment is longer than interval
      if (segmentDistance > intervalMeters) {
        const numIntervals = Math.floor(segmentDistance / intervalMeters);
        for (let j = 1; j <= numIntervals; j++) {
          const ratio = (j * intervalMeters) / segmentDistance;
          const interpolatedPoint = this.interpolateLocation(
            currentPoint.location,
            nextPoint.location,
            ratio
          );
          result.push(interpolatedPoint);
        }
      }
    }
    
    // Add the final point
    if (routePoints.length > 0) {
      result.push(routePoints[routePoints.length - 1].location);
    }
    
    return result;
  }

  private static interpolateLocation(
    point1: Location,
    point2: Location,
    ratio: number
  ): Location {
    return {
      latitude: point1.latitude + (point2.latitude - point1.latitude) * ratio,
      longitude: point1.longitude + (point2.longitude - point1.longitude) * ratio,
    };
  }
} 