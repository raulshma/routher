import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';


import { RouteProvider } from '@/contexts/RouteContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Set the main screen as the initial route
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark } = useTheme();

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <RouteProvider>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false,
              statusBarStyle: isDark ? 'light' : 'dark',
              statusBarBackgroundColor: 'transparent',
            }} 
          />
          <Stack.Screen 
            name="saved-routes" 
            options={{ 
              headerShown: true,
              title: 'Saved Routes',
              presentation: 'modal',
              headerStyle: {
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              },
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
              },
            }} 
          />
          <Stack.Screen 
            name="route-details" 
            options={{ 
              headerShown: true,
              title: 'Route Details',
              presentation: 'card',
              headerStyle: {
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              },
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
              },
            }} 
          />
          <Stack.Screen 
            name="settings" 
            options={{ 
              headerShown: true,
              title: 'Settings',
              presentation: 'modal',
              headerStyle: {
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              },
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
              },
            }} 
          />
        </Stack>
      </RouteProvider>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
