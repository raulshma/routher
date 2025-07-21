import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Route, WeatherPoint, RoutePoint } from '@/types';

export class ExportService {
  /**
   * Generate GPX (GPS Exchange Format) content from route data
   */
  static generateGPX(route: Route): string {
    const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Route & Weather Planner" 
     xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 
     http://www.topografix.com/GPX/1/1/gpx.xsd">`;

    const metadata = `
  <metadata>
    <name>${this.escapeXml(route.name)}</name>
    <desc>Route created with Route &amp; Weather Planner</desc>
    <time>${route.createdAt.toISOString()}</time>
    <keywords>route,navigation,weather</keywords>
  </metadata>`;

    // Create waypoints for start, intermediate stops, and end
    const waypoints = `
  <!-- Start Point -->
  <wpt lat="${route.startPoint.latitude}" lon="${route.startPoint.longitude}">
    <name>Start: ${this.escapeXml(route.startPoint.address || 'Starting Point')}</name>
    <sym>Flag, Green</sym>
    <type>Start</type>
  </wpt>
  
  ${route.intermediateWaypoints?.map((waypoint, index) => `
  <!-- Waypoint ${index + 1} -->
  <wpt lat="${waypoint.location.latitude}" lon="${waypoint.location.longitude}">
    <name>Stop ${waypoint.order}: ${this.escapeXml(waypoint.location.address || `Waypoint ${waypoint.order}`)}</name>
    <sym>Circle, Blue</sym>
    <type>Waypoint</type>
  </wpt>`).join('') || ''}
  
  <!-- End Point -->
  <wpt lat="${route.endPoint.latitude}" lon="${route.endPoint.longitude}">
    <name>End: ${this.escapeXml(route.endPoint.address || 'Destination')}</name>
    <sym>Flag, Red</sym>
    <type>Destination</type>
  </wpt>`;

    // Create track from route coordinates
    const track = `
  <trk>
    <name>${this.escapeXml(route.name)} - Track</name>
    <desc>Route track with weather data</desc>
    <type>${route.vehicleType}</type>
    <trkseg>
      ${route.waypoints?.map((waypoint, index) => {
        const weatherPoint = route.weatherPoints?.find(wp => 
          Math.abs(wp.location.latitude - waypoint.location.latitude) < 0.001 &&
          Math.abs(wp.location.longitude - waypoint.location.longitude) < 0.001
        );
        
        return `
      <trkpt lat="${waypoint.location.latitude}" lon="${waypoint.location.longitude}">
        ${weatherPoint ? `
        <extensions>
          <temperature>${weatherPoint.weather.temperature}</temperature>
          <weather>${this.escapeXml(weatherPoint.weather.description)}</weather>
          <humidity>${weatherPoint.weather.humidity}</humidity>
          <windSpeed>${weatherPoint.weather.windSpeed}</windSpeed>
        </extensions>` : ''}
      </trkpt>`;
      }).join('') || ''}
    </trkseg>
  </trk>`;

    const gpxFooter = '\n</gpx>';

    return gpxHeader + metadata + waypoints + track + gpxFooter;
  }

