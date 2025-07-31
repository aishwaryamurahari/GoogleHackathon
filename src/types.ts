export interface PhotoSpot {
  id: string;
  name: string;
  rating: number;
  photoUrl: string;
  distance: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Route {
  id: string;
  name: string;
  distance: string;
  duration: string;
  photoScore: number;
  photoSpots: PhotoSpot[];
  path: Array<{ lat: number; lng: number }>;
  polyline?: string;
  travelMode?: string;
  baseDuration?: string;
}

export interface MapComponentProps {
  apiKey: string;
  selectedRoute: Route | null;
  routes: Route[];
}

export interface RouteCardProps {
  route: Route;
  isSelected: boolean;
  onSelect: () => void;
}

export interface SearchBarProps {
  origin: string;
  destination: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}