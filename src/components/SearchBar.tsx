import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Search, Sparkles, X } from 'lucide-react';
import { SearchBarProps } from '../types';

const SearchBar: React.FC<SearchBarProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSearch,
  loading
}) => {
  const [focusedField, setFocusedField] = useState<'origin' | 'destination' | null>(null);
  const [apiReady, setApiReady] = useState(false);

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const originAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Check if Google Maps API is ready
  useEffect(() => {
    const checkApiReady = () => {
      console.log('Checking Google Maps API availability...');
      console.log('google object:', typeof google);
      console.log('google.maps:', typeof google !== 'undefined' ? google.maps : 'undefined');
      console.log('google.maps.places:', typeof google !== 'undefined' && google.maps ? google.maps.places : 'undefined');

      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        console.log('Google Maps API is ready!');
        setApiReady(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkApiReady()) {
      return;
    }

    // If not ready, check periodically
    const interval = setInterval(() => {
      if (checkApiReady()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!apiReady) return;

    console.log('Initializing Google Places Autocomplete...');

    try {
      // Initialize origin autocomplete
      if (originRef.current && !originAutocompleteRef.current) {
        console.log('Setting up origin autocomplete');
        originAutocompleteRef.current = new google.maps.places.Autocomplete(originRef.current, {
          types: ['geocode', 'establishment'],
          fields: ['formatted_address', 'name', 'geometry'],
          componentRestrictions: { country: 'us' }
        });

        originAutocompleteRef.current.addListener('place_changed', () => {
          const place = originAutocompleteRef.current?.getPlace();
          console.log('Origin place selected:', place);
          if (place?.formatted_address) {
            onOriginChange(place.formatted_address);
          }
        });
      }

      // Initialize destination autocomplete
      if (destinationRef.current && !destinationAutocompleteRef.current) {
        console.log('Setting up destination autocomplete');
        destinationAutocompleteRef.current = new google.maps.places.Autocomplete(destinationRef.current, {
          types: ['geocode', 'establishment'],
          fields: ['formatted_address', 'name', 'geometry'],
          componentRestrictions: { country: 'us' }
        });

        destinationAutocompleteRef.current.addListener('place_changed', () => {
          const place = destinationAutocompleteRef.current?.getPlace();
          console.log('Destination place selected:', place);
          if (place?.formatted_address) {
            onDestinationChange(place.formatted_address);
          }
        });
      }

      console.log('Google Places Autocomplete initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  }, [apiReady, onOriginChange, onDestinationChange]);

  const clearField = (field: 'origin' | 'destination') => {
    if (field === 'origin') {
      onOriginChange('');
      originRef.current?.focus();
    } else {
      onDestinationChange('');
      destinationRef.current?.focus();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Starting Point
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MapPin className="h-4 w-4 text-primary-500 group-focus-within:text-primary-600 transition-colors" />
            </div>
            <input
              ref={originRef}
              type="text"
              value={origin}
              onChange={(e) => onOriginChange(e.target.value)}
              onFocus={() => setFocusedField('origin')}
              onBlur={() => setFocusedField(null)}
              placeholder={apiReady ? "Enter your starting location" : "Loading autocomplete..."}
              className="w-full pl-10 pr-8 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white/80 backdrop-blur-sm transition-all duration-200 text-gray-900 placeholder-gray-500 font-medium text-sm"
            />
            {origin && (
              <button
                onClick={() => clearField('origin')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Destination
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Navigation className="h-4 w-4 text-primary-500 group-focus-within:text-primary-600 transition-colors" />
            </div>
            <input
              ref={destinationRef}
              type="text"
              value={destination}
              onChange={(e) => onDestinationChange(e.target.value)}
              onFocus={() => setFocusedField('destination')}
              onBlur={() => setFocusedField(null)}
              placeholder={apiReady ? "Enter your destination" : "Loading autocomplete..."}
              className="w-full pl-10 pr-8 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white/80 backdrop-blur-sm transition-all duration-200 text-gray-900 placeholder-gray-500 font-medium text-sm"
            />
            {destination && (
              <button
                onClick={() => clearField('destination')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onSearch}
        disabled={!origin || !destination || loading}
        className="w-full btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-base font-semibold py-2.5"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Finding Routes...</span>
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            <span>Find Photo-Worthy Routes</span>
            <Sparkles className="h-3 w-3" />
          </>
        )}
      </button>

      {origin && destination && !loading && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-green-800">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Ready to discover photo-worthy routes!</span>
          </div>
        </div>
      )}

      {!apiReady && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-yellow-800">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Loading Google Places API...</span>
          </div>
          <div className="mt-2 text-xs text-yellow-700">
            <p>If autocomplete isn't working, please check:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Google Maps API key is set in .env.local</li>
              <li>Places API is enabled in Google Cloud Console</li>
              <li>API key has Places API permissions</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;