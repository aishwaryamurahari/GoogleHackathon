import React, { useState } from 'react';
import { Layers, Eye, EyeOff, RotateCcw, Maximize2, Minimize2, Camera, MapPin, Navigation } from 'lucide-react';

interface LayersControlProps {
  is3DMode: boolean;
  mapType: 'roadmap' | 'satellite' | 'terrain';
  isFullscreen: boolean;
  onToggle3D: () => void;
  onResetView: () => void;
  onToggleFullscreen: () => void;
  onChangeMapType: (type: 'roadmap' | 'satellite' | 'terrain') => void;
  onRouteStreetView?: () => void;
  selectedRoute?: any;
}

const LayersControl: React.FC<LayersControlProps> = ({
  is3DMode,
  mapType,
  isFullscreen,
  onToggle3D,
  onResetView,
  onToggleFullscreen,
  onChangeMapType,
  onRouteStreetView,
  selectedRoute
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setIsHovered(false), 300);
    setHoverTimeout(timeout);
  };

  // Debug log to verify component is rendering
  console.log('LayersControl rendering:', { is3DMode, mapType, isFullscreen });

  const mapTypeOptions = [
    { id: 'roadmap', label: 'Road', icon: '🛣️' },
    { id: 'satellite', label: 'Satellite', icon: '🛰️' },
    { id: 'terrain', label: 'Terrain', icon: '🏔️' }
  ];

  return (
    <div className="absolute top-6 left-6 z-50">
      {/* Main Layers Button */}
      <div
        className="glass-card rounded-xl p-3 shadow-xl cursor-pointer transition-all duration-200 hover:shadow-2xl bg-white/90 backdrop-blur-sm"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
            <Layers className="h-4 w-4 text-gray-700" />
          </div>
          <span className="text-sm font-medium text-gray-700">Layers</span>
        </div>

                       {/* Hover Panel - 3D Controls */}
               {isHovered && (
                                  <div
                   className="absolute top-full left-0 mt-2 glass-card rounded-xl p-4 shadow-2xl min-w-64 z-50 bg-white/95 backdrop-blur-sm"
                   onMouseEnter={handleMouseEnter}
                   onMouseLeave={handleMouseLeave}
                 >
            {/* 3D Controls Section */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">3D Controls</h3>
              <div className="space-y-2">
                                       <button
                         onClick={onToggle3D}
                         className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                           is3DMode
                             ? 'bg-blue-500 text-white hover:bg-blue-600'
                             : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'
                         }`}
                       >
                  {is3DMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{is3DMode ? '2D View' : '3D View'}</span>
                </button>

                                       <button
                         onClick={onResetView}
                         className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium bg-white/80 text-gray-700 hover:bg-white hover:shadow-md transition-colors cursor-pointer"
                       >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset View</span>
                </button>

                                       <button
                         onClick={onToggleFullscreen}
                         className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium bg-white/80 text-gray-700 hover:bg-white hover:shadow-md transition-colors cursor-pointer"
                       >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </button>

                {selectedRoute && onRouteStreetView && (
                                           <button
                           onClick={onRouteStreetView}
                           className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer"
                         >
                    <Camera className="h-4 w-4" />
                    <span>Route Street View</span>
                  </button>
                )}
              </div>
            </div>

            {/* Map Type Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Map Type</h3>
              <div className="grid grid-cols-3 gap-2">
                {mapTypeOptions.map((option) => (
                                           <button
                           key={option.id}
                           onClick={() => onChangeMapType(option.id as 'roadmap' | 'satellite' | 'terrain')}
                           className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                             mapType === option.id
                               ? 'bg-blue-500 text-white hover:bg-blue-600'
                               : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'
                           }`}
                         >
                    <span className="text-lg mb-1">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Layers (if needed) */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium bg-white/80 text-gray-700 hover:bg-white transition-colors">
                  <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center mb-1">
                    <Navigation className="h-3 w-3 text-green-600" />
                  </div>
                  <span>Traffic</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium bg-white/80 text-gray-700 hover:bg-white transition-colors">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mb-1">
                    <MapPin className="h-3 w-3 text-blue-600" />
                  </div>
                  <span>Transit</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium bg-white/80 text-gray-700 hover:bg-white transition-colors">
                  <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center mb-1">
                    <Layers className="h-3 w-3 text-orange-600" />
                  </div>
                  <span>More</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayersControl;