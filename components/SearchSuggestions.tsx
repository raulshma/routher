import React from 'react';
import { FlatList, Pressable } from 'react-native';
import { Card, Text, YStack, XStack, Separator } from './ui';
import { SearchSuggestion } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getFontSize, getSpacingKey, getFontWeight } from '../constants/UISizes';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  isLoading?: boolean;
  error?: string;
  searchQuery?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSuggestionSelect,
  isLoading = false,
  error,
  searchQuery,
}) => {
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <YStack padding={16} backgroundColor={colors.surface} style={{ borderRadius: 12 }}>
        <Text fontSize={getFontSize('$3')} color={colors.onSurfaceVariant} textAlign="center">
          Searching for locations...
        </Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack padding={16} backgroundColor={colors.surface} style={{ borderRadius: 12 }}>
        <Text fontSize={getFontSize('$3')} color={colors.onSurfaceVariant} textAlign="center">
          ⚠️ Error searching locations
        </Text>
        <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant} textAlign="center">
          {error}
        </Text>
      </YStack>
    );
  }

  if (suggestions.length === 0 && searchQuery) {
    return (
      <YStack backgroundColor={colors.surface} style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.outline }}>
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" padding={8} backgroundColor={colors.surfaceContainer}>
          <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant} fontWeight={getFontWeight('700')}>
            Search Results
          </Text>
          {searchQuery && (
            <Text fontSize={getFontSize('$2')} color={colors.primary}>
              "{searchQuery}"
            </Text>
          )}
        </XStack>

        {/* Empty State */}
        <YStack padding={8} backgroundColor={colors.surfaceContainerLow}>
          <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant} textAlign="center">
            No locations found for your search.
          </Text>
        </YStack>
      </YStack>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const renderSuggestion = ({ item: suggestion, index }: { item: SearchSuggestion; index: number }) => (
    <Pressable
      onPress={() => onSuggestionSelect(suggestion)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <XStack alignItems="center" space="md" padding={16}>
        <Text fontSize={getFontSize('$4')}>
          📍
        </Text>
        <YStack flex={1} space="xs">
          <Text fontSize={getFontSize('$3')} fontWeight={getFontWeight('600')} numberOfLines={1}>
            {suggestion.displayName}
          </Text>
          <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant} numberOfLines={1}>
            {suggestion.address}
          </Text>
          {suggestion.category && (
            <Text fontSize={getFontSize('$2')} color={colors.onSurface} numberOfLines={2}>
              {suggestion.category}
            </Text>
          )}
        </YStack>
        <Text fontSize={getFontSize('$1')} color={colors.onSurface}>
          {/* Distance indicator could go here */}
        </Text>
      </XStack>
      {index < suggestions.length - 1 && (
        <Separator style={{ borderColor: colors.outline }} />
      )}
    </Pressable>
  );

  return (
    <YStack backgroundColor={colors.surface} style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.outline }}>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" padding={8} backgroundColor={colors.surfaceContainer}>
        <Text fontSize={getFontSize('$2')} color={colors.onSurfaceVariant} fontWeight={getFontWeight('700')}>
          Suggested Locations ({suggestions.length})
        </Text>
        {searchQuery && (
          <Text fontSize={getFontSize('$2')} color={colors.primary}>
            "{searchQuery}"
          </Text>
        )}
      </XStack>

      {/* Suggestions List */}
      <FlatList
        data={suggestions}
        renderItem={renderSuggestion}
        keyExtractor={(item, index) => `${item.displayName}-${index}`}
        scrollEnabled={false}
        style={{ maxHeight: 300 }}
      />
    </YStack>
  );
}; 