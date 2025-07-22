import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

interface QuickActionsProps {
  onStartNavigation: () => void;
  onSaveRoute: () => void;
  onShareRoute: () => void;
  onShowDirections: () => void;
  hasRoute: boolean;
  routeInfo?: {
    distance: number;
    duration: number;
  } | null;
}

export function QuickActions({
  onStartNavigation,
  onSaveRoute,
  onShareRoute,
  onShowDirections,
  hasRoute,
  routeInfo,
}: QuickActionsProps) {
  const { colors } = useTheme();

  if (!hasRoute || !routeInfo) {
    return null;
  }

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    }
    return `${(distance / 1000).toFixed(1)} km`;
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Route Summary */}
      <View style={styles.routeInfo}>
        <Text variant="titleMedium" style={{ color: colors.onSurface }}>
          {formatDistance(routeInfo.distance)} • {formatDuration(routeInfo.duration)}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          Fastest route now
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={onStartNavigation}
        >
          <Ionicons name="navigate" size={20} color="white" />
          <Text style={[styles.primaryButtonText, { color: 'white' }]}>Start</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={onShowDirections}
        >
          <Ionicons name="list" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={onSaveRoute}
        >
          <Ionicons name="bookmark-outline" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={onShareRoute}
        >
          <Ionicons name="share-outline" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  routeInfo: {
    flex: 1,
    marginRight: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 