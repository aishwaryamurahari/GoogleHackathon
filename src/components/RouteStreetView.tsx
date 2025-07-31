import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Route } from '../types';
import { X, RotateCcw, Maximize2, Minimize2, Navigation, Eye, MapPin, Camera } from 'lucide-react';

interface RouteStreetViewProps {
  route: Route;
  onClose: () => void;
}

interface ScenicPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  category: string;
  distance: string;
}

const RouteStreetView: React.FC<RouteStreetViewProps> = ({ route, onClose }) => {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const [streetView, setStreetView] = useState<google.maps.StreetViewPanorama | null>(null);
  const [miniMap, setMiniMap] = useState<google.maps.Map | null>(null);
  const [currentPoint, setCurrentPoint] = useState<ScenicPoint | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [streetViewAvailable, setStreetViewAvailable] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Generate scenic points along the route
  const generateScenicPoints = (): ScenicPoint[] => {
    if (!route.path || route.path.length === 0) return [];

    const points: ScenicPoint[] = [];
    const scenicNames = [
      'Scenic Overlook',
      'Mountain Vista',
      'River View',
      'Forest Trail',
      'Valley Point',
      'Lake View',
      'Bridge Crossing',
      'Historic Site',
      'Wildlife Spot',
      'Photo Opportunity'
    ];

    const categories = [
      'Scenic Spot',
      'Natural Landmark',
      'Historic Site',
      'Photo Opportunity',
      'Wildlife Viewing'
    ];

    // Use more realistic coordinates that are likely to have Street View
    // For demo purposes, use some known locations with Street View
    const demoCoordinates = [
      { lat: 37.7749, lng: -122.4194 }, // San Francisco
      { lat: 37.7849, lng: -122.4094 }, // San Francisco area
      { lat: 37.7949, lng: -122.3994 }, // San Francisco area
      { lat: 37.8049, lng: -122.3894 }, // San Francisco area
      { lat: 37.8149, lng: -122.3794 }  // San Francisco area
    ];

    // If we have route path, use it; otherwise use demo coordinates
    const sourcePoints = route.path.length > 0 ? route.path : demoCoordinates.map((coord, i) => ({ lat: coord.lat, lng: coord.lng }));

    // Sample points along the route path
    const sampleIndices = [0, Math.floor(sourcePoints.length * 0.25), Math.floor(sourcePoints.length * 0.5), Math.floor(sourcePoints.length * 0.75), sourcePoints.length - 1];

    sampleIndices.forEach((index, i) => {
      if (sourcePoints[index]) {
        const point = sourcePoints[index];
        points.push({
          id: `scenic-${i}`,
          name: scenicNames[i % scenicNames.length],
          lat: point.lat,
          lng: point.lng,
          description: `A beautiful ${categories[i % categories.length].toLowerCase()} along your route. Perfect for photos and taking in the scenery.`,
          category: categories[i % categories.length],
          distance: `${Math.round((i / sampleIndices.length) * parseFloat(route.distance.replace(/[^\d.]/g, '')))} km`
        });
      }
    });

    return points;
  };

  // Memoize scenic points to prevent regeneration on every render
  const scenicPoints = React.useMemo(() => generateScenicPoints(), [route]);

  // Initialize Street View and Mini Map
  useEffect(() => {
    if (!streetViewRef.current || !miniMapRef.current || scenicPoints.length === 0 || isInitialized) return;

    const initMaps = async () => {
      try {
        // Wait for Google Maps to be ready
        if (!window.google || !window.google.maps) {
          console.log('Google Maps not ready, waiting...');
          const checkGoogleMaps = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(checkGoogleMaps);
              initMaps();
            }
          }, 100);
          return;
        }

        console.log('Initializing Street View with coordinates:', scenicPoints[0].lat, scenicPoints[0].lng);

        // Initialize Street View with better settings
        const panorama = new google.maps.StreetViewPanorama(streetViewRef.current!, {
          position: new google.maps.LatLng(scenicPoints[0].lat, scenicPoints[0].lng),
          pov: {
            heading: 34,
            pitch: 10
          },
          zoom: 1,
          addressControl: false,
          fullscreenControl: false,
          motionTracking: false,
          motionTrackingControl: false,
          panControl: true,
          zoomControl: true,
          clickToGo: true,
          enableCloseButton: false,
          visible: true,
          showRoadLabels: true,
          disableDefaultUI: false
        });

        // Force the panorama to be visible and set position
        panorama.setVisible(true);
        panorama.setPosition(new google.maps.LatLng(scenicPoints[0].lat, scenicPoints[0].lng));

        // Initialize Mini Map
        const map = new google.maps.Map(miniMapRef.current!, {
          center: new google.maps.LatLng(scenicPoints[0].lat, scenicPoints[0].lng),
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: 'cooperative',
          backgroundColor: '#f8f9fa'
        });

        // Draw route on mini map
        const routePath = route.path.map(point => new google.maps.LatLng(point.lat, point.lng));
        new google.maps.Polyline({
          path: routePath,
          geodesic: true,
          strokeColor: '#3B82F6',
          strokeOpacity: 1.0,
          strokeWeight: 4,
          map: map
        });

        // Add markers for scenic points
        scenicPoints.forEach((point, index) => {
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(point.lat, point.lng),
            map: map,
            title: point.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="white" stroke-width="2"/>
                  <path d="M12 8v8M8 12h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(24, 24),
              anchor: new google.maps.Point(12, 12)
            }
          });

          marker.addListener('click', () => {
            setCurrentPoint(point);
            setStepIndex(index);
            panorama.setPosition(new google.maps.LatLng(point.lat, point.lng));
            map.setCenter(new google.maps.LatLng(point.lat, point.lng));
          });
        });

        panorama.addListener('status_changed', () => {
          const status = panorama.getStatus();
          console.log('Street View status changed:', status);
          if (status === google.maps.StreetViewStatus.OK) {
            console.log('Street View loaded successfully');
            setIsLoading(false);
            setStreetViewAvailable(true);
          } else if (status === google.maps.StreetViewStatus.ZERO_RESULTS) {
            console.log('No Street View available for this location');
            setIsLoading(false);
            setStreetViewAvailable(false);
          } else {
            console.log('Street View status:', status, 'still loading...');
          }
        });

        // Also listen for position_changed to ensure panorama is properly positioned
        panorama.addListener('position_changed', () => {
          console.log('Street View position changed');
        });

        // Listen for panorama_changed to detect when Street View is ready
        panorama.addListener('pano_changed', () => {
          console.log('Street View panorama changed');
          if (panorama.getStatus() === google.maps.StreetViewStatus.OK) {
            setIsLoading(false);
            setStreetViewAvailable(true);
          }
        });

        setStreetView(panorama);
        setMiniMap(map);
        setCurrentPoint(scenicPoints[0]);
        setIsInitialized(true);

        // Set a timeout to handle cases where Street View doesn't load
        const timeout = setTimeout(() => {
          if (isLoading) {
            console.log('Street View loading timeout, showing fallback');
            setIsLoading(false);
            setStreetViewAvailable(false);
          }
        }, 10000); // 10 second timeout

        return () => {
          clearTimeout(timeout);
        };
      } catch (error) {
        console.error('Failed to initialize maps:', error);
        setIsLoading(false);
        setStreetViewAvailable(false);
      }
    };

    if (window.google && window.google.maps) {
      initMaps();
    } else {
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          initMaps();
        }
      }, 100);
    }

    return () => {
      if (streetView) {
        streetView.setVisible(false);
      }
    };
  }, [route, scenicPoints, isInitialized]);

  // Reset initialization when route changes
  useEffect(() => {
    setIsInitialized(false);
  }, [route]);

  const nextStep = () => {
    if (stepIndex < scenicPoints.length - 1) {
      const nextIndex = stepIndex + 1;
      const nextPoint = scenicPoints[nextIndex];
      setCurrentPoint(nextPoint);
      setStepIndex(nextIndex);

      if (streetView) {
        streetView.setPosition(new google.maps.LatLng(nextPoint.lat, nextPoint.lng));
      }
      if (miniMap) {
        miniMap.setCenter(new google.maps.LatLng(nextPoint.lat, nextPoint.lng));
      }
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      const prevIndex = stepIndex - 1;
      const prevPoint = scenicPoints[prevIndex];
      setCurrentPoint(prevPoint);
      setStepIndex(prevIndex);

      if (streetView) {
        streetView.setPosition(new google.maps.LatLng(prevPoint.lat, prevPoint.lng));
      }
      if (miniMap) {
        miniMap.setCenter(new google.maps.LatLng(prevPoint.lat, prevPoint.lng));
      }
    }
  };

  const toggleFullscreen = () => {
    if (!streetViewRef.current) return;

    if (!isFullscreen) {
      if (streetViewRef.current.requestFullscreen) {
        streetViewRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const resetView = () => {
    if (streetView && currentPoint) {
      streetView.setPov({
        heading: 34,
        pitch: 10
      });
      streetView.setZoom(1);
    }
  };

  if (scenicPoints.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
        <div className="bg-white rounded-3xl max-w-md mx-auto p-6 text-center">
          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Scenic Points</h3>
          <p className="text-gray-600 mb-6">No scenic points found along this route.</p>
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
      <div className={`bg-white rounded-3xl overflow-hidden shadow-2xl ${
        isFullscreen ? 'w-full h-full' : 'max-w-6xl w-full mx-4 max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Route Street View</h3>
                <p className="text-sm text-gray-600">
                  {route.name} • {route.distance} • {route.duration}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  console.log('Debug: Street View status:', streetView?.getStatus());
                  console.log('Debug: Current point:', currentPoint);
                  console.log('Debug: Scenic points:', scenicPoints);
                }}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                title="Debug Info"
              >
                <Eye className="h-5 w-5 text-blue-700" />
              </button>
              <button
                onClick={resetView}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Reset View"
              >
                <RotateCcw className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5 text-gray-700" /> : <Maximize2 className="h-5 w-5 text-gray-700" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Street View Section */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                <p className="text-gray-600">Loading Street View...</p>
              </div>
            </div>
          )}

                    {!isLoading && !streetViewAvailable ? (
            <div className={`bg-gray-100 ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'} flex items-center justify-center`}>
              <div className="text-center">
                <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Street View Not Available</p>
                <p className="text-sm text-gray-500 mb-4">
                  No 360° street view is available for this location
                </p>
                <div className="p-4 bg-white rounded-lg border max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-900 mb-2">Alternative Views</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• Try nearby locations for street view</p>
                    <p>• Use satellite view for aerial perspective</p>
                    <p>• Check user-uploaded photos</p>
                  </div>
                </div>
                {currentPoint && (
                  <div className="mt-4 p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold text-gray-900 mb-2">Current Location</h4>
                    <p className="text-sm text-gray-700">
                      {currentPoint.name} - {currentPoint.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {currentPoint.lat.toFixed(4)}, {currentPoint.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              ref={streetViewRef}
              className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'}`}
              style={{ minHeight: isFullscreen ? 'calc(100vh - 200px)' : '24rem' }}
            />
          )}

          {/* Navigation Info */}
          {currentPoint && (
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{currentPoint.name}</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">{currentPoint.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span>Step {stepIndex + 1} of {scenicPoints.length}</span>
                <span>{currentPoint.distance}</span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-4">
              <button
                onClick={prevStep}
                disabled={stepIndex === 0}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  stepIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600">
                {stepIndex + 1} of {scenicPoints.length}
              </span>
              <button
                onClick={nextStep}
                disabled={stepIndex === scenicPoints.length - 1}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  stepIndex === scenicPoints.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next →
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <Navigation className="h-4 w-4" />
              <span>Click and drag to explore • Scroll to zoom</span>
            </div>
          </div>
        </div>

        {/* Mini Map Section */}
        <div className="p-4 bg-gray-50">
          <div className="mb-2">
            <h4 className="font-semibold text-gray-900 mb-1">Route Overview</h4>
            <p className="text-sm text-gray-600">Click markers on the map to jump to different scenic points</p>
          </div>
          <div
            ref={miniMapRef}
            className="w-full h-48 rounded-lg overflow-hidden border border-gray-200"
          />

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-3 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Scenic Points</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Route Path</span>
            </div>
            <div className="flex items-center space-x-1">
              <Camera className="h-3 w-3 text-gray-500" />
              <span>Street View</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteStreetView;