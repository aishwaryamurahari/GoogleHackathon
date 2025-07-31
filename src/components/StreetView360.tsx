import React, { useEffect, useRef, useState } from 'react';
import { PhotoSpot } from '../types';
import { X, RotateCcw, Maximize2, Minimize2, Navigation, Eye } from 'lucide-react';

interface StreetView360Props {
  spot: PhotoSpot;
  onClose: () => void;
}

const StreetView360: React.FC<StreetView360Props> = ({ spot, onClose }) => {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const [streetView, setStreetView] = useState<google.maps.StreetViewPanorama | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streetViewAvailable, setStreetViewAvailable] = useState(false);

  useEffect(() => {
    if (!streetViewRef.current || !spot.location) return;

    const initStreetView = () => {
      try {
        const panorama = new google.maps.StreetViewPanorama(streetViewRef.current!, {
          position: new google.maps.LatLng(spot.location!.lat, spot.location!.lng),
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
          visible: true
        });

        panorama.addListener('status_changed', () => {
          const status = panorama.getStatus();
          if (status === google.maps.StreetViewStatus.OK) {
            setIsLoading(false);
            setStreetViewAvailable(true);
          } else if (status === google.maps.StreetViewStatus.ZERO_RESULTS) {
            setIsLoading(false);
            setStreetViewAvailable(false);
          }
        });

        setStreetView(panorama);
      } catch (error) {
        console.error('Failed to initialize Street View:', error);
        setIsLoading(false);
      }
    };

    // Wait for Google Maps to be ready
    if (window.google && window.google.maps) {
      initStreetView();
    } else {
      // Wait for Google Maps to load
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          initStreetView();
        }
      }, 100);
    }

    return () => {
      if (streetView) {
        streetView.setVisible(false);
      }
    };
  }, [spot.location]);

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
    if (streetView) {
      streetView.setPov({
        heading: 34,
        pitch: 10
      });
      streetView.setZoom(1);
    }
  };

  const handleNoStreetView = () => {
    return (
      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
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
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
      <div className={`bg-white rounded-3xl overflow-hidden shadow-2xl ${
        isFullscreen ? 'w-full h-full' : 'max-w-6xl w-full mx-4 max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="text-xl font-bold text-gray-900">360° View - {spot.name}</h3>
            </div>
            <div className="flex items-center space-x-2">
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

                {/* Street View Container */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                <p className="text-gray-600">Loading 360° view...</p>
              </div>
            </div>
          )}

          {!isLoading && !streetViewAvailable ? (
            <div className={`bg-gray-100 ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'} flex items-center justify-center`}>
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
              </div>
            </div>
          ) : (
            <div
              ref={streetViewRef}
              className={`bg-gray-100 ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'}`}
            />
          )}

          {/* Instructions Overlay */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <Navigation className="h-4 w-4" />
              <span>Click and drag to explore • Scroll to zoom</span>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{spot.name}</h4>
              <p className="text-sm text-gray-600">
                {spot.location ? `${spot.location.lat.toFixed(6)}, ${spot.location.lng.toFixed(6)}` : 'Location not available'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-medium ml-1">{spot.rating}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">{spot.distance}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreetView360;