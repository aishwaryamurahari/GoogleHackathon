import { Route, PhotoSpot } from '../types';

declare global {
  interface Window {
    google: typeof google;
  }
}

export class RouteService {
  private directionsService: google.maps.DirectionsService;
  private placesService: google.maps.places.PlacesService;
  private map: google.maps.Map;
  private photoSpotCache: Map<string, PhotoSpot[]> = new Map();

  constructor(map: google.maps.Map) {
    this.map = map;
    this.directionsService = new google.maps.DirectionsService();
    this.placesService = new google.maps.places.PlacesService(map);
  }

  async findPhotoWorthyRoutes(origin: string, destination: string): Promise<Route[]> {
    try {
      // Get routes for different travel modes in parallel
      const travelModes = [
        { mode: google.maps.TravelMode.WALKING, name: 'Walking' },
        { mode: google.maps.TravelMode.BICYCLING, name: 'Cycling' },
        { mode: google.maps.TravelMode.DRIVING, name: 'Driving' }
      ];

      const routePromises = travelModes.map(async (travelMode) => {
        try {
          const response = await this.getDirections(origin, destination, travelMode.mode);
          return response.routes.map((route, index) => ({
            route,
            travelMode,
            index
          }));
        } catch (error) {
          console.warn(`Failed to get ${travelMode.name} routes:`, error);
          return [];
        }
      });

      const allRouteData = await Promise.all(routePromises);
      const routes: Route[] = [];

      // Process all routes in parallel
      const routeProcessingPromises = allRouteData.flat().map(async ({ route, travelMode, index }) => {
        const photoSpots = await this.findPhotoSpotsAlongRoute(route);
        const photoScore = this.calculateEnhancedPhotoScore(photoSpots, route);
        const adjustedDuration = this.calculateAdjustedDuration(route, photoSpots);

        return {
          id: `route-${travelMode.name}-${index}`,
          name: this.getRouteName(index, route, travelMode.name),
          distance: route.legs[0].distance?.text || '',
          duration: adjustedDuration,
          photoScore,
          photoSpots,
          path: this.extractPathFromRoute(route),
          travelMode: travelMode.name,
          baseDuration: route.legs[0].duration?.text || ''
        };
      });

      const processedRoutes = await Promise.all(routeProcessingPromises);
      routes.push(...processedRoutes);

      // Sort routes by photo score, then by duration for similar scores
      return routes.sort((a, b) => {
        if (Math.abs(a.photoScore - b.photoScore) < 10) {
          // If photo scores are close, prefer shorter duration
          return this.parseDuration(a.duration) - this.parseDuration(b.duration);
        }
        return b.photoScore - a.photoScore;
      });
    } catch (error) {
      console.error('Error finding routes:', error);
      throw error;
    }
  }

