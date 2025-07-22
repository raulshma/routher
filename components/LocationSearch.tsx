import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import { Input, Text, YStack, XStack } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useDebounce } from 'use-debounce';

import { GeocodingService, SearchSuggestion } from '@/services/geocodingService';
import { Location } from '@/types';

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
  buttonText?: string;
  value?: string;
  style?: any;
}

export function LocationSearch({ 
  onLocationSelect, 
  placeholder = "Search for a location",
  buttonText,
  value,
  style 
}: LocationSearchProps) {
  const [searchText, setSearchText] = useState(value || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedSearchText] = useDebounce(searchText, 300);

  // Update searchText when value prop changes
  useEffect(() => {
    if (value !== undefined && value !== searchText) {
      setSearchText(value);
    }
  }, [value]);

  // Load search suggestions when debounced text changes
  useEffect(() => {
    if (debouncedSearchText.length >= 2) {
      performSearch(debouncedSearchText);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchText]);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) return;

    setIsLoading(true);
    try {
      const result = await GeocodingService.searchWithAutocomplete(query, 5);
      setSuggestions(result.suggestions);
      setShowSuggestions(result.suggestions.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLocationSelect = useCallback((suggestion: SearchSuggestion) => {
    setSearchText(suggestion.displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();
    GeocodingService.addToRecentSearches(suggestion);
    onLocationSelect(suggestion.location);
  }, [onLocationSelect]);

  const handleTextChange = useCallback((text: string) => {
    setSearchText(text);
    if (text.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions.length]);

  const handleBlur = useCallback(() => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'address':
        return 'home-outline';
      case 'poi':
        return 'business-outline';
      case 'city':
        return 'location-outline';
      case 'country':
        return 'earth-outline';
      default:
        return 'location-outline';
    }
  };

  const renderSuggestionItem = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleLocationSelect(item)}
      activeOpacity={0.7}
    >
      <XStack alignItems="center" space="sm" flex={1}>
        <View style={styles.categoryIcon}>
          <Ionicons 
            name={getCategoryIcon(item.category)} 
            size={16} 
            color="#666" 
          />
        </View>
        <YStack flex={1}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {item.displayName.split(',')[0]}
          </Text>
          <Text variant="bodySmall" color="#666" numberOfLines={1}>
            {item.displayName.split(',').slice(1).join(',').trim()}
          </Text>
        </YStack>
      </XStack>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <Input
        value={searchText}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={styles.input}
      />

      {/* Clear button */}
      {searchText.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={() => handleTextChange('')}
        >
          <Ionicons name="close-circle" size={16} color="#666" />
        </TouchableOpacity>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingIndicator}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#666" />
        </View>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item, index) => `${item.id || index}`}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            maxToRenderPerBatch={10}
            initialNumToRender={5}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 0,
    paddingRight: 32, // Space for clear button
    color: '#1F2937',
  },
  clearButton: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  loadingIndicator: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    marginTop: 8,
    maxHeight: 240,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.08)',
  },
  suggestionItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.06)',
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 