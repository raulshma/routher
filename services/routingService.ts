import { Location, RoutePoint, VehicleType, Waypoint } from '@/types';

const OSRM_BASE_URL = 'https://router.project-osrm.org';

export interface RouteAlternative {
  id: string;
  routePoints: RoutePoint[];
  totalDistance: number;
  totalDuration: number;
  geometry: Location[];
  description: string;
}

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
    vehicleType: VehicleType,
    intermediateWaypoints: Waypoint[] = []
  ): Promise<RoutePoint[]> {
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
      
      return routePoints;
    } catch (error) {
      console.error('Error calculating route:', error);
      // Return a simple direct route for demo purposes
      const allPoints = [startPoint, ...intermediateWaypoints.map(wp => wp.location), endPoint];
      return allPoints.map((point, index) => ({
        location: point,
        instructions: index === 0 ? 'Start your journey' : 
                     index === allPoints.length - 1 ? 'Arrive at destination' :
                     `Continue to waypoint ${index}`,
        distance: index > 0 ? this.calculateDistance(allPoints[index - 1], point) : 0,
        duration: index > 0 ? this.estimateDuration(allPoints[index - 1], point, vehicleType) : 0,
      }));
    }
  }

  static async calculateRouteAlternatives(
    startPoint: Location,
    endPoint: Location,
    vehicleType: VehicleType,
    intermediateWaypoints: Waypoint[] = [],
    maxAlternatives: number = 3
  ): Promise<RouteAlternative[]> {
    try {
      const profile = this.getProfileForVehicle(vehicleType);
      
      // Sort waypoints by order and create coordinates string
      const sortedWaypoints = [...intermediateWaypoints].sort((a, b) => a.order - b.order);
      const allPoints = [startPoint, ...sortedWaypoints.map(wp => wp.location), endPoint];
      
      const coordinates = allPoints
        .map(point => `${point.longitude},${point.latitude}`)
        .join(';');
      
      const response = await fetch(
        `${OSRM_BASE_URL}/route/v1/${profile}/${coordinates}?steps=true&geometries=geojson&overview=full&alternatives=${maxAlternatives}`
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

        // Extract geometry coordinates from the route
        const geometry: Location[] = route.geometry.coordinates.map((coord: [number, number]) => ({
          longitude: coord[0],
          latitude: coord[1],
        }));

        // Generate description based on route characteristics
        const description = this.generateRouteDescription(route, index);

        return {
          id: `route-${index}`,
          routePoints,
          totalDistance: route.distance,
          totalDuration: route.duration,
          geometry,
          description,
        };
      });

      return alternatives;
    } catch (error) {
      console.error('Error calculating route alternatives:', error);
      // Return fallback with single route
      const routePoints = await this.calculateRoute(startPoint, endPoint, vehicleType, intermediateWaypoints);
      const totalDistance = routePoints.reduce((sum, point) => sum + (point.distance || 0), 0);
      const totalDuration = routePoints.reduce((sum, point) => sum + (point.duration || 0), 0);
      
      return [{
        id: 'route-0',
        routePoints,
        totalDistance,
        totalDuration,
        geometry: routePoints.map(point => point.location),
        description: 'Main route',
      }];
    }
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