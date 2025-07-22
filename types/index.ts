export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface RoutePoint {
  location: Location;
  instructions?: string;
  distance?: number;
  duration?: number;
}

export interface Waypoint {
  id: string;
  location: Location;
  order: number;
}

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface WeatherPoint {
  location: Location;
  weather: WeatherData;
  distanceFromStart: number;
}

export interface Route {
  id: string;
  name: string;
  startPoint: Location;
  endPoint: Location;
  waypoints: RoutePoint[];
  intermediateWaypoints: Waypoint[]; // New: intermediate stops between start and end
  weatherPoints: WeatherPoint[];
  vehicleType: VehicleType;
  totalDistance: number;
  totalDuration: number;
  createdAt: Date;
}

export type VehicleType = 'driving' | 'bicycle' | 'walking';

export type WeatherProvider = 'openweather' | 'weatherapi';

export interface RouteOptions {
  vehicle: VehicleType;
  avoidHighways: boolean;
  avoidTolls: boolean;
  avoidFerries: boolean;
  routeType: 'fastest' | 'shortest' | 'balanced';
}

export interface SavedRoute extends Route {
  isFavorite?: boolean;
}

// Re-export geocoding types for convenience
export type { SearchSuggestion, GeocodeResult } from '@/services/geocodingService';