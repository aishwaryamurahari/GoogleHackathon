import React, { useState } from 'react';
import { Camera, Star, Clock, MapPin, Sparkles, TrendingUp, Footprints, Bike, Car, Eye } from 'lucide-react';
import { RouteCardProps } from '../types';
import PhotoSpotDetail from './PhotoSpotDetail.tsx';

const RouteCard: React.FC<RouteCardProps> = ({ route, isSelected, onSelect }) => {
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [showAllPhotoSpots, setShowAllPhotoSpots] = useState(false);

  const handleSpotClick = (spot: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent route selection when clicking on photo spot
    setSelectedSpot(spot);
  };

  const handleSave = (spot: any) => {
    console.log('Saved spot:', spot);
    // Here you could add to favorites or save to local storage
  };

  const handleShare = (spot: any) => {
    console.log('Sharing spot:', spot);
    // Here you could implement sharing functionality
  };
  const getPhotoScoreColor = (score: number) => {
    if (score >= 90) return 'bg-gradient-to-r from-green-400 to-green-500 text-white';
    if (score >= 70) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
    return 'bg-gradient-to-r from-red-400 to-red-500 text-white';
  };

  const getPhotoScoreIcon = (score: number) => {
    if (score >= 90) return <Sparkles className="h-4 w-4" />;
    if (score >= 70) return <TrendingUp className="h-4 w-4" />;
    return <Camera className="h-4 w-4" />;
  };

  const getTravelModeIcon = (travelMode?: string) => {
    if (!travelMode) return <Footprints className="h-4 w-4" />;
    switch (travelMode.toLowerCase()) {
      case 'walking':
        return <Footprints className="h-4 w-4" />;
      case 'cycling':
        return <Bike className="h-4 w-4" />;
      case 'driving':
        return <Car className="h-4 w-4" />;
      default:
        return <Footprints className="h-4 w-4" />;
    }
  };

  return (
    <div
      className={`glass-card rounded-2xl p-3 cursor-pointer card-hover ${
        isSelected
          ? 'ring-2 ring-primary-500 shadow-xl scale-105'
          : 'hover:shadow-lg'
      }`}
      onClick={onSelect}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Scenic Route</h3>

          {/* Travel Mode and Photo Score Pills */}
          <div className="flex items-center space-x-2 mb-3">
            {route.travelMode && (
              <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1.5 rounded-full">
                {getTravelModeIcon(route.travelMode)}
                <span className="text-sm font-medium text-blue-700">{route.travelMode}</span>
              </div>
            )}
            <div className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center space-x-1 ${getPhotoScoreColor(route.photoScore)}`}>
              {getPhotoScoreIcon(route.photoScore)}
              <span>{route.photoScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Route Statistics */}
      <div className="flex items-center space-x-4 mb-3">
        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full">
          <MapPin className="h-5 w-5 text-orange-500" />
          <span className="font-semibold text-gray-900">{route.distance}</span>
        </div>
        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full">
          <Clock className="h-5 w-5 text-orange-500" />
          <span className="font-semibold text-gray-900">{route.duration}</span>
        </div>
      </div>

      {/* Photo Spots Section */}
      {route.photoSpots.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Camera className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{route.photoSpots.length} photo spots</span>
            </div>
            {route.photoSpots.length > 3 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllPhotoSpots(!showAllPhotoSpots);
                }}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {showAllPhotoSpots ? 'Show less' : 'Show all'}
              </button>
            )}
          </div>

          {/* Photo Spots List */}
          <div className="space-y-2">
            {route.photoSpots.slice(0, showAllPhotoSpots ? route.photoSpots.length : 3).map((spot) => (
                            <div
                key={spot.id}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/80 transition-colors cursor-pointer"
                onClick={(e) => handleSpotClick(spot, e)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={spot.photoUrl}
                      alt={spot.name}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className={`w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center hidden`}>
                      <Camera className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1">
                      <Camera className="h-2 w-2 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate mb-1">{spot.name}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        <span className="font-medium">{spot.rating}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium">{spot.distance}</span>
                    </div>
                  </div>
                  {spot.location && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpotClick(spot, e);
                      }}
                      className="flex-shrink-0 p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!showAllPhotoSpots && route.photoSpots.length > 3 && (
              <div className="text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllPhotoSpots(true);
                  }}
                  className="inline-flex items-center space-x-2 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>+{route.photoSpots.length - 3} more photo spots</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Route Indicator */}
      {isSelected && (
        <div className="mt-4 pt-4 border-t border-primary-100">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-900">Selected Route</span>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Spot Detail Modal */}
      {selectedSpot && (
        <PhotoSpotDetail
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          onSave={handleSave}
          onShare={handleShare}
        />
      )}
    </div>
  );
};

export default RouteCard;