  private async getDirections(origin: string, destination: string, travelMode: google.maps.TravelMode): Promise<google.maps.DirectionsResult> {
    return new Promise((resolve, reject) => {
      this.directionsService.route(
        {
          origin,
          destination,
          travelMode
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });
  }

  private async findPhotoSpotsAlongRoute(route: google.maps.DirectionsRoute): Promise<PhotoSpot[]> {
    const path = this.extractPathFromRoute(route);

    // Sample fewer points for better performance
    const numPoints = Math.min(Math.max(3, Math.floor(path.length / 20)), 8);
    const samplePoints = this.getSamplePoints(path, numPoints);

    // Search for photo spots in parallel
    const spotPromises = samplePoints.map(point => this.searchNearbyPhotoSpots(point));
    const spotsArrays = await Promise.all(spotPromises);
    const photoSpots = spotsArrays.flat();

    // Remove duplicates and sort by rating
    return this.deduplicatePhotoSpots(photoSpots).sort((a, b) => b.rating - a.rating);
  }

  private async searchNearbyPhotoSpots(location: { lat: number; lng: number }): Promise<PhotoSpot[]> {
    const cacheKey = `${location.lat.toFixed(3)},${location.lng.toFixed(3)}`;

    // Check cache first
    if (this.photoSpotCache.has(cacheKey)) {
      return this.photoSpotCache.get(cacheKey)!;
    }

    return new Promise((resolve) => {
      this.placesService.nearbySearch(
        {
          location: new google.maps.LatLng(location.lat, location.lng),
          radius: 200,
          type: 'point_of_interest',
          keyword: 'photo|scenic|landmark|art|mural|cafe|park|view|museum|gallery|monument|statue|bridge|fountain|garden'
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const photoSpots: PhotoSpot[] = results
              .filter(place => place.rating && place.rating >= 3.5)
              .map(place => ({
                id: place.place_id || '',
                name: place.name || '',
                rating: place.rating || 0,
                photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 150, maxHeight: 100 }) ||
                         `https://picsum.photos/150/100?random=${Math.floor(Math.random() * 1000)}&blur=1`,
                distance: this.calculateDistance(location, { lat: place.geometry?.location?.lat() || 0, lng: place.geometry?.location?.lng() || 0 }),
                location: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0
                }
              }));

            // Cache the results
            this.photoSpotCache.set(cacheKey, photoSpots);
            resolve(photoSpots);
          } else {
            resolve([]);
          }
        }
      );
    });
  }

  private calculateEnhancedPhotoScore(photoSpots: PhotoSpot[], route: google.maps.DirectionsRoute): number {
    if (photoSpots.length === 0) return 0;

    const routeDistance = this.parseDistance(route.legs[0].distance?.text || '0 km');
    const avgRating = photoSpots.reduce((sum, spot) => sum + spot.rating, 0) / photoSpots.length;

    // Enhanced scoring algorithm
    const ratingScore = Math.min(40, (avgRating - 3.0) * 20); // 0-40 points
    const quantityScore = Math.min(30, photoSpots.length * 3); // 0-30 points

    // Density bonus: more spots per km = higher score
    const spotsPerKm = photoSpots.length / Math.max(routeDistance, 0.1);
    const densityScore = Math.min(20, spotsPerKm * 5); // 0-20 points

    // Variety bonus: different types of spots
    const uniqueTypes = new Set(photoSpots.map(spot => this.getSpotType(spot.name))).size;
    const varietyScore = Math.min(10, uniqueTypes * 2); // 0-10 points

    return Math.min(100, Math.max(0, Math.round(ratingScore + quantityScore + densityScore + varietyScore)));
  }

  private calculateAdjustedDuration(route: google.maps.DirectionsRoute, photoSpots: PhotoSpot[]): string {
    const baseDuration = this.parseDuration(route.legs[0].duration?.text || '0 min');

    // Add time for photo stops (5 minutes per photo spot)
    const photoStopTime = photoSpots.length * 5;
    const totalMinutes = baseDuration + photoStopTime;

    return this.formatDuration(totalMinutes);
  }

  private parseDuration(durationText: string): number {
    const match = durationText.match(/(\d+)\s*(?:hour|hr|h|minute|min|m)/i);
    if (!match) return 0;

    const value = parseInt(match[1]);
    if (durationText.toLowerCase().includes('hour') || durationText.toLowerCase().includes('hr') || durationText.toLowerCase().includes('h')) {
      return value * 60;
    }
    return value;
  }

  private parseDistance(distanceText: string): number {
    const match = distanceText.match(/(\d+(?:\.\d+)?)\s*(?:km|mi|m)/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    if (distanceText.toLowerCase().includes('mi')) {
      return value * 1.60934; // Convert miles to km
    }
    if (distanceText.toLowerCase().includes('m') && !distanceText.toLowerCase().includes('km')) {
      return value / 1000; // Convert meters to km
    }
    return value;
  }

  private formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
  }

  private getSpotType(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('park') || lowerName.includes('garden')) return 'park';
    if (lowerName.includes('museum') || lowerName.includes('gallery')) return 'museum';
    if (lowerName.includes('cafe') || lowerName.includes('restaurant')) return 'cafe';
    if (lowerName.includes('art') || lowerName.includes('mural')) return 'art';
    if (lowerName.includes('bridge') || lowerName.includes('monument')) return 'landmark';
    return 'other';
  }

  private extractPathFromRoute(route: google.maps.DirectionsRoute): Array<{ lat: number; lng: number }> {
    const path: Array<{ lat: number; lng: number }> = [];

    route.legs.forEach(leg => {
      leg.steps.forEach(step => {
        if (step.path) {
          step.path.forEach(point => {
            path.push({ lat: point.lat(), lng: point.lng() });
          });
        }
      });
    });

    return path;
  }

  private getSamplePoints(path: Array<{ lat: number; lng: number }>, numPoints: number): Array<{ lat: number; lng: number }> {
    if (path.length <= numPoints) return path;

    const step = Math.floor(path.length / numPoints);
    const samplePoints: Array<{ lat: number; lng: number }> = [];

    for (let i = 0; i < numPoints; i++) {
      const index = i * step;
      samplePoints.push(path[index]);
    }

    return samplePoints;
  }

  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): string {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Convert to meters

    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  }

  private deduplicatePhotoSpots(photoSpots: PhotoSpot[]): PhotoSpot[] {
    const seen = new Set<string>();
    return photoSpots.filter(spot => {
      if (seen.has(spot.id)) return false;
      seen.add(spot.id);
      return true;
    });
  }

  private getRouteName(index: number, route: google.maps.DirectionsRoute, travelMode: string): string {
    const names = ['Scenic Route', 'Cultural Path', 'Art Walk', 'Historic Trail', 'Photo Route'];
    const baseName = names[index] || `Route ${index + 1}`;
    return `${baseName} (${travelMode})`;
  }

  // Clear cache when needed
  clearCache(): void {
    this.photoSpotCache.clear();
  }
}