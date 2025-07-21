import React from 'react';
import { StyleSheet } from 'react-native';
import { YStack, XStack, Text, Button, Card, ScrollView, RadioGroup } from 'tamagui';
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
      <YStack flex={1} padding="$4" space="$4">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="bold">
            Settings
          </Text>
          <Button
            size="$3"
            circular
            variant="outlined"
            onPress={() => router.back()}
          >
            ✕
          </Button>
        </XStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack space="$4">
            {/* Theme Settings */}
            <Card padding="$4" backgroundColor="$gray2">
              <YStack space="$3">
                <Text fontSize="$5" fontWeight="bold">
                  🎨 Appearance
                </Text>
                
                <Text fontSize="$3" color="$gray11">
                  Choose how the app looks
                </Text>

                <RadioGroup
                  value={themeMode}
                  onValueChange={(value) => setThemeMode(value as any)}
                >
                  <YStack space="$2">
                    {themeOptions.map((option) => (
                      <XStack
                        key={option.value}
                        alignItems="center"
                        space="$3"
                        padding="$3"
                        backgroundColor={themeMode === option.value ? '$blue3' : '$gray1'}
                        borderRadius="$3"
                        borderWidth={themeMode === option.value ? 1 : 0}
                        borderColor="$blue7"
                        onPress={() => setThemeMode(option.value as any)}
                      >
                        <Text fontSize="$4">{option.icon}</Text>
                        <YStack flex={1} space="$1">
                          <Text fontSize="$4" fontWeight="bold">
                            {option.label}
                          </Text>
                          <Text fontSize="$3" color="$gray11">
                            {option.description}
                          </Text>
                        </YStack>
                        <XStack
                          width={20}
                          height={20}
                          borderRadius={10}
                          borderWidth={2}
                          borderColor={themeMode === option.value ? '$blue7' : '$gray7'}
                          backgroundColor={themeMode === option.value ? '$blue7' : 'transparent'}
                          alignItems="center"
                          justifyContent="center"
                        >
                          {themeMode === option.value && (
                            <Text fontSize="$2" color="white">
                              ✓
                            </Text>
                          )}
                        </XStack>
                      </XStack>
                    ))}
                  </YStack>
                </RadioGroup>

                {/* Current theme indicator */}
                <XStack
                  padding="$2"
                  backgroundColor={isDark ? '$gray3' : '$gray1'}
                  borderRadius="$2"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="$3" color="$gray11">
                    Currently using: {isDark ? 'Dark' : 'Light'} theme
                  </Text>
                </XStack>
              </YStack>
            </Card>

            {/* App Information */}
            <Card padding="$4" backgroundColor="$gray2">
              <YStack space="$3">
                <Text fontSize="$5" fontWeight="bold">
                  📱 App Information
                </Text>
                
                <YStack space="$2">
                  <XStack justifyContent="space-between">
                    <Text fontSize="$3" color="$gray11">
                      Version
                    </Text>
                    <Text fontSize="$3" fontWeight="bold">
                      1.0.0
                    </Text>
                  </XStack>
                  
                  <XStack justifyContent="space-between">
                    <Text fontSize="$3" color="$gray11">
                      Build
                    </Text>
                    <Text fontSize="$3" fontWeight="bold">
                      December 2024
                    </Text>
                  </XStack>
                </YStack>
              </YStack>
            </Card>

            {/* Features */}
            <Card padding="$4" backgroundColor="$gray2">
              <YStack space="$3">
                <Text fontSize="$5" fontWeight="bold">
                  ✨ Features
                </Text>
                
                <YStack space="$1">
                  <Text fontSize="$3" color="$gray11">
                    ✅ Interactive route planning
                  </Text>
                  <Text fontSize="$3" color="$gray11">
                    ✅ Multiple waypoints support
                  </Text>
                  <Text fontSize="$3" color="$gray11">
                    ✅ Route alternatives comparison
                  </Text>
                  <Text fontSize="$3" color="$gray11">
                    ✅ Weather integration
                  </Text>
                  <Text fontSize="$3" color="$gray11">
                    ✅ Route saving and loading
                  </Text>
                  <Text fontSize="$3" color="$gray11">
                    ✅ Location search with autocomplete
                  </Text>
                  <Text fontSize="$3" color="$gray11">
                    ✅ Multi-modal transportation
                  </Text>
                  <Text fontSize="$3" color="$gray11">
                    ✅ Turn-by-turn directions
                  </Text>
                </YStack>
              </YStack>
            </Card>

            {/* Quick Actions */}
            <Card padding="$4" backgroundColor="$gray2">
              <YStack space="$3">
                <Text fontSize="$5" fontWeight="bold">
                  🚀 Quick Actions
                </Text>
                
                <XStack space="$2">
                  <Button
                    flex={1}
                    backgroundColor="$blue7"
                    onPress={() => {
                      router.back();
                    }}
                  >
                    🗺️ Plan Route
                  </Button>
                  
                  <Button
                    flex={1}
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
            <YStack alignItems="center" padding="$4">
              <Text fontSize="$3" color="$gray10" textAlign="center">
                Route & Weather Planner
              </Text>
              <Text fontSize="$2" color="$gray9" textAlign="center">
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