import React, { useState, useEffect } from 'react';
import { PhotoSpot } from '../types';
import { X, Star, MapPin, Clock, Phone, Share, Bookmark, Navigation, Eye, Camera, Image, AlertCircle } from 'lucide-react';
import StreetView360 from './StreetView360.tsx';

interface PhotoSpotDetailProps {
  spot: PhotoSpot;
  onClose: () => void;
  onSave?: (spot: PhotoSpot) => void;
  onShare?: (spot: PhotoSpot) => void;
}

interface PlaceDetails {
  name: string;
  rating: number;
  reviewCount: number;
  category: string;
  description: string;
  address: string;
  hours: string;
  phone?: string;
  website?: string;
  photos: string[];
  accessibility: boolean;
  price?: string;
  reviews?: Array<{
    author: string;
    rating: number;
    text: string;
    time: string;
    profilePhoto?: string;
  }>;
}

const PhotoSpotDetail: React.FC<PhotoSpotDetailProps> = ({
  spot,
  onClose,
  onSave,
  onShare
}) => {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'reviews' | 'about'>('overview');
  const [show360View, setShow360View] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState<{[key: string]: boolean}>({});
  const [photoErrors, setPhotoErrors] = useState<{[key: string]: boolean}>({});

  // Fetch real Google Places data
  useEffect(() => {
    const fetchPlaceDetails = async () => {
      setLoading(true);

      try {
        if (!spot.location) {
          throw new Error('Location not available');
        }

        // Create a map instance for Places service
        const mapDiv = document.createElement('div');
        const map = new google.maps.Map(mapDiv);
        const placesService = new google.maps.places.PlacesService(map);

        // Search for the place using its name and location
        const request = {
          query: spot.name,
          location: new google.maps.LatLng(spot.location.lat, spot.location.lng),
          radius: 5000 // 5km radius
        };

        placesService.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const place = results[0];

            // Get detailed place information
            const detailRequest = {
              placeId: place.place_id!,
              fields: ['name', 'rating', 'user_ratings_total', 'types', 'formatted_address', 'opening_hours', 'formatted_phone_number', 'website', 'photos', 'reviews', 'price_level']
            };

            placesService.getDetails(detailRequest, (placeDetails, detailStatus) => {
              if (detailStatus === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
                const details: PlaceDetails = {
                  name: placeDetails.name || spot.name,
                  rating: placeDetails.rating || spot.rating,
                  reviewCount: placeDetails.user_ratings_total || 0,
                  category: getCategoryFromTypes(placeDetails.types || []),
                  description: getDescriptionFromName(spot.name),
                  address: placeDetails.formatted_address || generateAddress(spot.name),
                  hours: placeDetails.opening_hours?.weekday_text?.join(', ') || getRandomHours(),
                  phone: placeDetails.formatted_phone_number,
                  website: placeDetails.website,
                  photos: getPhotosFromPlace(placeDetails),
                  accessibility: false, // Not available in current API
                  price: placeDetails.price_level ? '💰'.repeat(placeDetails.price_level) : undefined,
                  reviews: getReviewsFromPlace(placeDetails)
                };

                setPlaceDetails(details);
                setLoading(false);
              } else {
                // Fallback to dummy data if Google Places fails
                console.warn('Google Places details failed, using fallback data');
                setPlaceDetails(getFallbackDetails(spot));
                setLoading(false);
              }
            });
          } else {
            // Fallback to dummy data if Google Places search fails
            console.warn('Google Places search failed, using fallback data');
            setPlaceDetails(getFallbackDetails(spot));
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error fetching place details:', error);
        setPlaceDetails(getFallbackDetails(spot));
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [spot]);

  const getCategoryFromTypes = (types: string[]): string => {
    if (types.includes('park')) return 'Park';
    if (types.includes('museum')) return 'Museum';
    if (types.includes('restaurant') || types.includes('food')) return 'Restaurant';
    if (types.includes('art_gallery')) return 'Art Gallery';
    if (types.includes('tourist_attraction') || types.includes('landmark')) return 'Landmark';
    if (types.includes('natural_feature')) return 'Scenic Spot';
    if (types.includes('cafe')) return 'Cafe';
    return 'Point of Interest';
  };

  const getCategoryFromName = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('park') || lowerName.includes('garden')) return 'Park';
    if (lowerName.includes('museum') || lowerName.includes('gallery')) return 'Museum';
    if (lowerName.includes('cafe') || lowerName.includes('restaurant')) return 'Restaurant';
    if (lowerName.includes('art') || lowerName.includes('mural')) return 'Art Gallery';
    if (lowerName.includes('bridge') || lowerName.includes('monument')) return 'Landmark';
    if (lowerName.includes('view') || lowerName.includes('scenic')) return 'Scenic Spot';
    return 'Point of Interest';
  };

  const getPhotosFromPlace = (placeDetails: google.maps.places.PlaceResult): string[] => {
    if (placeDetails.photos && placeDetails.photos.length > 0) {
      return placeDetails.photos.slice(0, 6).map(photo => {
        return photo.getUrl({ maxWidth: 400, maxHeight: 300 });
      });
    }
    return generatePhotos(spot.name); // Fallback to dummy photos
  };

  const getReviewsFromPlace = (placeDetails: google.maps.places.PlaceResult): PlaceDetails['reviews'] => {
    if (placeDetails.reviews && placeDetails.reviews.length > 0) {
      return placeDetails.reviews.slice(0, 5).map(review => ({
        author: review.author_name || 'Anonymous',
        rating: review.rating || 0,
        text: review.text || '',
        time: review.relative_time_description || 'Recently',
        profilePhoto: review.profile_photo_url
      }));
    }
    return undefined;
  };

  const getFallbackDetails = (spot: PhotoSpot): PlaceDetails => {
    return {
      name: spot.name,
      rating: spot.rating,
      reviewCount: Math.floor(Math.random() * 2000) + 100,
      category: getCategoryFromName(spot.name),
      description: getDescriptionFromName(spot.name),
      address: generateAddress(spot.name),
      hours: getRandomHours(),
      phone: Math.random() > 0.5 ? generatePhone() : undefined,
      website: Math.random() > 0.5 ? generateWebsite(spot.name) : undefined,
      photos: generatePhotos(spot.name),
      accessibility: Math.random() > 0.7,
      price: Math.random() > 0.8 ? `$${Math.floor(Math.random() * 50) + 5}.00` : undefined
    };
  };

  const getDescriptionFromName = (name: string): string => {
    const descriptions = [
      "A stunning location perfect for photography with breathtaking views and unique perspectives.",
      "This iconic spot offers incredible photo opportunities with its distinctive architecture and atmosphere.",
      "A popular destination known for its picturesque setting and photogenic qualities.",
      "Experience the beauty of this location through your lens with endless creative possibilities.",
      "A must-visit location for photographers seeking the perfect shot and memorable moments."
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const generateAddress = (name: string): string => {
    const addresses = [
      "123 Main St, Downtown District",
      "456 Park Ave, Historic Quarter",
      "789 River Rd, Waterfront Area",
      "321 Hill St, Scenic Heights",
      "654 Bridge Way, Central Plaza"
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  };

  const getRandomHours = (): string => {
    const hours = [
      "Open 24 hours",
      "Open 6:00 AM - 10:00 PM",
      "Open 8:00 AM - 8:00 PM",
      "Open 9:00 AM - 6:00 PM",
      "Open 7:00 AM - 11:00 PM"
    ];
    return hours[Math.floor(Math.random() * hours.length)];
  };

  const generatePhone = (): string => {
    return `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  };

  const generateWebsite = (name: string): string => {
    const domain = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    return `https://www.${domain}.com`;
  };

  const generatePhotos = (name: string): string[] => {
    // Use more reliable photo URLs with specific categories
    const categories = ['nature', 'landscape', 'city', 'architecture', 'travel'];
    const category = categories[Math.floor(Math.random() * categories.length)];

    const photoUrls = [
      spot.photoUrl,
      `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}&blur=1`,
      `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}&blur=1`,
      `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}&blur=1`,
      `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}&blur=1`
    ];

    // Filter out empty URLs and ensure we have at least 2 photos
    const validUrls = photoUrls.filter(url => url && url.trim() !== '');
    return validUrls.length >= 2 ? validUrls : [
      `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}&blur=1`,
      `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}&blur=1`
    ];
  };

  const handleSave = () => {
    onSave?.(spot);
  };

  const handleShare = () => {
    onShare?.(spot);
  };

  const handle360View = () => {
    setShow360View(true);
  };

  const handlePhotoClick = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
  };

  const handlePhotoLoad = (photoUrl: string) => {
    setPhotoLoading(prev => ({ ...prev, [photoUrl]: false }));
  };

  const handlePhotoError = (photoUrl: string) => {
    setPhotoLoading(prev => ({ ...prev, [photoUrl]: false }));
    setPhotoErrors(prev => ({ ...prev, [photoUrl]: true }));
  };

  const isStreetViewAvailable = () => {
    // Check if the location has coordinates and is likely to have Street View
    if (!spot.location) return false;

    // Simple heuristic: locations with specific coordinates are more likely to have Street View
    const lat = spot.location.lat;
    const lng = spot.location.lng;

    // Check if coordinates are realistic (not 0,0 or extreme values)
    return lat !== 0 && lng !== 0 &&
           lat > -90 && lat < 90 &&
           lng > -180 && lng < 180;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="glass-card rounded-3xl p-12 max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (!placeDetails) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-card rounded-3xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          <img
            src={placeDetails.photos[0]}
            alt={placeDetails.name}
            className="w-full h-48 object-cover"
            onLoad={() => handlePhotoLoad(placeDetails.photos[0])}
            onError={() => handlePhotoError(placeDetails.photos[0])}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
          {/* Title and Rating */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{placeDetails.name}</h2>
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="ml-1 font-medium">{placeDetails.rating}</span>
                <span className="text-gray-500 ml-1">({placeDetails.reviewCount})</span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{placeDetails.category}</span>
              {placeDetails.accessibility && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-blue-600">♿</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2">
              <button className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Remove stop</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Bookmark className="h-4 w-4" />
                <span className="text-sm">Save</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <Navigation className="h-4 w-4" />
                <span className="text-sm">Nearby</span>
              </button>
            </div>
            <div className="flex space-x-2">
              <button className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <Phone className="h-4 w-4" />
                <span className="text-sm">Send to phone</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Share className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            {(['overview', 'photos', 'reviews', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'overview' && (
              <div>
                <p className="text-gray-700 mb-4">{placeDetails.description}</p>

                {/* Admission */}
                {placeDetails.price && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Admission</h4>
                    <p className="text-sm text-gray-600 mb-2">Gives you entry to this place</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600">✓</span>
                        <span className="font-medium">{placeDetails.name}</span>
                        <span className="text-blue-600 text-sm">Official site</span>
                      </div>
                      <span className="font-semibold">{placeDetails.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Additional fees might apply</p>
                  </div>
                )}

                {/* Location and Hours */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-900">{placeDetails.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-900">{placeDetails.hours}</p>
                    </div>
                  </div>
                  {placeDetails.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-900">{placeDetails.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="grid grid-cols-2 gap-3">
                {placeDetails.photos.map((photo, index) => (
                  <div key={index} className="relative group cursor-pointer">
                    <div className="relative">
                      {photoLoading[photo] !== false && (
                        <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                        </div>
                      )}
                      {photoErrors[photo] ? (
                        <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Photo unavailable</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={photo}
                          alt={`${placeDetails.name} photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
                          onLoad={() => handlePhotoLoad(photo)}
                          onError={() => handlePhotoError(photo)}
                          onClick={() => handlePhotoClick(photo)}
                        />
                      )}
                      {index === 0 && isStreetViewAvailable() && (
                        <button
                          onClick={handle360View}
                          className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                          title="360° View"
                        >
                          <Eye className="h-4 w-4 text-gray-700" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {placeDetails.reviews && placeDetails.reviews.length > 0 ? (
                  placeDetails.reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        {review.profilePhoto ? (
                          <img
                            src={review.profilePhoto}
                            alt={review.author}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs text-gray-600">{review.author.charAt(0)}</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{review.author}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">{review.time}</span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No reviews available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-700">{placeDetails.description}</p>
                </div>
                {placeDetails.website && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Website</h4>
                    <a href={placeDetails.website} className="text-primary-600 hover:underline">
                      {placeDetails.website}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 360° View Button - Only show if Street View is likely available */}
        {isStreetViewAvailable() && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handle360View}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors"
              title="360° View"
            >
              <Camera className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        )}

        {/* Street View Modal */}
        {show360View && isStreetViewAvailable() && (
          <StreetView360
            spot={spot}
            onClose={() => setShow360View(false)}
          />
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-70">
            <div className="relative max-w-4xl max-h-[90vh] mx-4">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors z-10"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
              <img
                src={selectedPhoto}
                alt="Full size photo"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoSpotDetail;