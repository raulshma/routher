# Route & Weather Planner

A comprehensive mobile-responsive React Native application for route planning with integrated weather information. Plan your journeys with real-time weather data at 1-kilometer intervals along your route.

## Features

### 🗺️ Interactive Map Interface
- **OpenStreetMap Integration**: High-quality, open-source mapping
- **Point Selection**: Tap on the map to set start and end points
- **Current Location**: Use your device's GPS to set starting location
- **Route Visualization**: Clear route display with turn-by-turn directions

### 🚗 Multi-Modal Transportation
- **Vehicle Types**: Car, Bicycle, Walking
- **Optimized Routing**: Different routes based on transportation mode
- **Accurate Timing**: Realistic travel time estimates

### 🌤️ Weather Integration
- **Multiple Providers**: Support for OpenWeatherMap and WeatherAPI.com
- **Real-time Weather**: Current weather conditions along your route
- **1km Intervals**: Weather data every kilometer along your journey
- **Detailed Information**: Temperature, humidity, wind speed, precipitation
- **Visual Indicators**: Intuitive weather icons on the map
- **Provider Selection**: Switch between weather providers in settings

### 💾 Route Management
- **Save Routes**: Store your planned routes for future reference
- **Route History**: View all your previously saved routes
- **Favorites**: Mark important routes as favorites
- **Route Details**: Distance, duration, and weather information preserved

### 📱 Modern UI/UX
- **Material You Design**: Modern, clean interface
- **Responsive Design**: Works on all screen sizes
- **Dark/Light Mode**: Automatic theme detection
- **Smooth Animations**: Fluid user experience

## Prerequisites

Before running this application, ensure you have:

- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- A mobile device with Expo Go app installed, or iOS Simulator/Android Emulator

## Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd routher
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Weather API Keys** (Optional but recommended):
   
   The app supports multiple weather providers. You can configure one or both:

   **Option A: OpenWeatherMap** (Default)
   - Visit https://openweathermap.org/api
   - Sign up for a free account (1000 calls/day)
   - Get your API key
   - Add to your `.env` file:
   ```bash
   EXPO_PUBLIC_OPEN_WEATHER_API_KEY=your_openweather_api_key_here
   ```

   **Option B: WeatherAPI.com** (Alternative)
   - Visit https://www.weatherapi.com/
   - Sign up for a free account (1 million calls/month)
   - Get your API key
   - Add to your `.env` file:
   ```bash
   EXPO_PUBLIC_WEATHER_API_KEY=your_weatherapi_key_here
   ```

   **Configuration Notes:**
   - Create a `.env` file in the project root if it doesn't exist
   - The app will automatically detect available providers
   - You can switch between providers in the app settings
   - If no API keys are configured, demo weather data will be used

## Running the App

### Development Mode

Start the development server:
```bash
npm start
```

This will open the Expo Developer Tools in your browser. You can then:

- **Scan the QR code** with your phone's camera (iOS) or Expo Go app (Android)
- **Press 'i'** to run on iOS simulator
- **Press 'a'** to run on Android emulator
- **Press 'w'** to run in web browser

### Platform-specific Commands

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Usage Guide

### Planning a Route

1. **Open the app** and navigate to the "Route Planner" tab
2. **Set your starting point**:
   - Tap "Use Current Location" to use GPS
   - Tap anywhere on the map
   - Use the search feature (coming soon)
3. **Set your destination**:
   - Tap on the map for your end point
4. **Choose your vehicle type**:
   - Select Car, Bicycle, or Walking
5. **Calculate route**:
   - Tap "Get Directions"
   - Weather data will be loaded automatically
6. **Save your route** (optional):
   - Tap "Save Route" and give it a name

### Managing Saved Routes

1. **Navigate to "Saved Routes" tab**
2. **View your routes**: See all saved routes with details
3. **Mark favorites**: Tap the star icon
4. **Delete routes**: Tap the trash icon
5. **View statistics**: See total distance and route count

### Understanding Weather Data

