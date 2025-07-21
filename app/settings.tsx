import React from 'react';
import { StyleSheet } from 'react-native';
import { YStack, XStack, Text, Button, Card, ScrollView, RadioGroup } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, isDark } = useTheme();

  const themeOptions = [
    {
      value: 'system',
      label: 'System Default',
      description: 'Follow your device theme',
      icon: '🔧',
    },
    {
      value: 'light',
      label: 'Light Mode',
      description: 'Always use light theme',
      icon: '☀️',
    },
    {
      value: 'dark',
      label: 'Dark Mode',
      description: 'Always use dark theme',
      icon: '🌙',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <YStack flex={1} padding={32} space="xl">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text variant="headlineSmall" fontWeight="600">
            Settings
          </Text>
          <Button
            size="small"
            variant="outlined"
            onPress={() => router.back()}
          >
            ✕
          </Button>
        </XStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack space="xl">
            {/* Theme Settings */}
            <Card padding={32}>
              <YStack space="lg">
                <Text variant="titleLarge" fontWeight="600">
                  🎨 Appearance
                </Text>
                
                <Text variant="bodyMedium">
                  Choose how the app looks
                </Text>

                <RadioGroup
                  options={themeOptions.map(option => ({
                    value: option.value,
                    label: `${option.icon} ${option.label}`,
                    description: option.description
                  }))}
                  value={themeMode}
                  onValueChange={(value) => setThemeMode(value as any)}
                  spacing={16}
                />

                {/* Current theme indicator */}
                <XStack
                  padding={16}
                  borderRadius={8}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text variant="bodyMedium">
                    Currently using: {isDark ? 'Dark' : 'Light'} theme
                  </Text>
                </XStack>
              </YStack>
            </Card>

            {/* App Information */}
            <Card padding={32}>
              <YStack space="lg">
                <Text variant="titleLarge" fontWeight="600">
                  📱 App Information
                </Text>
                
                <YStack space="sm">
                  <XStack justifyContent="space-between">
                    <Text variant="bodyMedium">
                      Version
                    </Text>
                    <Text variant="bodyMedium" fontWeight="600">
                      1.0.0
                    </Text>
                  </XStack>
                  
                  <XStack justifyContent="space-between">
                    <Text variant="bodyMedium">
                      Build
                    </Text>
                    <Text variant="bodyMedium" fontWeight="600">
                      December 2024
                    </Text>
                  </XStack>
                </YStack>
              </YStack>
            </Card>

            {/* Features */}
            <Card padding={32}>
              <YStack space="lg">
                <Text variant="titleLarge" fontWeight="600">
                  ✨ Features
                </Text>
                
                <YStack space="xs">
                  <Text variant="bodyMedium">
                    ✅ Interactive route planning
                  </Text>
                  <Text variant="bodyMedium">
                    ✅ Multiple waypoints support
                  </Text>
                  <Text variant="bodyMedium">
                    ✅ Route alternatives comparison
                  </Text>
                  <Text variant="bodyMedium">
                    ✅ Weather integration
                  </Text>
                  <Text variant="bodyMedium">
                    ✅ Route saving and loading
                  </Text>
                  <Text variant="bodyMedium">
                    ✅ Location search with autocomplete
                  </Text>
                  <Text variant="bodyMedium">
                    ✅ Multi-modal transportation
                  </Text>
                  <Text variant="bodyMedium">
                    ✅ Turn-by-turn directions
                  </Text>
                </YStack>
              </YStack>
            </Card>

            {/* Quick Actions */}
            <Card padding={32}>
              <YStack space="lg">
                <Text variant="titleLarge" fontWeight="600">
                  🚀 Quick Actions
                </Text>
                
                <XStack space="sm">
                  <Button
                    style={{ flex: 1 }}
                    variant="filled"
                    onPress={() => {
                      router.back();
                    }}
                  >
                    🗺️ Plan Route
                  </Button>
                  
                  <Button
                    style={{ flex: 1 }}
                    variant="outlined"
                    onPress={() => {
                      router.back();
                    }}
                  >
                    💾 Saved Routes
                  </Button>
                </XStack>
              </YStack>
            </Card>

            {/* Footer */}
            <YStack alignItems="center" padding={32}>
              <Text variant="bodyMedium" textAlign="center">
                Route & Weather Planner
              </Text>
              <Text variant="bodySmall" textAlign="center">
                Built with React Native & Expo
              </Text>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 