  /**
   * Generate KML (Keyhole Markup Language) content from route data
   */
  static generateKML(route: Route): string {
    const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${this.escapeXml(route.name)}</name>
    <description>Route created with Route &amp; Weather Planner on ${route.createdAt.toLocaleDateString()}</description>`;

    const styles = `
    <!-- Styles for different elements -->
    <Style id="startPointStyle">
      <IconStyle>
        <color>ff00ff00</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href>
        </Icon>
      </IconStyle>
      <LabelStyle>
        <color>ff00ff00</color>
        <scale>1.1</scale>
      </LabelStyle>
    </Style>
    
    <Style id="endPointStyle">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/red-circle.png</href>
        </Icon>
      </IconStyle>
      <LabelStyle>
        <color>ff0000ff</color>
        <scale>1.1</scale>
      </LabelStyle>
    </Style>
    
    <Style id="waypointStyle">
      <IconStyle>
        <color>ffff0000</color>
        <scale>1.0</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/blu-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="routeLineStyle">
      <LineStyle>
        <color>ff0000ff</color>
        <width>4</width>
      </LineStyle>
    </Style>`;

    // Create folder for waypoints
    const waypointsFolder = `
    <Folder>
      <name>Waypoints</name>
      <description>Start, intermediate stops, and destination points</description>
      
      <!-- Start Point -->
      <Placemark>
        <name>Start</name>
        <description><![CDATA[
          <b>Starting Point</b><br/>
          Address: ${route.startPoint.address || 'N/A'}<br/>
          Vehicle: ${route.vehicleType}<br/>
          Total Distance: ${(route.totalDistance / 1000).toFixed(2)} km<br/>
          Total Duration: ${Math.floor(route.totalDuration / 3600)}h ${Math.floor((route.totalDuration % 3600) / 60)}m
        ]]></description>
        <styleUrl>#startPointStyle</styleUrl>
        <Point>
          <coordinates>${route.startPoint.longitude},${route.startPoint.latitude},0</coordinates>
        </Point>
      </Placemark>
      
      ${route.intermediateWaypoints?.map((waypoint, index) => `
      <!-- Waypoint ${index + 1} -->
      <Placemark>
        <name>Stop ${waypoint.order}</name>
        <description><![CDATA[
          <b>Intermediate Stop ${waypoint.order}</b><br/>
          Address: ${waypoint.location.address || 'N/A'}
        ]]></description>
        <styleUrl>#waypointStyle</styleUrl>
        <Point>
          <coordinates>${waypoint.location.longitude},${waypoint.location.latitude},0</coordinates>
        </Point>
      </Placemark>`).join('') || ''}
      
      <!-- End Point -->
      <Placemark>
        <name>Destination</name>
        <description><![CDATA[
          <b>Destination</b><br/>
          Address: ${route.endPoint.address || 'N/A'}
        ]]></description>
        <styleUrl>#endPointStyle</styleUrl>
        <Point>
          <coordinates>${route.endPoint.longitude},${route.endPoint.latitude},0</coordinates>
        </Point>
      </Placemark>
    </Folder>`;

    // Create route line
    const routeLine = `
    <Folder>
      <name>Route</name>
      <description>Navigation route</description>
      
      <Placemark>
        <name>${this.escapeXml(route.name)} - Route Path</name>
        <description><![CDATA[
          <b>Route Information</b><br/>
          Distance: ${(route.totalDistance / 1000).toFixed(2)} km<br/>
          Duration: ${Math.floor(route.totalDuration / 3600)}h ${Math.floor((route.totalDuration % 3600) / 60)}m<br/>
          Vehicle: ${route.vehicleType}<br/>
          Waypoints: ${route.intermediateWaypoints?.length || 0}
        ]]></description>
        <styleUrl>#routeLineStyle</styleUrl>
        <LineString>
          <tessellate>1</tessellate>
          <coordinates>
            ${route.waypoints?.map(waypoint => 
              `${waypoint.location.longitude},${waypoint.location.latitude},0`
            ).join('\n            ') || ''}
          </coordinates>
        </LineString>
      </Placemark>
    </Folder>`;

    // Create weather points folder
    const weatherFolder = route.weatherPoints?.length ? `
    <Folder>
      <name>Weather Data</name>
      <description>Weather conditions along the route</description>
      
      ${route.weatherPoints.map((weatherPoint, index) => `
      <Placemark>
        <name>Weather Point ${index + 1}</name>
        <description><![CDATA[
          <b>Weather at ${(weatherPoint.distanceFromStart / 1000).toFixed(1)} km</b><br/>
          Temperature: ${weatherPoint.weather.temperature}°C<br/>
          Condition: ${weatherPoint.weather.description}<br/>
          Humidity: ${weatherPoint.weather.humidity}%<br/>
          Wind Speed: ${weatherPoint.weather.windSpeed.toFixed(1)} m/s<br/>
          ${weatherPoint.weather.precipitation > 0 ? `Precipitation: ${weatherPoint.weather.precipitation.toFixed(1)} mm<br/>` : ''}
        ]]></description>
        <Point>
          <coordinates>${weatherPoint.location.longitude},${weatherPoint.location.latitude},0</coordinates>
        </Point>
      </Placemark>`).join('')}
    </Folder>` : '';

    const kmlFooter = `
  </Document>
</kml>`;

    return kmlHeader + styles + waypointsFolder + routeLine + weatherFolder + kmlFooter;
  }

  /**
   * Export route as GPX file
   */
  static async exportGPX(route: Route): Promise<void> {
    try {
      const gpxContent = this.generateGPX(route);
      const fileName = `${this.sanitizeFileName(route.name)}.gpx`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, gpxContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/gpx+xml',
          dialogTitle: 'Export Route as GPX',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error exporting GPX:', error);
      throw new Error('Failed to export route as GPX file');
    }
  }

  /**
   * Export route as KML file
   */
  static async exportKML(route: Route): Promise<void> {
    try {
      const kmlContent = this.generateKML(route);
      const fileName = `${this.sanitizeFileName(route.name)}.kml`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, kmlContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.google-earth.kml+xml',
          dialogTitle: 'Export Route as KML',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error exporting KML:', error);
      throw new Error('Failed to export route as KML file');
    }
  }

  /**
   * Export route in both GPX and KML formats
   */
  static async exportBoth(route: Route): Promise<void> {
    try {
      await Promise.all([
        this.exportGPX(route),
        this.exportKML(route),
      ]);
    } catch (error) {
      console.error('Error exporting both formats:', error);
      throw new Error('Failed to export route files');
    }
  }

  /**
   * Helper method to escape XML special characters
   */
  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Helper method to sanitize file names
   */
  private static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9\-_\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 50); // Limit length
  }

  /**
   * Get supported export formats
   */
  static getSupportedFormats(): { name: string; extension: string; description: string }[] {
    return [
      {
        name: 'GPX',
        extension: '.gpx',
        description: 'GPS Exchange Format - Compatible with most GPS devices and apps',
      },
      {
        name: 'KML',
        extension: '.kml',
        description: 'Keyhole Markup Language - Compatible with Google Earth and Google Maps',
      },
    ];
  }
} 