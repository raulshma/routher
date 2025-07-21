import { Location, RoutePoint, VehicleType } from '@/types';

const OSRM_BASE_URL = 'https://router.project-osrm.org';

export class RoutingService {
  static getProfileForVehicle(vehicleType: VehicleType): string {
    switch (vehicleType) {
      case 'car':
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
    vehicleType: VehicleType
  ): Promise<RoutePoint[]> {
    try {
      const profile = this.getProfileForVehicle(vehicleType);
      const coordinates = `${startPoint.longitude},${startPoint.latitude};${endPoint.longitude},${endPoint.latitude}`;
      
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
      const steps = route.legs[0].steps;
      
      const routePoints: RoutePoint[] = steps.map((step: any, index: number) => ({
        location: {
          latitude: step.maneuver.location[1],
          longitude: step.maneuver.location[0],
        },
        instructions: step.maneuver.instruction || `Step ${index + 1}`,
        distance: step.distance,
        duration: step.duration,
      }));
      
      return routePoints;
    } catch (error) {
      console.error('Error calculating route:', error);
      // Return a simple direct route for demo purposes
      return [
        {
          location: startPoint,
          instructions: 'Start your journey',
          distance: 0,
          duration: 0,
        },
        {
          location: endPoint,
          instructions: 'Arrive at destination',
          distance: this.calculateDistance(startPoint, endPoint),
          duration: this.estimateDuration(startPoint, endPoint, vehicleType),
        },
      ];
    }
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
      car: 50, // km/h
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