import React, { useState } from 'react';
import { PhotoSpot } from '../types';
import { Camera, Star, MapPin, Eye } from 'lucide-react';
import PhotoSpotDetail from './PhotoSpotDetail.tsx';

interface PhotoSpotListProps {
  photoSpots: PhotoSpot[];
  title?: string;
  maxDisplay?: number;
}

const PhotoSpotList: React.FC<PhotoSpotListProps> = ({
  photoSpots,
  title = "Photo Spots",
  maxDisplay = 8
}) => {
  const [selectedSpot, setSelectedSpot] = useState<PhotoSpot | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayedSpots = showAll ? photoSpots : photoSpots.slice(0, maxDisplay);
  const hasMore = photoSpots.length > maxDisplay && !showAll;

  const handleSpotClick = (spot: PhotoSpot) => {
    setSelectedSpot(spot);
  };

  const handleSave = (spot: PhotoSpot) => {
    console.log('Saved spot:', spot);
    // Here you could add to favorites or save to local storage
  };

  const handleShare = (spot: PhotoSpot) => {
    console.log('Sharing spot:', spot);
    // Here you could implement sharing functionality
  };

  if (photoSpots.length === 0) {
    return (
      <div className="text-center py-8">
        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No photo spots found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <Camera className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-bold text-gray-900">{photoSpots.length} photo spots</h3>
      </div>

      {/* Photo Spots List */}
      <div className="space-y-3">
        {displayedSpots.map((spot, index) => (
          <div
            key={spot.id}
            onClick={() => handleSpotClick(spot)}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
          >
            {/* Thumbnail */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                {spot.photoUrl ? (
                  <img
                    src={spot.photoUrl}
                    alt={spot.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.opacity = '1';
                    }}
                    style={{ opacity: 0, transition: 'opacity 0.3s' }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${spot.photoUrl ? 'hidden' : ''}`}>
                  <Camera className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              {/* Camera Icon Overlay */}
              <div className="absolute top-1 right-1 bg-orange-500 rounded-full p-1">
                <Camera className="h-3 w-3 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {spot.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{spot.rating}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{spot.distance}</span>
                  </div>
                </div>

                {/* 360° View Indicator */}
                {spot.location && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpotClick(spot);
                    }}
                    className="flex-shrink-0 p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3 px-4 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Camera className="h-4 w-4" />
          <span>+{photoSpots.length - maxDisplay} more photo spots</span>
        </button>
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

export default PhotoSpotList;