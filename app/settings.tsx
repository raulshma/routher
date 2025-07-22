import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView as RNScrollView } from 'react-native';
import { YStack, XStack, Text, Button, Card, RadioGroup } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { WeatherService, type WeatherProvider } from '@/services/weatherService';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const [currentWeatherProvider, setCurrentWeatherProvider] = useState<WeatherProvider>('openweather');
  const [availableProviders, setAvailableProviders] = useState<WeatherProvider[]>([]);

  useEffect(() => {
    setCurrentWeatherProvider(WeatherService.getCurrentProvider());
    setAvailableProviders(WeatherService.getAvailableProviders());
  }, []);

  const handleWeatherProviderChange = (provider: WeatherProvider) => {
    WeatherService.setProvider(provider);
    setCurrentWeatherProvider(provider);
  };

  const themeOptions = [
    {
      value: 'system',
      label: 'System Default',
      description: 'Follow your device theme',
      icon: 'phone-portrait-outline',
    },
    {
      value: 'light',
      label: 'Light Mode',
      description: 'Always use light theme',
      icon: 'sunny-outline',
    },
    {
      value: 'dark',
      label: 'Dark Mode',
      description: 'Always use dark theme',
      icon: 'moon-outline',
    },
  ];

  const weatherProviderOptions = [
    {
      value: 'openweather',
      label: 'OpenWeather',
      description: 'OpenWeatherMap API',
      icon: 'cloud-outline',
    },
    {
      value: 'weatherapi',
      label: 'WeatherAPI',
      description: 'WeatherAPI.com service',
      icon: 'partly-sunny-outline',
    },
  ].filter(option => availableProviders.includes(option.value as WeatherProvider));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Customize your app experience</Text>
          </View>
          <Button
            variant="outlined"
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={20} color="#6366F1" />
          </Button>
        </View>

        <RNScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.settingsContent}>
            {/* Theme Settings */}
            <Card variant="elevated" style={styles.settingsCard} borderRadius={20}>
              <View style={styles.cardContent}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="color-palette" size={24} color="#6366F1" />
                  </View>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <Text style={styles.sectionDescription}>Choose how the app looks</Text>
                  </View>
                </View>

                <View style={styles.optionsContainer}>
                  <RadioGroup
                    options={themeOptions.map(option => ({
                      value: option.value,
                      label: option.label,
                      description: option.description
                    }))}
                    value={themeMode}
                    onValueChange={(value) => setThemeMode(value as any)}
                    spacing={16}
                  />
                </View>

                {/* Current theme indicator */}
                <View style={styles.currentThemeContainer}>
                  <View style={styles.currentThemeIcon}>
                    <Ionicons 
                      name={isDark ? 'moon' : 'sunny'} 
                      size={16} 
                      color={isDark ? '#8B5CF6' : '#F59E0B'} 
                    />
                  </View>
                  <Text style={styles.currentThemeText}>
                    Currently using: {isDark ? 'Dark' : 'Light'} theme
                  </Text>
                </View>
              </View>
            </Card>

            {/* Weather Provider Settings */}
            {weatherProviderOptions.length > 0 && (
              <Card variant="elevated" style={styles.settingsCard} borderRadius={20}>
                <View style={styles.cardContent}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                      <Ionicons name="cloud" size={24} color="#06B6D4" />
                    </View>
                    <View style={styles.sectionTitleContainer}>
                      <Text style={styles.sectionTitle}>Weather Provider</Text>
                      <Text style={styles.sectionDescription}>Choose your weather data source</Text>
                    </View>
                  </View>

                  <View style={styles.optionsContainer}>
                    <RadioGroup
                      options={weatherProviderOptions.map(option => ({
                        value: option.value,
                        label: option.label,
                        description: option.description
                      }))}
                      value={currentWeatherProvider}
                      onValueChange={(value) => handleWeatherProviderChange(value as WeatherProvider)}
                      spacing={16}
                    />
                  </View>

                  {/* Current provider indicator */}
                  <View style={styles.currentProviderContainer}>
                    <View style={styles.currentProviderIcon}>
                      <Ionicons 
                        name={currentWeatherProvider === 'openweather' ? 'cloud' : 'partly-sunny'} 
                        size={16} 
                        color="#06B6D4" 
                      />
                    </View>
                    <Text style={styles.currentProviderText}>
                      Active provider: {weatherProviderOptions.find(p => p.value === currentWeatherProvider)?.label || 'Unknown'}
                    </Text>
                  </View>

                  {weatherProviderOptions.length === 1 && (
                    <View style={styles.warningContainer}>
                      <Ionicons name="information-circle" size={16} color="#F59E0B" />
                      <Text style={styles.warningText}>
                        Configure additional API keys in your environment to enable more weather providers
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            )}

            {/* App Information */}
            <Card variant="elevated" style={styles.settingsCard} borderRadius={20}>
              <View style={styles.cardContent}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="information-circle" size={24} color="#10B981" />
                  </View>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>App Information</Text>
                    <Text style={styles.sectionDescription}>About this application</Text>
                  </View>
                </View>

                <View style={styles.infoContainer}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Version</Text>
                    <Text style={styles.infoValue}>1.0.0</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Platform</Text>
                    <Text style={styles.infoValue}>React Native</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Build</Text>
                    <Text style={styles.infoValue}>Production</Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* Features Card */}
            <Card variant="gradient" gradient={['#6366F1', '#8B5CF6']} style={styles.featuresCard} borderRadius={20}>
              <View style={styles.cardContent}>
                <View style={styles.featuresHeader}>
                  <Ionicons name="star" size={24} color="white" />
                  <Text style={styles.featuresTitle}>Route & Weather Planner</Text>
                </View>
                <Text style={styles.featuresDescription}>
                  Plan your journeys with real-time weather data, multiple transportation modes, and intelligent route alternatives.
                </Text>
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <Ionicons name="map" size={16} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.featureText}>Interactive Maps</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="cloud" size={16} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.featureText}>Weather Integration</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="car" size={16} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.featureText}>Multi-Modal Transport</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="bookmark" size={16} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.featureText}>Save Routes</Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        </RNScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  settingsContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  settingsCard: {
    marginBottom: 20,
  },
  cardContent: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  currentThemeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  currentThemeIcon: {
    marginRight: 8,
  },
  currentThemeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  currentProviderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.1)',
    marginBottom: 12,
  },
  currentProviderIcon: {
    marginRight: 8,
  },
  currentProviderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  infoContainer: {
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  featuresCard: {
    marginBottom: 20,
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginLeft: 12,
  },
  featuresDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
}); 