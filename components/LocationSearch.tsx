import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { YStack, XStack, Button, Input, Text } from 'tamagui';
import { useDebounce } from 'use-debounce';
import { Location } from '@/types';
import { GeocodingService, SearchSuggestion, GeocodeResult } from '@/services/geocodingService';
import { SearchSuggestions } from './SearchSuggestions';

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
  showRecentSearches?: boolean;
}

export function LocationSearch({ 
  onLocationSelect, 
  placeholder = "Search for an address or place...",
  buttonText = "Search",
  autoFocus = false,
  showRecentSearches = true,
}: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [hasMore, setHasMore] = useState(false);
  
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    fetchSuggestions(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const fetchSuggestions = async (query: string) => {
    setIsSearching(true);
    try {
      const result: GeocodeResult = await GeocodingService.searchWithAutocomplete(query, 8);
      setSuggestions(result.suggestions);
      setHasMore(result.hasMore);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setHasMore(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    GeocodingService.addToRecentSearches(suggestion);
    onLocationSelect(suggestion.location);
    setSearchQuery(suggestion.displayName);
    setShowSuggestions(false);
  };

  const handleClearRecent = () => {
    GeocodingService.clearRecentSearches();
    if (debouncedSearchQuery.trim().length < 2) {
      setSuggestions([]);
    }
  };

  const handleInputFocus = () => {
    if (showRecentSearches && searchQuery.trim().length < 2) {
      fetchSuggestions('');
    } else {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for suggestion tap
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search query.');
      return;
    }

    setIsSearching(true);
    try {
      // Using a free geocoding service (Nominatim from OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search location');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        Alert.alert('No Results', 'No locations found for your search query. Please try a different search term.');
        return;
      }
      
      const result = data[0];
      const location: Location = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        address: result.display_name,
      };
      
      onLocationSelect(location);
      setSearchQuery('');
      
    } catch (error) {
      console.error('Error searching location:', error);
      Alert.alert('Error', 'Failed to search for location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <YStack space="$2">
      <XStack space="$2" alignItems="center">
        <Input
          flex={1}
          placeholder={placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchLocation}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          returnKeyType="search"
          autoFocus={autoFocus}
        />
        <Button 
          onPress={searchLocation}
          disabled={isSearching || !searchQuery.trim()}
          backgroundColor="$blue7"
        >
          {isSearching ? '...' : buttonText}
        </Button>
      </XStack>
      
      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <SearchSuggestions
          suggestions={suggestions}
          isLoading={isSearching}
          hasMore={hasMore}
          onSuggestionPress={handleSuggestionPress}
          onClearRecent={showRecentSearches ? handleClearRecent : undefined}
          showRecentHeader={showRecentSearches && debouncedSearchQuery.trim().length < 2}
        />
      )}
      
      <Text fontSize="$2" color="$gray11" textAlign="center">
        {showSuggestions && isSearching ? 
          'Searching...' : 
          'Search for addresses, cities, landmarks, or points of interest'
        }
      </Text>
    </YStack>
  );
} 