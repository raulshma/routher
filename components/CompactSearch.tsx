import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { LocationSearch } from '@/components/LocationSearch';
import { useTheme } from '@/contexts/ThemeContext';
import { Location } from '@/types';

interface CompactSearchProps {
  startPoint?: Location;
  endPoint?: Location;
  onStartPointChange: (location: Location) => void;
  onEndPointChange: (location: Location) => void;
  onSwap: () => void;
  onMenuPress: () => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

export function CompactSearch({
  startPoint,
  endPoint,
  onStartPointChange,
  onEndPointChange,
  onSwap,
  onMenuPress,
  expanded = false,
  onToggleExpanded,
}: CompactSearchProps) {
  const { colors } = useTheme();
  const [focusedInput, setFocusedInput] = useState<'start' | 'end' | null>(null);

  const hasRoute = startPoint && endPoint;

  if (!expanded) {
    // Compact mode - single search bar like Google Maps
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={onMenuPress}
        >
          <Ionicons name="menu" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={onToggleExpanded}
        >
          <Ionicons name="search" size={20} color={colors.onSurfaceVariant} />
          <Text style={[styles.searchPlaceholder, { color: colors.onSurfaceVariant }]}>
            {hasRoute 
              ? `${startPoint.address?.slice(0, 15) || 'Start'}... to ${endPoint.address?.slice(0, 15) || 'End'}...`
              : 'Search for places'
            }
          </Text>
        </TouchableOpacity>

        {hasRoute && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onSwap}
          >
            <Ionicons name="swap-vertical" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Expanded mode - full search interface
  return (
    <View style={[styles.expandedContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onToggleExpanded}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text variant="titleMedium" style={{ color: colors.onSurface }}>
          Choose destinations
        </Text>
      </View>

      <View style={styles.inputsContainer}>
        <View style={styles.inputRow}>
          <View style={styles.inputIcon}>
            <Ionicons name="radio-button-on" size={16} color="#10B981" />
          </View>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceVariant }]}>
            <LocationSearch
              onLocationSelect={onStartPointChange}
              placeholder="Choose starting point"
              value={startPoint?.address}
              style={[styles.input, { color: colors.onSurface }]}
            />
          </View>
        </View>

        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: colors.outline }]} />
          <TouchableOpacity 
            style={[styles.swapButton, { backgroundColor: colors.surface }]}
            onPress={onSwap}
          >
            <Ionicons name="swap-vertical" size={16} color={colors.onSurface} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputIcon}>
            <Ionicons name="location" size={16} color="#EF4444" />
          </View>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceVariant }]}>
            <LocationSearch
              onLocationSelect={onEndPointChange}
              placeholder="Choose destination"
              value={endPoint?.address}
              style={[styles.input, { color: colors.onSurface }]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact mode styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Expanded mode styles
  expandedContainer: {
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
    flex: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    marginLeft: 36,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  swapButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
}); 