- **Weather icons** appear every 1km along your route
- **Tap any weather icon** to see detailed information
- **Color coding** indicates weather severity
- **Real-time data** from OpenWeatherMap API

## Technologies Used

### Core Framework
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe development

### UI/UX
- **Tamagui**: Modern UI component library
- **Material You**: Design system implementation
- **React Native Maps**: Interactive mapping

### Services & APIs
- **OpenStreetMap**: Map tiles and geocoding
- **OSRM**: Open Source Routing Machine for directions
- **OpenWeatherMap**: Primary weather data API
- **WeatherAPI.com**: Alternative weather data provider
- **AsyncStorage**: Local data persistence

### Navigation & State
- **Expo Router**: File-based routing
- **React Navigation**: Tab navigation
- **React Hooks**: State management

## Project Structure

```
routher/
├── app/                    # App screens and layouts
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Route Planner screen
│   │   └── two.tsx        # Saved Routes screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── MapView.tsx        # Interactive map component
│   ├── WeatherMarker.tsx  # Weather display markers
│   ├── VehicleSelector.tsx # Transportation mode selector
│   └── LocationSearch.tsx # Address search component
├── services/              # Business logic and API calls
│   ├── routingService.ts  # Route calculation
│   ├── weatherService.ts  # Weather data fetching
│   └── storageService.ts  # Local data management
├── types/                 # TypeScript type definitions
│   └── index.ts           # App-wide type definitions
└── constants/             # App constants and configuration
```

## Configuration

### App Settings

Key configuration files:
- `app.json`: Expo configuration, permissions, app metadata
- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `tamagui.config.ts`: UI theme configuration

### Permissions

The app requires these permissions:
- **Location**: For current position and route planning
- **Internet**: For map tiles, routing, and weather data

These are automatically handled by Expo for development builds.

## API Services

### Routing Service (OSRM)
- **Provider**: Open Source Routing Machine
- **Endpoint**: `https://router.project-osrm.org`
- **Features**: Multi-modal routing, turn-by-turn directions
- **Rate Limits**: Public instance, reasonable use

### Weather Service (OpenWeatherMap)
- **Provider**: OpenWeatherMap
- **API**: Current Weather Data API
- **Features**: Real-time weather, detailed conditions
- **Rate Limits**: 60 calls/minute (free tier)

### Geocoding Service (Nominatim)
- **Provider**: OpenStreetMap Foundation
- **Features**: Address search, reverse geocoding
- **Rate Limits**: 1 request/second

## Troubleshooting

### Common Issues

1. **Location permissions denied**:
   - Enable location services in device settings
   - Grant permission when prompted by the app

2. **Map not loading**:
   - Check internet connection
   - Restart the app

3. **Weather data not showing**:
   - Verify internet connection
   - Check if OpenWeatherMap API is accessible

4. **Route calculation fails**:
   - Ensure start and end points are valid
   - Check if OSRM service is accessible
   - Try different locations

### Performance Tips

- **Limit saved routes**: Keep under 50 routes for optimal performance
- **Clear old routes**: Regularly clean up unused saved routes
- **Restart app**: If experiencing memory issues

## Contributing

This is a demo application showcasing route planning with weather integration. Key areas for enhancement:

1. **Enhanced search**: Address autocomplete and POI search
2. **Offline support**: Cache maps and routes for offline use
3. **Route optimization**: Multiple waypoints and route alternatives
4. **Social features**: Share routes with others
5. **Export functionality**: GPX/KML export for GPS devices

## License

This project is for demonstration purposes. Individual components and services may have their own licenses:

- OpenStreetMap data: Open Database License
- OSRM: BSD 2-Clause License
- Weather data: OpenWeatherMap Terms of Service

## Support

For technical issues or questions about this implementation:

1. Check the troubleshooting section above
2. Review the console logs for error details
3. Ensure all dependencies are properly installed
4. Verify API service availability

---

**Built with ❤️ using React Native and Expo**

*This app demonstrates modern mobile development practices with real-world API integrations and responsive design principles.* 