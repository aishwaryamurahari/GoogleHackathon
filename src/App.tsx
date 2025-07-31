import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Star, AlertCircle, MapPin, Navigation, Search, Sparkles, TrendingUp, Car, Bike, Footprints, Eye } from 'lucide-react';
import MapComponent from './components/MapComponent.tsx';
import RouteCard from './components/RouteCard.tsx';
import SearchBar from './components/SearchBar.tsx';
import LoadingIndicator from './components/LoadingIndicator.tsx';
import Route3DViewer from './components/3DRouteViewer.tsx';
import { Route } from './types.ts';
import { RouteService } from './services/routeService.ts';
import GoogleMapsService from './services/googleMapsService.ts';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

// Debug API key (only show first few characters)
console.log('App: API Key available:', GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 'No API key found');
console.log('App: Environment variables:', {
  REACT_APP_GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? 'Set' : 'Not set'
});

function App() {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [error, setError] = useState<string>('');
  const [routeService, setRouteService] = useState<RouteService | null>(null);
  const [searchCompleted, setSearchCompleted] = useState<boolean>(false);
  const [show3DViewer, setShow3DViewer] = useState<boolean>(false);

  // Initialize Google Maps when API key is available
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key is required. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env.local file.');
      return;
    }

    if (routeService) {
      return; // Already initialized
    }

    const initGoogleMaps = async () => {
      try {
        // Use centralized Google Maps service
        const mapsService = GoogleMapsService.getInstance();
        await mapsService.initialize(GOOGLE_MAPS_API_KEY);

        // Create a temporary map instance for the service
        const tempMap = new google.maps.Map(document.createElement('div'));
        const service = new RouteService(tempMap);
        setRouteService(service);
        setError('');
      } catch (err) {
        console.error('Google Maps initialization error:', err);
        setError(`Failed to load Google Maps API: ${err instanceof Error ? err.message : 'Unknown error'}. Please check your API key and enabled services.`);
      }
    };

    initGoogleMaps();
  }, [routeService]);

  const handleSearch = async () => {
    if (!origin || !destination) {
      setError('Please enter both origin and destination.');
      return;
    }

    if (!routeService) {
      setError('Google Maps API is not ready. Please check your API key and try refreshing the page.');
      return;
    }

    setLoading(true);
    setError('');
    setRoutes([]);
    setSelectedRoute(null);
    setSearchCompleted(false);

    try {
      const foundRoutes = await routeService.findPhotoWorthyRoutes(origin, destination);

      if (foundRoutes.length === 0) {
        setError('No routes found between these locations. Please try different addresses.');
        return;
      }

      setRoutes(foundRoutes);
      setSelectedRoute(foundRoutes[0]);
      setSearchCompleted(true);
    } catch (err) {
      console.error('Route search error:', err);
      setError('Failed to find routes. Please check your addresses and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapReady = useCallback((map: google.maps.Map) => {
    // Map is ready, but we don't need to store it in state
    console.log('Map is ready:', map);
  }, []);

  const handleQuickModeSelect = (route: Route) => {
    setSelectedRoute(route);
  };

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="glass-card border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand - Top Left */}
            <div className="flex items-center space-x-3">
              <div className="relative flex-shrink-0">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2.5 rounded-xl shadow-lg">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 bg-yellow-400 rounded-full p-0.5">
                  <Sparkles className="h-2.5 w-2.5 text-yellow-900" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold gradient-text leading-tight">SnapRoute</h1>
                <p className="text-xs text-gray-600 font-medium leading-tight">Photo-worthy routes</p>
              </div>
            </div>

            {/* Status Badges - Center/Right */}
            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-700 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                <TrendingUp className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap text-xs">Best Use of Places API</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-current flex-shrink-0" />
                <span className="font-medium whitespace-nowrap text-xs">Photo-Worthy Routes</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-center space-x-3 text-red-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-96 bg-white/80 backdrop-blur-xl border-r border-white/20 flex flex-col">
          {/* Compact Search Section */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <div className="mb-3">
              <h2 className="text-base font-bold text-gray-900 mb-1">Find Your Perfect Route</h2>
              <p className="text-gray-600 text-xs leading-tight">Enter start and end points to discover photogenic paths</p>
            </div>
            <SearchBar
              origin={origin}
              destination={destination}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              onSearch={handleSearch}
              loading={loading}
            />
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 relative">
            {/* Scroll Indicator */}
            <div className="absolute top-0 right-2 w-1 h-8 bg-gradient-to-b from-blue-400 to-transparent rounded-full opacity-60 pointer-events-none z-10"></div>
            {searchCompleted && routes.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">
                    Travel Options
                  </h3>
                  <div className="bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                    {routes.length} modes
                  </div>
                </div>

                {/* Quick Travel Mode Preview */}
                <div className="space-y-1.5 mb-4">
                  {routes.slice(0, 3).map((route) => (
                    <div
                      key={route.id}
                      onClick={() => handleQuickModeSelect(route)}
                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                        selectedRoute?.id === route.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-1.5 rounded-full ${
                          selectedRoute?.id === route.id ? 'bg-blue-100' : 'bg-white'
                        }`}>
                          {route.travelMode === 'Driving' && <Car className="h-3.5 w-3.5 text-blue-600" />}
                          {route.travelMode === 'Cycling' && <Bike className="h-3.5 w-3.5 text-green-600" />}
                          {route.travelMode === 'Walking' && <Footprints className="h-3.5 w-3.5 text-orange-600" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{route.travelMode}</div>
                          <div className="text-xs text-gray-500">{route.distance}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{route.duration}</div>
                        <div className="text-xs text-gray-500">Photo: {route.photoScore}%</div>
                      </div>
                    </div>
                  ))}

                  {routes.length > 3 && (
                    <div className="text-center text-sm text-gray-500 py-2">
                      +{routes.length - 3} more options available
                    </div>
                  )}
                </div>

                {/* Spacer to prevent overlap */}
                <div className="h-4"></div>

                {/* Selected Route Details */}
                {selectedRoute && (
                  <div className="mt-6 pt-4 border-t border-gray-200 bg-white/40 rounded-lg p-3">
                    <RouteCard
                      route={selectedRoute}
                      isSelected={true}
                      onSelect={() => {}}
                    />

                    {/* 3D View Button */}
                    {/* <button
                      onClick={() => setShow3DViewer(true)}
                      className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View in 3D</span>
                    </button> */}
                  </div>
                )}
              </div>
            ) : !loading ? (
              <div className="text-center py-12">
                <div className="relative mb-6">
                  <div className="bg-gradient-to-r from-primary-100 to-primary-200 p-4 rounded-2xl inline-block">
                    <Camera className="h-12 w-12 text-primary-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1.5">
                    <Sparkles className="h-3 w-3 text-yellow-900" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Ready to Discover?
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed text-sm">
                  Enter your origin and destination to discover the most Instagram-worthy paths with stunning photo opportunities.
                </p>
                {!GOOGLE_MAPS_API_KEY ? (
                  <div className="glass-card p-4 rounded-xl border border-yellow-200">
                    <h4 className="font-bold text-yellow-900 mb-2 text-sm">Setup Required</h4>
                    <p className="text-xs text-yellow-800 leading-relaxed">
                      Add your Google Maps API key to see real photo-worthy routes with actual landmarks and photo spots.
                    </p>
                  </div>
                ) : (
                  <div className="glass-card p-4 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-2 text-sm">Try These Examples</h4>
                    <div className="text-xs text-blue-800 space-y-1">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3" />
                        <span>"Times Square, NYC" → "Brooklyn Bridge"</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3" />
                        <span>"Sagrada Familia, Barcelona" → "Park Güell"</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3" />
                        <span>"Eiffel Tower, Paris" → "Louvre Museum"</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <LoadingIndicator
                message="Finding Your Perfect Route"
                progress={loading ? 75 : undefined}
              />
                        )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapComponent
            apiKey={GOOGLE_MAPS_API_KEY}
            selectedRoute={selectedRoute}
            routes={routes}
            onMapReady={handleMapReady}
          />
        </div>
      </div>

      {/* 3D Route Viewer Modal */}
      {show3DViewer && (
        <Route3DViewer
          apiKey={GOOGLE_MAPS_API_KEY}
          route={selectedRoute}
          onClose={() => setShow3DViewer(false)}
        />
      )}

    </div>
  );
}

export default App;