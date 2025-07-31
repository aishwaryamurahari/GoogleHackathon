import React, { useEffect, useRef, useState } from 'react';
import { Route } from '../types';
import { Camera, Mountain, TrendingUp, Eye, RotateCcw, Maximize2, Minimize2, MapPin } from 'lucide-react';
import GoogleMapsService from '../services/googleMapsService.ts';
import PhotoSpotDetail from './PhotoSpotDetail.tsx';
import RouteStreetView from './RouteStreetView.tsx';

interface Route3DViewerProps {
  apiKey: string;
  route: Route | null;
  onClose: () => void;
}

interface ElevationPoint {
  lat: number;
  lng: number;
  elevation: number;
}

const Route3DViewer: React.FC<Route3DViewerProps> = ({
  apiKey,
  route,
  onClose
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [elevationData, setElevationData] = useState<ElevationPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'3D' | 'Satellite' | 'Terrain'>('3D');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPhotoSpot, setSelectedPhotoSpot] = useState<any>(null);
  const [showRouteStreetView, setShowRouteStreetView] = useState(false);

  // Initialize 3D map
  useEffect(() => {
    if (!apiKey || !mapRef.current || mapInstanceRef.current) return;

    const init3DMap = async () => {
      try {
        // Use centralized Google Maps service
        const mapsService = GoogleMapsService.getInstance();
        await mapsService.initialize(apiKey);

        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.0060 },
          zoom: 15,
          tilt: 45, // Start in 3D mode
          heading: 0,
          mapTypeId: google.maps.MapTypeId.TERRAIN, // Best for 3D viewing
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            // Enhanced 3D styling
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#a2daf2' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }]
            }
          ],
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          gestureHandling: 'cooperative',
          zoomControl: true,
          scaleControl: true,
          rotateControl: true
        });

        mapInstanceRef.current = map;
      } catch (error) {
        console.error('3D Route Viewer: Failed to load Google Maps:', error);
      }
    };

    init3DMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [apiKey]);

  // Load elevation data for the route
  useEffect(() => {
    if (!route || !mapInstanceRef.current) return;

    const loadElevationData = async () => {
      setIsLoading(true);
      try {
        const path = route.path.map(point => new google.maps.LatLng(point.lat, point.lng));

        // Create a polyline for elevation service
        const polyline = new google.maps.Polyline({
          path: path,
          geodesic: true
        });

        // Get elevation data along the path
        const elevator = new google.maps.ElevationService();
        const request = {
          path: path,
          samples: Math.min(path.length, 100) // Limit samples for performance
        };

                 elevator.getElevationAlongPath(request, (results, status) => {
           if (status === 'OK' && results) {
             const elevationPoints: ElevationPoint[] = results
               .filter(result => result.location !== null)
               .map((result) => ({
                 lat: result.location!.lat(),
                 lng: result.location!.lng(),
                 elevation: result.elevation
               }));
             setElevationData(elevationPoints);
           }
           setIsLoading(false);
         });
      } catch (error) {
        console.error('Failed to load elevation data:', error);
        setIsLoading(false);
      }
    };

    loadElevationData();
  }, [route]);

  // Draw 3D route visualization
  useEffect(() => {
    if (!route || !mapInstanceRef.current) return;

         const map = mapInstanceRef.current;

    // Fit map to route
    const bounds = new google.maps.LatLngBounds();
    route.path.forEach(point => {
      bounds.extend(new google.maps.LatLng(point.lat, point.lng));
    });
    map.fitBounds(bounds, 50);

    // Draw enhanced 3D route
    const path = route.path.map(point => new google.maps.LatLng(point.lat, point.lng));

    const polyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#3B82F6',
      strokeOpacity: 1.0,
      strokeWeight: 6,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 4,
            fillColor: '#3B82F6',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2
          },
          offset: '0',
          repeat: '25px'
        }
      ],
      map: map
    });

    // Add start and end markers with 3D styling
    if (route.path.length > 0) {
      // Start marker
      new google.maps.Marker({
        position: new google.maps.LatLng(route.path[0].lat, route.path[0].lng),
        map: map,
        title: 'Start',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.4"/>
                </filter>
              </defs>
              <circle cx="24" cy="24" r="22" fill="#10B981" stroke="white" stroke-width="4" filter="url(#shadow)"/>
              <circle cx="24" cy="24" r="10" fill="white"/>
              <circle cx="24" cy="24" r="5" fill="#10B981"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(48, 48),
          anchor: new google.maps.Point(24, 24)
        }
      });

      // End marker
      new google.maps.Marker({
        position: new google.maps.LatLng(route.path[route.path.length - 1].lat, route.path[route.path.length - 1].lng),
        map: map,
        title: 'Destination',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.4"/>
                </filter>
              </defs>
              <circle cx="24" cy="24" r="22" fill="#EF4444" stroke="white" stroke-width="4" filter="url(#shadow)"/>
              <path d="M16 24l3 3 8-8" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(48, 48),
          anchor: new google.maps.Point(24, 24)
        }
      });
    }

    // Add 3D photo spot markers
    route.photoSpots.forEach((spot) => {
      if (!spot.location) return;

      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(spot.location.lat, spot.location.lng),
        map: map,
        title: spot.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
                </filter>
              </defs>
              <circle cx="18" cy="18" r="16" fill="#3B82F6" stroke="white" stroke-width="3" filter="url(#shadow)"/>
              <circle cx="18" cy="18" r="8" fill="white"/>
              <path d="M12 18l2 2 4-4" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="18" cy="8" r="3" fill="#FFD700"/>
              <path d="M15 8l3 3 3-3" stroke="#FFD700" stroke-width="1" stroke-linecap="round"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 18)
        }
      });

      marker.addListener('click', () => {
        setSelectedPhotoSpot(spot);
      });
    });

  }, [route]);

  const changeViewMode = (mode: '3D' | 'Satellite' | 'Terrain') => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    setViewMode(mode);

    switch (mode) {
      case '3D':
        map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
        map.setTilt(45);
        break;
      case 'Satellite':
        map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        map.setTilt(45);
        break;
      case 'Terrain':
        map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
        map.setTilt(0);
        break;
    }
  };

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

  const resetView = () => {
    if (!mapInstanceRef.current || !route) return;

    const map = mapInstanceRef.current;
    map.setTilt(45);
    map.setHeading(0);

    const bounds = new google.maps.LatLngBounds();
    route.path.forEach(point => {
      bounds.extend(new google.maps.LatLng(point.lat, point.lng));
    });
    map.fitBounds(bounds, 50);
  };

  if (!route) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="glass-card rounded-3xl p-8 max-w-md mx-auto text-center">
          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Route Selected</h3>
          <p className="text-gray-600 mb-6">Select a route to view in 3D</p>
          <button
            onClick={onClose}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative w-full h-full max-w-7xl mx-auto p-4">
        <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Mountain className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">3D Route Viewer</h2>
                </div>
                <div className="text-sm text-gray-600">
                  {route.name} • {route.distance} • {route.duration}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowRouteStreetView(true)}
                  className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  title="Route Street View"
                >
                  <Camera className="h-5 w-5" />
                </button>
                <button
                  onClick={resetView}
                  className="p-2 rounded-lg bg-white/80 text-gray-700 hover:bg-white transition-colors"
                  title="Reset View"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-white/80 text-gray-700 hover:bg-white transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* 3D Map */}
          <div className="w-full h-full pt-16">
            <div ref={mapRef} className="w-full h-full" />
          </div>

          {/* Controls */}
          <div className="absolute top-20 left-4 glass-card rounded-2xl p-4 shadow-xl">
            <div className="text-sm font-bold text-gray-700 mb-3">View Mode</div>
            <div className="space-y-2">
              {(['3D', 'Satellite', 'Terrain'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => changeViewMode(mode)}
                  className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                  }`}
                >
                  {mode === '3D' && <Eye className="h-4 w-4" />}
                  {mode === 'Satellite' && <Camera className="h-4 w-4" />}
                  {mode === 'Terrain' && <Mountain className="h-4 w-4" />}
                  <span>{mode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Route Info */}
          <div className="absolute bottom-4 left-4 glass-card rounded-2xl p-4 shadow-xl max-w-sm">
            <div className="text-sm font-bold text-gray-700 mb-3">Route Details</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium">{route.distance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{route.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Photo Score:</span>
                <span className="font-medium text-primary-600">{route.photoScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Photo Spots:</span>
                <span className="font-medium">{route.photoSpots.length}</span>
              </div>
            </div>

            {elevationData.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Elevation Data</span>
                </div>
                <div className="text-xs text-gray-600">
                  Max: {Math.max(...elevationData.map(p => p.elevation)).toFixed(0)}m
                  <br />
                  Min: {Math.min(...elevationData.map(p => p.elevation)).toFixed(0)}m
                </div>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                <p className="text-sm text-gray-700">Loading elevation data...</p>
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
          {showRouteStreetView && route && (
            <RouteStreetView
              route={route}
              onClose={() => setShowRouteStreetView(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Route3DViewer;