# 📸 SnapRoute: Photo-Worthy Route Planner

**Take the most Instagrammable path from A to B**

SnapRoute is an innovative route planning application that helps users discover the most photogenic walking paths between two points. Instead of optimizing for speed or distance, SnapRoute finds routes that pass by highly-rated landmarks, murals, cafés, parks, scenic overlooks, and street art.

## 🏆 Hackathon Fit

This project is designed for the **Google Platform Awards Hackathon** and fits multiple award categories:

- **Best Use of Places API** - Leverages Google Places API to find photogenic points of interest
- **Transportation Award** - Innovative approach to route planning for pedestrians
- **Next Billion Users** - Perfect for emerging travel markets and content creators

## 🚀 Features

### Core Functionality
- **Origin & Destination Input** - Simple address-based routing
- **Multiple Route Alternatives** - Get 2-3 walking route options
- **Photo-Worthiness Scoring** - Routes ranked by photogenic potential
- **Interactive Map** - Visual route display with photo spot markers
- **Photo Spot Details** - Ratings, distances, and preview images

### Photo Score Algorithm
Routes are scored based on:
- Number of photogenic POIs along the path
- Average Google rating of POIs
- Number of photo-related reviews
- Proximity to scenic landmarks

### User Experience
- **Clean, Modern UI** - Built with React and Tailwind CSS
- **Responsive Design** - Works on desktop and mobile
- **Real-time Updates** - Dynamic route selection and map updates
- **Photo Spot Previews** - Thumbnail images and ratings

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons

### Google APIs
- **Maps JavaScript API** - Interactive map display
- **Places API** - Find points of interest with photos
- **Directions API** - Walking route calculation
- **Street View API** - Photo spot previews (optional)

### Development
- **Create React App** - Zero-config setup
- **ESLint** - Code quality
- **PostCSS** - CSS processing

## 🏗️ Architecture

```
src/
├── components/
│   ├── MapComponent.tsx    # Google Maps integration
│   ├── RouteCard.tsx       # Route display cards
│   └── SearchBar.tsx       # Address input
├── types.ts               # TypeScript definitions
├── App.tsx               # Main application
└── index.tsx             # Entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Google Maps API key with enabled services:
  - Maps JavaScript API
  - Places API
  - Directions API

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd snaproute
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Add your Google Maps API key:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage

1. **Enter Origin** - Type your starting point
2. **Enter Destination** - Type your destination
3. **Find Routes** - Click "Find Photo-Worthy Routes"
4. **Explore Options** - View different route alternatives
5. **Select Route** - Click on a route to see it highlighted on the map
6. **Discover Photo Spots** - Hover over markers to see photo spots

## 🎯 Sample Use Cases

### Tourist in Barcelona
- **Origin**: "My hotel"
- **Destination**: "Sagrada Familia"
- **Result**: Route passing Gaudi-designed apartments, vibrant food markets, rooftop views, and historic alleys

### Content Creator in NYC
- **Origin**: "Times Square"
- **Destination**: "Brooklyn Bridge"
- **Result**: Route through street art, scenic overlooks, and Instagram-worthy cafés

## 🔧 API Integration

### Google Places API
```typescript
// Find photogenic POIs along route
const placesService = new google.maps.places.PlacesService(map);
placesService.nearbySearch({
  location: routeCenter,
  radius: 100,
  type: ['point_of_interest'],
  keyword: 'photo|scenic|landmark'
}, callback);
```

### Directions API
```typescript
// Get walking routes with alternatives
const directionsService = new google.maps.DirectionsService();
directionsService.route({
  origin: origin,
  destination: destination,
  travelMode: google.maps.TravelMode.WALKING,
  alternatives: true
}, callback);
```

## 🎨 UI/UX Features

- **Color-coded Routes** - Photo score determines route color
- **Interactive Markers** - Click for photo spot details
- **Responsive Sidebar** - Route cards with photo previews
- **Loading States** - Smooth transitions and feedback
- **Error Handling** - Graceful API error management

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your repository
2. Set environment variables
3. Deploy automatically

## 🔮 Future Enhancements

- **Street View Integration** - Preview photo spots
- **Route Sharing** - Share Instagrammable routes
- **Offline Support** - Cache favorite routes
- **Multi-language** - Support for emerging markets
- **AR Integration** - Augmented reality photo guidance

## 📄 License

This project is created for the Google Platform Awards Hackathon.

## 🤝 Contributing

This is a hackathon project, but contributions are welcome! Please feel free to submit issues or pull requests.

---

**Built with ❤️ for the Google Platform Awards Hackathon**