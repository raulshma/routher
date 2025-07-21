import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedRoute } from '@/types';

const ROUTES_STORAGE_KEY = 'saved_routes';

export class StorageService {
  static async saveRoute(route: SavedRoute): Promise<void> {
    try {
      const existingRoutes = await this.getSavedRoutes();
      const updatedRoutes = [...existingRoutes, route];
      await AsyncStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(updatedRoutes));
    } catch (error) {
      console.error('Error saving route:', error);
      throw new Error('Failed to save route');
    }
  }

  static async getSavedRoutes(): Promise<SavedRoute[]> {
    try {
      const routesData = await AsyncStorage.getItem(ROUTES_STORAGE_KEY);
      if (!routesData) {
        return [];
      }
      
      const routes = JSON.parse(routesData);
      // Convert date strings back to Date objects
      return routes.map((route: any) => ({
        ...route,
        createdAt: new Date(route.createdAt),
      }));
    } catch (error) {
      console.error('Error loading saved routes:', error);
      return [];
    }
  }

  static async deleteRoute(routeId: string): Promise<void> {
    try {
      const existingRoutes = await this.getSavedRoutes();
      const updatedRoutes = existingRoutes.filter(route => route.id !== routeId);
      await AsyncStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(updatedRoutes));
    } catch (error) {
      console.error('Error deleting route:', error);
      throw new Error('Failed to delete route');
    }
  }

  static async updateRoute(routeId: string, updates: Partial<SavedRoute>): Promise<void> {
    try {
      const existingRoutes = await this.getSavedRoutes();
      const routeIndex = existingRoutes.findIndex(route => route.id === routeId);
      
      if (routeIndex === -1) {
        throw new Error('Route not found');
      }
      
      existingRoutes[routeIndex] = { ...existingRoutes[routeIndex], ...updates };
      await AsyncStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(existingRoutes));
    } catch (error) {
      console.error('Error updating route:', error);
      throw new Error('Failed to update route');
    }
  }

  static async clearAllRoutes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ROUTES_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing routes:', error);
      throw new Error('Failed to clear routes');
    }
  }
} 