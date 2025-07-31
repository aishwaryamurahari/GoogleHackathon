import React, { useEffect, useRef, useState } from 'react';
import { MapComponentProps } from '../types';
import { Camera, Star, MapPin, Clock, Sparkles, Eye, EyeOff, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import GoogleMapsService from '../services/googleMapsService.ts';
import PhotoSpotDetail from './PhotoSpotDetail.tsx';
import RouteStreetView from './RouteStreetView.tsx';
import LayersControl from './LayersControl.tsx';

interface ExtendedMapComponentProps extends MapComponentProps {
  onMapReady?: (map: google.maps.Map) => void;
}

const MapComponent: React.FC<ExtendedMapComponentProps> = ({
  apiKey,
  selectedRoute,
  routes,
  onMapReady
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [hasInitialBounds, setHasInitialBounds] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [selectedPhotoSpot, setSelectedPhotoSpot] = useState<any>(null);
  const [showRouteStreetView, setShowRouteStreetView] = useState(false);

  // Initialize Google Maps with 3D capabilities
  useEffect(() => {
    if (!apiKey || !mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        console.log('MapComponent: Starting map initialization...');

        // Use centralized Google Maps service
        const mapsService = GoogleMapsService.getInstance();
        await mapsService.initialize(apiKey);

        console.log('MapComponent: Google Maps API initialized, creating map...');

        if (!mapRef.current) {
          console.error('MapComponent: mapRef.current is null');
          return;
        }

        console.log('MapComponent: Creating map with container:', mapRef.current);

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
          zoom: 13,
          tilt: 0, // Start with 2D view
          heading: 0,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          gestureHandling: 'cooperative',
          // Enable 3D features
          zoomControl: true,
          scaleControl: true,
          rotateControl: true
        });

        mapInstanceRef.current = map;
        console.log('MapComponent: Map created successfully');
        onMapReady?.(map);
      } catch (error) {
        console.error('MapComponent: Failed to load Google Maps:', error);
        console.error('MapComponent: Error details:', error instanceof Error ? error.message : 'Unknown error');
        console.error('MapComponent: API Key used:', apiKey ? `${apiKey.substring(0, 10)}...` : 'No API key');
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [apiKey]);

  // Toggle 3D mode
  const toggle3DMode = () => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    if (is3DMode) {
      // Switch to 2D
      map.setTilt(0);
      map.setHeading(0);
      setIs3DMode(false);
    } else {
      // Switch to 3D
      map.setTilt(45);
      map.setHeading(0);
      setIs3DMode(true);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!mapRef.current) return;

    if (!isFullscreen) {
      if (mapRef.current.requestFullscreen) {
        mapRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Change map type
  const changeMapType = (type: 'roadmap' | 'satellite' | 'terrain') => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    switch (type) {
      case 'satellite':
        map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        break;
      case 'terrain':
        map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
        break;
      default:
        map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    }
    setMapType(type);
  };

  // Reset camera to default view
  const resetCamera = () => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    map.setTilt(0);
    map.setHeading(0);
    setIs3DMode(false);
  };

  // Clear existing markers and polylines
  const clearMap = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    markersRef.current = [];
    polylinesRef.current = [];
  };

  // Reset bounds to show all routes
  const resetBounds = () => {
    if (!mapInstanceRef.current || routes.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    routes.forEach(route => {
      route.path.forEach(point => {
        bounds.extend(new google.maps.LatLng(point.lat, point.lng));
      });
    });

    mapInstanceRef.current.fitBounds(bounds, 50);
  };

  // Draw routes on map with enhanced 3D visualization
  useEffect(() => {
    if (!mapInstanceRef.current || routes.length === 0) return;

    clearMap();

    routes.forEach((route) => {
      if (route.path.length < 2) return;

      const isSelected = selectedRoute?.id === route.id;
      const color = isSelected ? '#3B82F6' : '#6b7280';
      const weight = isSelected ? 6 : 2;

      const path = route.path.map(point => new google.maps.LatLng(point.lat, point.lng));

      // Enhanced polyline with 3D styling
      const polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: isSelected ? 1.0 : 0.6,
        strokeWeight: isSelected ? weight + 2 : weight,
        // Add 3D effects
        icons: isSelected ? [
          {
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 3,
              fillColor: color,
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 1
            },
            offset: '0',
            repeat: '20px'
          }
        ] : undefined,
        map: mapInstanceRef.current
      });

      polylinesRef.current.push(polyline);

      // Add start and destination markers for selected route with 3D styling
      if (isSelected && route.path.length > 0) {
        // Start marker (green) with 3D effect
        const startMarker = new google.maps.Marker({
          position: new google.maps.LatLng(route.path[0].lat, route.path[0].lng),
          map: mapInstanceRef.current,
          title: 'Start',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
                  </filter>
                </defs>
                <circle cx="20" cy="20" r="18" fill="#10B981" stroke="white" stroke-width="3" filter="url(#shadow)"/>
                <circle cx="20" cy="20" r="8" fill="white"/>
                <circle cx="20" cy="20" r="4" fill="#10B981"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          }
        });

        // Destination marker (red) with 3D effect
        const endMarker = new google.maps.Marker({
          position: new google.maps.LatLng(route.path[route.path.length - 1].lat, route.path[route.path.length - 1].lng),
          map: mapInstanceRef.current,
          title: 'Destination',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
                  </filter>
                </defs>
                <circle cx="20" cy="20" r="18" fill="#EF4444" stroke="white" stroke-width="3" filter="url(#shadow)"/>
                <path d="M14 20l3 3 6-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          }
        });

        markersRef.current.push(startMarker, endMarker);
      }

      // Add enhanced 3D markers for photo spots (only show top 5 for selected route, 2 for others)
      const maxMarkers = isSelected ? 5 : 2;
      const sortedSpots = route.photoSpots
        .filter(spot => spot.location)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, maxMarkers);

      sortedSpots.forEach((spot) => {
        if (!spot.location) return;

        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(spot.location.lat, spot.location.lng),
          map: mapInstanceRef.current,
          title: spot.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000000" flood-opacity="0.2"/>
                  </filter>
                </defs>
                <circle cx="14" cy="14" r="12" fill="${isSelected ? '#3B82F6' : '#6b7280'}" stroke="white" stroke-width="1.5" filter="url(#shadow)"/>
                <circle cx="14" cy="14" r="5" fill="white"/>
                <path d="M10 14l2 2 3-3" stroke="${isSelected ? '#3B82F6' : '#6b7280'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="14" cy="6" r="1.5" fill="#FFD700"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(28, 28),
            anchor: new google.maps.Point(14, 14)
          }
        });

        marker.addListener('click', () => {
          setSelectedPhotoSpot(spot);
        });

        markersRef.current.push(marker);
      });
    });

    // Only fit bounds on initial load, not on every route update
    if (routes.length > 0 && !hasInitialBounds) {
      const bounds = new google.maps.LatLngBounds();
      routes.forEach(route => {
        route.path.forEach(point => {
          bounds.extend(new google.maps.LatLng(point.lat, point.lng));
        });
      });

      // Add some padding to the bounds
      mapInstanceRef.current.fitBounds(bounds, 50);

      setHasInitialBounds(true);
    }
  }, [routes, hasInitialBounds]); // Removed selectedRoute from dependencies

  // Update route styling when selection changes (without redrawing)
  useEffect(() => {
    if (!mapInstanceRef.current || polylinesRef.current.length === 0) return;

    polylinesRef.current.forEach((polyline, index) => {
      const route = routes[index];
      if (!route) return;

      const isSelected = selectedRoute?.id === route.id;
      const color = isSelected ? '#3B82F6' : '#6b7280';
      const weight = isSelected ? 6 : 2;

      polyline.setOptions({
        strokeColor: color,
        strokeOpacity: isSelected ? 1.0 : 0.7,
        strokeWeight: weight,
        icons: isSelected ? [
          {
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 3,
              fillColor: color,
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 1
            },
            offset: '0',
            repeat: '20px'
          }
        ] : undefined
      });
    });

    // Update marker icons for selection
    markersRef.current.forEach((marker, index) => {
      const route = routes[Math.floor(index / 2)];
      if (!route) return;

      const isSelected = selectedRoute?.id === route.id;
      const spot = route.photoSpots[index % route.photoSpots.length];
      if (!spot) return;

      marker.setIcon({
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
              </filter>
            </defs>
            <circle cx="16" cy="16" r="14" fill="${isSelected ? '#3B82F6' : '#6b7280'}" stroke="white" stroke-width="2" filter="url(#shadow)"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
            <path d="M12 16l2 2 4-4" stroke="${isSelected ? '#3B82F6' : '#6b7280'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="16" cy="8" r="2" fill="#FFD700"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16)
      });
    });
  }, [selectedRoute, routes]);

  if (!apiKey) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="glass-card rounded-3xl p-12 max-w-2xl mx-auto text-center">
            <div className="relative mb-8">
              <div className="bg-gradient-to-r from-primary-100 to-primary-200 p-8 rounded-3xl inline-block">
                <Camera className="h-20 w-20 text-primary-600" />
              </div>
              <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-3">
                <Sparkles className="h-6 w-6 text-yellow-900" />
              </div>
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Interactive 3D Map View
            </h3>

            {selectedRoute ? (
              <div className="space-y-6">
                <p className="text-gray-600 text-lg leading-relaxed">
                  Currently viewing <strong className="text-primary-600">{selectedRoute.name}</strong> with {selectedRoute.photoSpots.length} stunning photo opportunities
                </p>

                <div className="glass-card p-6 rounded-2xl border border-primary-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-primary-900">Photo Score</span>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-primary-500" />
                      <span className="text-3xl font-bold text-primary-600">
                        {selectedRoute.photoScore}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-primary-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${selectedRoute.photoScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                    <MapPin className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{selectedRoute.distance}</div>
                    <div className="text-sm text-gray-600">Distance</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Clock className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{selectedRoute.duration}</div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Camera className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{selectedRoute.photoSpots.length}</div>
                    <div className="text-sm text-gray-600">Photo Spots</div>
                  </div>
                  {selectedRoute.travelMode && (
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-600 font-bold text-sm">{selectedRoute.travelMode.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{selectedRoute.travelMode}</div>
                      <div className="text-sm text-gray-600">Travel Mode</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-lg leading-relaxed">
                Enter your origin and destination to see beautiful photo-worthy routes with interactive 3D mapping
              </p>
            )}

            <div className="mt-8 glass-card p-6 rounded-2xl border border-yellow-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <h4 className="font-bold text-yellow-900">Demo Mode</h4>
              </div>
              <p className="text-sm text-yellow-800 leading-relaxed">
                Add your Google Maps API key to see the interactive 3D map with real-time route visualization, terrain view, and enhanced photo spot markers.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Layers Control */}
      <LayersControl
        is3DMode={is3DMode}
        mapType={mapType}
        isFullscreen={isFullscreen}
        onToggle3D={toggle3DMode}
        onResetView={resetCamera}
        onToggleFullscreen={toggleFullscreen}
        onChangeMapType={changeMapType}
        onRouteStreetView={() => setShowRouteStreetView(true)}
        selectedRoute={selectedRoute}
      />

      {/* Photo Score Legend */}
      <div className="absolute top-6 right-6 glass-card rounded-2xl p-6 shadow-xl">
        <div className="text-sm font-bold text-gray-700 mb-4">Photo Score Legend</div>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
            <span className="text-sm font-medium">90%+ (Excellent)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium">70-89% (Good)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 rounded-full"></div>
            <span className="text-sm font-medium">&lt;70% (Fair)</span>
          </div>
        </div>

        {routes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={resetBounds}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
            >
              Reset View
            </button>
          </div>
        )}
      </div>

      {/* 3D Mode Indicator */}
      {is3DMode && (
        <div className="absolute bottom-6 left-6 glass-card rounded-xl p-3 shadow-xl">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">3D Mode Active</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Tilt: 45° • Use mouse to rotate
          </div>
        </div>
      )}

      {/* Photo Spot Detail Modal */}
      {selectedPhotoSpot && (
        <PhotoSpotDetail
          spot={selectedPhotoSpot}
          onClose={() => setSelectedPhotoSpot(null)}
          onSave={(spot) => {
            console.log('Saved spot:', spot);
            // Here you could add to favorites or save to local storage
          }}
          onShare={(spot) => {
            console.log('Sharing spot:', spot);
            // Here you could implement sharing functionality
          }}
        />
      )}

      {/* Route Street View Modal */}
      {showRouteStreetView && selectedRoute && (
        <RouteStreetView
          route={selectedRoute}
          onClose={() => setShowRouteStreetView(false)}
        />
      )}
    </div>
  );
};

export default MapComponent;