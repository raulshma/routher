import { Location } from '@/types';

// Enhanced types for search suggestions
export interface SearchSuggestion {
  id: string;
  displayName: string;
  address: string;
  location: Location;
  category: 'address' | 'poi' | 'city' | 'country';
  importance: number;
}

export interface GeocodeResult {
  suggestions: SearchSuggestion[];
  hasMore: boolean;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export class GeocodingService {
  private static cache = new Map<string, GeocodeResult>();
  private static recentSearches: SearchSuggestion[] = [];
  
  static async searchWithAutocomplete(
    query: string,
    limit: number = 5,
    countryCode?: string
  ): Promise<GeocodeResult> {
    if (!query || query.trim().length < 2) {
      return {
        suggestions: this.getRecentSearches(limit),
        hasMore: false,
      };
    }

    const normalizedQuery = query.trim().toLowerCase();
    
    // Check cache first
    const cacheKey = `${normalizedQuery}:${limit}:${countryCode || ''}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const params = new URLSearchParams({
        format: 'json',
        q: query,
        limit: String(Math.max(limit, 10)), // Get more results for better filtering
        addressdetails: '1',
        extratags: '1',
        namedetails: '1',
        'accept-language': 'en',
      });

      if (countryCode) {
        params.append('countrycodes', countryCode);
      }

      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'RouteWeatherPlanner/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding request failed: ${response.status}`);
      }

      const data = await response.json();
      const suggestions = this.parseNominatimResults(data, limit);
      
      const result: GeocodeResult = {
        suggestions,
        hasMore: data.length > limit,
      };

      // Cache the result
      this.cache.set(cacheKey, result);
      
             // Clean cache if it gets too large
       if (this.cache.size > 100) {
         const firstKey = this.cache.keys().next().value;
         if (firstKey) {
           this.cache.delete(firstKey);
         }
       }

      return result;
    } catch (error) {
      console.error('Error in autocomplete search:', error);
      return {
        suggestions: this.getRecentSearches(limit),
        hasMore: false,
      };
    }
  }

  static async reverseGeocode(location: Location): Promise<SearchSuggestion | null> {
    try {
      const params = new URLSearchParams({
        format: 'json',
        lat: String(location.latitude),
        lon: String(location.longitude),
        addressdetails: '1',
        zoom: '18',
      });

      const response = await fetch(
        `${NOMINATIM_BASE_URL}/reverse?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'RouteWeatherPlanner/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.display_name) {
        return {
          id: data.place_id?.toString() || `${location.latitude},${location.longitude}`,
          displayName: data.display_name,
          address: data.display_name,
          location,
          category: this.categorizeResult(data),
          importance: parseFloat(data.importance) || 0,
        };
      }

      return null;
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      return null;
    }
  }

  private static parseNominatimResults(data: any[], limit: number): SearchSuggestion[] {
    return data
      .slice(0, limit)
      .map((item, index) => ({
        id: item.place_id?.toString() || `${item.lat},${item.lon}`,
        displayName: this.formatDisplayName(item),
        address: item.display_name,
        location: {
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          address: item.display_name,
        },
        category: this.categorizeResult(item),
        importance: parseFloat(item.importance) || (1 - index * 0.1),
      }))
      .sort((a, b) => b.importance - a.importance);
  }

  private static formatDisplayName(item: any): string {
    const address = item.address || {};
    const parts: string[] = [];

    // Priority order for display name
    if (address.house_number && address.road) {
      parts.push(`${address.house_number} ${address.road}`);
    } else if (address.road) {
      parts.push(address.road);
    } else if (item.name) {
      parts.push(item.name);
    }

    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }

    if (address.state && address.country) {
      parts.push(`${address.state}, ${address.country}`);
    } else if (address.country) {
      parts.push(address.country);
    }

    return parts.join(', ') || item.display_name;
  }

  private static categorizeResult(item: any): 'address' | 'poi' | 'city' | 'country' {
    const type = item.type?.toLowerCase();
    const addressType = item.addresstype?.toLowerCase();
    
    if (addressType === 'house' || type === 'house' || item.address?.house_number) {
      return 'address';
    }
    
    if (type === 'city' || type === 'town' || type === 'village' || addressType === 'city') {
      return 'city';
    }
    
    if (type === 'country' || addressType === 'country') {
      return 'country';
    }
    
    return 'poi';
  }

  static addToRecentSearches(suggestion: SearchSuggestion): void {
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(s => s.id !== suggestion.id);
    
    // Add to beginning
    this.recentSearches.unshift(suggestion);
    
    // Keep only last 10
    this.recentSearches = this.recentSearches.slice(0, 10);
  }

  static getRecentSearches(limit: number = 5): SearchSuggestion[] {
    return this.recentSearches.slice(0, limit);
  }

  static clearRecentSearches(): void {
    this.recentSearches = [];
  }

  static getCategoryIcon(category: string): string {
    const iconMap = {
      address: '🏠',
      poi: '📍',
      city: '🏙️',
      country: '🌍',
    };
    return iconMap[category as keyof typeof iconMap] || '📍';
  }

  static getCategoryLabel(category: string): string {
    const labelMap = {
      address: 'Address',
      poi: 'Point of Interest',
      city: 'City',
      country: 'Country',
    };
    return labelMap[category as keyof typeof labelMap] || 'Location';
  }
} 