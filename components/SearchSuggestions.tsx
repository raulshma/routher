import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { YStack, XStack, Text, Separator } from 'tamagui';
import { SearchSuggestion, GeocodingService } from '@/services/geocodingService';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  hasMore: boolean;
  onSuggestionPress: (suggestion: SearchSuggestion) => void;
  onClearRecent?: () => void;
  showRecentHeader?: boolean;
}

const SearchSuggestions = React.memo(({
  suggestions,
  isLoading,
  hasMore,
  onSuggestionPress,
  onClearRecent,
  showRecentHeader = false,
}: SearchSuggestionsProps) => {
  const handleSuggestionPress = useCallback((suggestion: SearchSuggestion) => {
    onSuggestionPress(suggestion);
  }, [onSuggestionPress]);

  const handleClearRecent = useCallback(() => {
    if (onClearRecent) {
      onClearRecent();
    }
  }, [onClearRecent]);

  if (isLoading) {
    return (
      <YStack padding="$3" backgroundColor="$background" borderRadius="$3">
        <Text fontSize="$3" color="$gray11" textAlign="center">
          Searching...
        </Text>
      </YStack>
    );
  }

  if (suggestions.length === 0) {
    return (
      <YStack padding="$3" backgroundColor="$background" borderRadius="$3">
        <Text fontSize="$3" color="$gray11" textAlign="center">
          No suggestions found
        </Text>
      </YStack>
    );
  }

  return (
    <YStack backgroundColor="$background" borderRadius="$3" borderWidth={1} borderColor="$gray6">
      {showRecentHeader && (
        <XStack justifyContent="space-between" alignItems="center" padding="$2" backgroundColor="$gray2">
          <Text fontSize="$2" color="$gray11" fontWeight="bold">
            Recent Searches
          </Text>
          {onClearRecent && (
            <TouchableOpacity onPress={handleClearRecent}>
              <Text fontSize="$2" color="$blue9">
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </XStack>
      )}
      
      <ScrollView style={styles.scrollView} nestedScrollEnabled>
        <YStack>
          {suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={suggestion.id}
              suggestion={suggestion}
              onPress={handleSuggestionPress}
              showSeparator={index < suggestions.length - 1}
            />
          ))}
          
          {hasMore && (
            <YStack padding="$2" backgroundColor="$gray1">
              <Text fontSize="$2" color="$gray11" textAlign="center">
                More results available...
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
});

// Memoized suggestion item component
const SuggestionItem = React.memo(({
  suggestion,
  onPress,
  showSeparator,
}: {
  suggestion: SearchSuggestion;
  onPress: (suggestion: SearchSuggestion) => void;
  showSeparator: boolean;
}) => {
  const handlePress = useCallback(() => {
    onPress(suggestion);
  }, [onPress, suggestion]);

  return (
    <React.Fragment>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.suggestionItem}
      >
        <XStack alignItems="center" space="$3" padding="$3">
          <Text fontSize="$4">
            {GeocodingService.getCategoryIcon(suggestion.category)}
          </Text>
          <YStack flex={1} space="$1">
            <Text fontSize="$3" fontWeight="600" numberOfLines={1}>
              {suggestion.displayName}
            </Text>
            <Text fontSize="$2" color="$gray11" numberOfLines={1}>
              {GeocodingService.getCategoryLabel(suggestion.category)}
            </Text>
            {suggestion.address !== suggestion.displayName && (
              <Text fontSize="$2" color="$gray10" numberOfLines={2}>
                {suggestion.address}
              </Text>
            )}
          </YStack>
          <Text fontSize="$1" color="$gray9">
            →
          </Text>
        </XStack>
      </TouchableOpacity>
      {showSeparator && (
        <Separator borderColor="$gray4" />
      )}
    </React.Fragment>
  );
});

SearchSuggestions.displayName = 'SearchSuggestions';
SuggestionItem.displayName = 'SuggestionItem';

export { SearchSuggestions };

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 300,
  },
  suggestionItem: {
    backgroundColor: 'transparent',
  },
}); 