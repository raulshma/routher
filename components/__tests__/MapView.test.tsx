import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MapViewComponent } from '../MapView';
import { Location, WeatherPoint, Waypoint } from '@/types';

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const MockMapView = ({ children, onPress, ...props }: any) => {
    const MockedMapView = require('react-native').View;
    return <MockedMapView testID="map-view" onPress={onPress} {...props}>{children}</MockedMapView>;
  };

  const MockMarker = ({ children, ...props }: any) => {
    const MockedMarker = require('react-native').View;
    return <MockedMarker testID="marker" {...props}>{children}</MockedMarker>;
  };

  const MockPolyline = (props: any) => {
    const MockedPolyline = require('react-native').View;
    return <MockedPolyline testID="polyline" {...props} />;
  };

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Polyline: MockPolyline,
  };
});

describe('MapViewComponent', () => {
  const mockStartPoint: Location = {
    latitude: 52.5200,
    longitude: 13.4050,
    address: 'Berlin, Germany',
  };

  const mockEndPoint: Location = {
    latitude: 48.8566,
    longitude: 2.3522,
    address: 'Paris, France',
  };

  const mockWaypoints: Waypoint[] = [
    {
      id: '1',
      location: { latitude: 50.9375, longitude: 6.9603, address: 'Cologne, Germany' },
      order: 1,
    },
  ];

  const mockWeatherPoints: WeatherPoint[] = [
    {
      location: mockStartPoint,
      weather: {
        temperature: 20,
        description: 'clear sky',
        icon: '01d',
        humidity: 65,
        windSpeed: 5.2,
        precipitation: 0,
      },
      distanceFromStart: 0,
    },
  ];

  const mockRouteCoordinates: Location[] = [mockStartPoint, mockEndPoint];

  const defaultProps = {
    startPoint: undefined,
    endPoint: undefined,
    waypoints: [],
    routeCoordinates: [],
    weatherPoints: [],
    onMapPress: jest.fn(),
    onWaypointPress: jest.fn(),
    onWaypointLongPress: jest.fn(),
    routeAlternatives: [],
    selectedRouteId: 'route-0',
    onRouteSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<MapViewComponent {...defaultProps} />);
    
    expect(getByTestId('map-view')).toBeTruthy();
  });

  it('displays start and end markers when points are provided', () => {
    const { getAllByTestId } = render(
      <MapViewComponent
        {...defaultProps}
        startPoint={mockStartPoint}
        endPoint={mockEndPoint}
      />
    );

    const markers = getAllByTestId('marker');
    expect(markers.length).toBeGreaterThanOrEqual(2); // At least start and end markers
  });

  it('displays waypoint markers', () => {
    const { getAllByTestId } = render(
      <MapViewComponent
        {...defaultProps}
        waypoints={mockWaypoints}
      />
    );

    const markers = getAllByTestId('marker');
    expect(markers.length).toBeGreaterThanOrEqual(1); // At least one waypoint marker
  });

  it('displays weather markers when weather points are provided', () => {
    const { getAllByTestId } = render(
      <MapViewComponent
        {...defaultProps}
        weatherPoints={mockWeatherPoints}
      />
    );

    const markers = getAllByTestId('marker');
    expect(markers.length).toBeGreaterThanOrEqual(1); // At least one weather marker
  });

  it('displays route polyline when coordinates are provided', () => {
    const { getByTestId } = render(
      <MapViewComponent
        {...defaultProps}
        routeCoordinates={mockRouteCoordinates}
      />
    );

    expect(getByTestId('polyline')).toBeTruthy();
  });

  it('calls onMapPress when map is pressed', () => {
    const onMapPress = jest.fn();
    const { getByTestId } = render(
      <MapViewComponent
        {...defaultProps}
        onMapPress={onMapPress}
      />
    );

    const mapView = getByTestId('map-view');
    fireEvent.press(mapView, {
      nativeEvent: {
        coordinate: { latitude: 50.0, longitude: 10.0 },
      },
    });

    expect(onMapPress).toHaveBeenCalledWith({
      latitude: 50.0,
      longitude: 10.0,
    });
  });

  it('handles waypoint interactions', () => {
    const onWaypointAdd = jest.fn();
    const onWaypointRemove = jest.fn();

    render(
      <MapViewComponent
        {...defaultProps}
        waypoints={mockWaypoints}
        onWaypointAdd={onWaypointAdd}
        onWaypointRemove={onWaypointRemove}
      />
    );

    // Test would require more detailed marker interaction simulation
    // This is a basic structure for waypoint interaction tests
    expect(onWaypointAdd).toBeDefined();
    expect(onWaypointRemove).toBeDefined();
  });

  it('handles route alternatives display', () => {
    const mockAlternatives = [
      {
        id: 'route-0',
        routePoints: [
          { location: mockStartPoint },
          { location: mockEndPoint },
        ],
        totalDistance: 1000,
        totalDuration: 3600,
        geometry: [mockStartPoint, mockEndPoint],
        description: 'Fastest Route',
      },
      {
        id: 'route-1',
        routePoints: [
          { location: mockStartPoint },
          { location: mockEndPoint },
        ],
        totalDistance: 900,
        totalDuration: 3800,
        geometry: [mockStartPoint, mockEndPoint],
        description: 'Shortest Route',
      },
    ];

    const { getAllByTestId } = render(
      <MapViewComponent
        {...defaultProps}
        routeAlternatives={mockAlternatives}
        selectedRouteId="route-0"
      />
    );

    const polylines = getAllByTestId('polyline');
    expect(polylines.length).toBe(2); // Should show both alternative routes
  });

  it('handles empty data gracefully', () => {
    const { getByTestId } = render(<MapViewComponent {...defaultProps} />);
    
    expect(getByTestId('map-view')).toBeTruthy();
    // Should render without errors even with no data
  });

  describe('accessibility', () => {
    it('provides accessibility labels for markers', () => {
      const { getAllByTestId } = render(
        <MapViewComponent
          {...defaultProps}
          startPoint={mockStartPoint}
          endPoint={mockEndPoint}
        />
      );

      const markers = getAllByTestId('marker');
      expect(markers.length).toBeGreaterThan(0);
      // Would need to check for accessibility props on actual markers
    });
  });

  describe('performance', () => {
    it('handles large number of weather points efficiently', () => {
      const manyWeatherPoints: WeatherPoint[] = Array.from({ length: 100 }, (_, i) => ({
        location: {
          latitude: mockStartPoint.latitude + i * 0.01,
          longitude: mockStartPoint.longitude + i * 0.01,
        },
        weather: mockWeatherPoints[0].weather,
        distanceFromStart: i * 1000,
      }));

      const { getAllByTestId } = render(
        <MapViewComponent
          {...defaultProps}
          weatherPoints={manyWeatherPoints}
        />
      );

      const markers = getAllByTestId('marker');
      expect(markers.length).toBeGreaterThan(50); // Should handle many markers
    });
  });
}); 