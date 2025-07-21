import React from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';

/**
 * Accessibility Helper utilities for the Route & Weather Planner app
 */

export interface AccessibilityAnnouncement {
  message: string;
  priority?: 'low' | 'medium' | 'high';
}

export class AccessibilityHelper {
  /**
   * Announce a message to screen readers
   */
  static announce(announcement: AccessibilityAnnouncement): void {
    const { message, priority = 'medium' } = announcement;
    
    if (AccessibilityInfo.isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }

  /**
   * Focus on a specific component for accessibility
   */
  static focusOnElement(ref: React.RefObject<any>): void {
    if (ref.current && AccessibilityInfo.isScreenReaderEnabled) {
      const reactTag = findNodeHandle(ref.current);
      if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }
  }

  /**
   * Generate accessibility label for route information
   */
  static getRouteAccessibilityLabel(
    distance: number,
    duration: number,
    vehicleType: string
  ): string {
    const distanceText = distance < 1000 
      ? `${Math.round(distance)} meters`
      : `${Math.round(distance / 1000 * 10) / 10} kilometers`;
    
    const durationText = duration < 3600
      ? `${Math.round(duration / 60)} minutes`
      : `${Math.floor(duration / 3600)} hours and ${Math.round((duration % 3600) / 60)} minutes`;

    return `Route by ${vehicleType}: ${distanceText}, estimated time ${durationText}`;
  }

  /**
   * Generate accessibility label for weather information
   */
  static getWeatherAccessibilityLabel(
    temperature: number,
    description: string,
    windSpeed: number,
    precipitation: number
  ): string {
    let weatherText = `Weather: ${Math.round(temperature)} degrees Celsius, ${description}`;
    
    if (windSpeed > 0) {
      weatherText += `, wind speed ${Math.round(windSpeed)} meters per second`;
    }
    
    if (precipitation > 0) {
      weatherText += `, precipitation ${Math.round(precipitation)} millimeters`;
    }

    return weatherText;
  }

  /**
   * Generate accessibility hint for interactive elements
   */
  static getInteractionHint(action: string, element: string): string {
    const actionMap: Record<string, string> = {
      tap: 'Double tap to activate',
      longPress: 'Press and hold to activate',
      swipe: 'Swipe to navigate',
      pinch: 'Pinch to zoom',
    };

    return `${actionMap[action] || 'Interact with'} ${element}`;
  }

  /**
   * Check if reduce motion is enabled
   */
  static async isReduceMotionEnabled(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isReduceMotionEnabled();
    } catch (error) {
      console.warn('Could not check reduce motion setting:', error);
      return false;
    }
  }

  /**
   * Check if screen reader is enabled
   */
  static async isScreenReaderEnabled(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isScreenReaderEnabled();
    } catch (error) {
      console.warn('Could not check screen reader setting:', error);
      return false;
    }
  }
}

/**
 * Hook for accessibility state management
 */
export function useAccessibility() {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = React.useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = React.useState(false);

  React.useEffect(() => {
    const checkAccessibilitySettings = async () => {
      const screenReader = await AccessibilityHelper.isScreenReaderEnabled();
      const reduceMotion = await AccessibilityHelper.isReduceMotionEnabled();
      
      setIsScreenReaderEnabled(screenReader);
      setIsReduceMotionEnabled(reduceMotion);
    };

    checkAccessibilitySettings();

    // Listen for accessibility changes
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled
    );

    return () => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
    };
  }, []);

  const announce = React.useCallback((announcement: AccessibilityAnnouncement) => {
    AccessibilityHelper.announce(announcement);
  }, []);

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    announce,
    focusOnElement: AccessibilityHelper.focusOnElement,
    getRouteLabel: AccessibilityHelper.getRouteAccessibilityLabel,
    getWeatherLabel: AccessibilityHelper.getWeatherAccessibilityLabel,
    getInteractionHint: AccessibilityHelper.getInteractionHint,
  };
}

/**
 * Accessible Button wrapper component
 */
interface AccessibleButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  disabled?: boolean;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  disabled = false,
}) => {
  return (
    <div
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onPress}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onPress();
        }
      }}
    >
      {children}
    </div>
  );
};

/**
 * Accessible live region for dynamic content updates
 */
interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = 'polite',
  atomic = false,
}) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      style={{ position: 'absolute', left: '-10000px' }}
    >
      {children}
    </div>
  );
}; 