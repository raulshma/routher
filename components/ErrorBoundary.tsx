import React, { Component, ReactNode } from 'react';
import { YStack, Text, Button } from 'tamagui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo: errorInfo.componentStack || undefined,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$4"
          backgroundColor="$background"
        >
          <YStack space="$4" maxWidth={300} alignItems="center">
            <Text fontSize="$8">🚫</Text>
            
            <Text fontSize="$6" fontWeight="bold" textAlign="center">
              Something went wrong
            </Text>
            
            <Text fontSize="$4" color="$gray11" textAlign="center">
              The app encountered an unexpected error. Please try refreshing or restarting the application.
            </Text>
            
            {this.state.error && (
              <YStack 
                padding="$3" 
                backgroundColor="$red1" 
                borderRadius="$3" 
                borderColor="$red7" 
                borderWidth={1}
                maxWidth="100%"
              >
                <Text fontSize="$3" color="$red11" fontWeight="bold">
                  Error Details:
                </Text>
                <Text fontSize="$2" color="$red10" numberOfLines={3}>
                  {this.state.error.message}
                </Text>
              </YStack>
            )}
            
            <Button
              onPress={() => {
                this.setState({ hasError: false, error: undefined, errorInfo: undefined });
              }}
              backgroundColor="$blue7"
              pressStyle={{ scale: 0.95 }}
            >
              🔄 Try Again
            </Button>
          </YStack>
        </YStack>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier wrapping
export function withErrorBoundary<T extends {}>(
  WrappedComponent: React.ComponentType<T>,
  fallback?: ReactNode
) {
  const ComponentWithErrorBoundary = (props: T) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ComponentWithErrorBoundary;
}

// Specialized error boundaries for different components
export const MapErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <YStack 
        flex={1} 
        justifyContent="center" 
        alignItems="center" 
        backgroundColor="$gray2"
        padding="$4"
      >
        <Text fontSize="$6">🗺️</Text>
        <Text fontSize="$4" fontWeight="bold" textAlign="center" marginTop="$2">
          Map Error
        </Text>
        <Text fontSize="$3" color="$gray11" textAlign="center" marginTop="$1">
          Unable to load the map. Please check your connection and try again.
        </Text>
      </YStack>
    }
  >
    {children}
  </ErrorBoundary>
);

export const RouteErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <YStack 
        padding="$3" 
        backgroundColor="$yellow1" 
        borderRadius="$3"
        borderColor="$yellow7"
        borderWidth={1}
      >
        <Text fontSize="$4" fontWeight="bold" color="$yellow11">
          ⚠️ Route Calculation Error
        </Text>
        <Text fontSize="$3" color="$yellow10" marginTop="$1">
          Unable to calculate route. Please check your locations and try again.
        </Text>
      </YStack>
    }
  >
    {children}
  </ErrorBoundary>
);

export const SearchErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <YStack 
        padding="$3" 
        backgroundColor="$red1" 
        borderRadius="$3"
        borderColor="$red7"
        borderWidth={1}
      >
        <Text fontSize="$3" color="$red11">
          ❌ Search temporarily unavailable
        </Text>
      </YStack>
    }
  >
    {children}
  </ErrorBoundary>
); 