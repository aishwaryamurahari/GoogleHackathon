import React from 'react';
import { Car, Bike, Footprints, Train, Plane, Clock, ArrowUpDown, X, Camera } from 'lucide-react';

export interface TravelMode {
  id: string;
  name: string;
  icon: React.ReactNode;
  duration: string;
  distance: string;
  photoScore: number;
  isBest?: boolean;
  isSelected?: boolean;
}

interface TravelModeSelectorProps {
  travelModes: TravelMode[];
  onModeSelect: (modeId: string) => void;
  onClose: () => void;
  onSwapLocations?: () => void;
}

const TravelModeSelector: React.FC<TravelModeSelectorProps> = ({
  travelModes,
  onModeSelect,
  onClose,
  onSwapLocations
}) => {
  const getModeIcon = (modeName: string) => {
    switch (modeName.toLowerCase()) {
      case 'driving':
        return <Car className="h-5 w-5" />;
      case 'cycling':
        return <Bike className="h-5 w-5" />;
      case 'walking':
        return <Footprints className="h-5 w-5" />;
      case 'transit':
        return <Train className="h-5 w-5" />;
      case 'flying':
        return <Plane className="h-5 w-5" />;
      default:
        return <Car className="h-5 w-5" />;
    }
  };

  const bestMode = travelModes.find(mode => mode.isBest) || travelModes[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onSwapLocations}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowUpDown className="h-4 w-4 text-gray-600" />
            </button>
            <div className="flex-1">
              <div className="text-sm text-gray-500">From</div>
              <div className="font-medium">Current Location</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Travel Modes */}
        <div className="p-4 space-y-3">
          {travelModes.map((mode) => (
            <div
              key={mode.id}
              onClick={() => onModeSelect(mode.id)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                mode.isSelected
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  mode.isSelected ? 'bg-blue-100' : 'bg-white'
                }`}>
                  {getModeIcon(mode.name)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{mode.name}</span>
                    {mode.isBest && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Best
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{mode.distance}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">{mode.duration}</div>
                <div className="text-xs text-gray-500 flex items-center space-x-1">
                  <Camera className="h-3 w-3" />
                  <span>{mode.photoScore}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <button
            onClick={() => onModeSelect(bestMode.id)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Start Navigation
          </button>
          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Clock className="h-4 w-4" />
              <span>Leave now</span>
            </button>
            <button className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelModeSelector;