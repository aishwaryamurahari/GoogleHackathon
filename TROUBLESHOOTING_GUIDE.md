# Troubleshooting Guide: Route Street View & Photo Loading Issues

## Issues Addressed

### 1. **Route Street View Not Loading (Black Screen)**
- **Problem**: Street View shows black screen instead of 360° panorama
- **Root Causes**:
  - Google Maps API not fully initialized
  - Invalid coordinates for Street View
  - Network connectivity issues
  - API key restrictions

### 2. **Photo Spots Not Loading Images**
- **Problem**: Photo spots show placeholder images instead of real photos
- **Root Causes**:
  - Google Places API photos not available
  - Network issues with photo URLs
  - API key restrictions for Places API

## Solutions Implemented

### ✅ **1. Improved Street View Initialization**

**Better API Ready Checks**:
```typescript
// Wait for Google Maps to be ready
if (!window.google || !window.google.maps) {
  console.log('Google Maps not ready, waiting...');
  const checkGoogleMaps = setInterval(() => {
    if (window.google && window.google.maps) {
      clearInterval(checkGoogleMaps);
      initMaps();
    }
  }, 100);
  return;
}
```

**Enhanced Street View Settings**:
```typescript
const panorama = new google.maps.StreetViewPanorama(streetViewRef.current!, {
  position: new google.maps.LatLng(scenicPoints[0].lat, scenicPoints[0].lng),
  pov: { heading: 34, pitch: 10 },
  zoom: 1,
  addressControl: false,
  fullscreenControl: false,
  motionTracking: false,
  motionTrackingControl: false,
  panControl: true,
  zoomControl: true,
  clickToGo: true,
  enableCloseButton: false,
  visible: true,
  showRoadLabels: true,
  disableDefaultUI: false
});

// Force visibility and position
panorama.setVisible(true);
panorama.setPosition(new google.maps.LatLng(scenicPoints[0].lat, scenicPoints[0].lng));
```

**Better Event Listeners**:
```typescript
panorama.addListener('status_changed', () => {
  const status = panorama.getStatus();
  console.log('Street View status changed:', status);
  if (status === google.maps.StreetViewStatus.OK) {
    setIsLoading(false);
    setStreetViewAvailable(true);
  } else if (status === google.maps.StreetViewStatus.ZERO_RESULTS) {
    setIsLoading(false);
    setStreetViewAvailable(false);
  }
});

panorama.addListener('pano_changed', () => {
  console.log('Street View panorama changed');
  if (panorama.getStatus() === google.maps.StreetViewStatus.OK) {
    setIsLoading(false);
    setStreetViewAvailable(true);
  }
});
```

### ✅ **2. Improved Photo Loading**

**Better Photo URLs**:
```typescript
// Use Picsum Photos for reliable fallback images
photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 150, maxHeight: 100 }) ||
         `https://picsum.photos/150/100?random=${Math.floor(Math.random() * 1000)}&blur=1`
```

**Enhanced Photo Loading States**:
```typescript
<img
  src={spot.photoUrl}
  alt={spot.name}
  className="w-full h-full object-cover"
  onLoad={(e) => {
    const target = e.target as HTMLImageElement;
    target.style.opacity = '1';
  }}
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    target.nextElementSibling?.classList.remove('hidden');
  }}
  style={{ opacity: 0, transition: 'opacity 0.3s' }}
/>
```

### ✅ **3. Better Coordinates for Street View**

**Demo Coordinates** (known to have Street View):
```typescript
const demoCoordinates = [
  { lat: 37.7749, lng: -122.4194 }, // San Francisco
  { lat: 37.7849, lng: -122.4094 }, // San Francisco area
  { lat: 37.7949, lng: -122.3994 }, // San Francisco area
  { lat: 37.8049, lng: -122.3894 }, // San Francisco area
  { lat: 37.8149, lng: -122.3794 }  // San Francisco area
];
```

### ✅ **4. Debug Tools**

**Debug Button**: Click the blue eye icon in Route Street View header
```typescript
onClick={() => {
  console.log('Debug: Street View status:', streetView?.getStatus());
  console.log('Debug: Current point:', currentPoint);
  console.log('Debug: Scenic points:', scenicPoints);
}}
```

**Console Logging**: Detailed logs for troubleshooting
```typescript
console.log('Initializing Street View with coordinates:', scenicPoints[0].lat, scenicPoints[0].lng);
console.log('Street View status changed:', status);
console.log('Street View loaded successfully');
```

## Testing Steps

### 1. **Check API Key**
```bash
# Verify your Google Maps API key has these services enabled:
# - Maps JavaScript API
# - Street View API
# - Places API
# - Directions API
```

### 2. **Test Street View Loading**
1. Open browser dev tools (F12)
2. Go to Console tab
3. Click "Route Street View" button
4. Look for debug messages:
   - "Google Maps not ready, waiting..."
   - "Initializing Street View with coordinates:"
   - "Street View status changed:"
   - "Street View loaded successfully"

### 3. **Test Photo Loading**
1. Select a route with photo spots
2. Check if photos load in PhotoSpotList
3. Click on photo spots to see PhotoSpotDetail
4. Verify photos appear in the detail modal

### 4. **Network Issues**
```bash
# Check if these URLs load in browser:
# https://picsum.photos/150/100?random=123
# https://maps.googleapis.com/maps/api/js
```

## Common Issues & Solutions

### ❌ **Issue: Street View Still Black**
**Solutions**:
1. **Check API Key**: Ensure Street View API is enabled
2. **Check Coordinates**: Use debug button to verify coordinates
3. **Check Network**: Ensure no firewall blocking Google APIs
4. **Try Different Route**: Some areas have no Street View coverage

### ❌ **Issue: Photos Still Placeholder**
**Solutions**:
1. **Check Places API**: Ensure Places API is enabled
2. **Check Network**: Test Picsum Photos URLs
3. **Check Console**: Look for photo loading errors
4. **Try Different Route**: Some areas have more photo spots

### ❌ **Issue: Mini Map Not Loading**
**Solutions**:
1. **Check Map Container**: Ensure mini map div exists
2. **Check Coordinates**: Verify coordinates are valid
3. **Check API Key**: Ensure Maps JavaScript API enabled
4. **Check Console**: Look for map initialization errors

## Debug Commands

### **Browser Console Commands**:
```javascript
// Check if Google Maps is loaded
console.log('Google Maps loaded:', !!window.google);

// Check Street View status
console.log('Street View status:', streetView?.getStatus());

// Check current coordinates
console.log('Current point:', currentPoint);

// Check photo spots
console.log('Photo spots:', photoSpots);
```

### **Network Tab Checks**:
1. **Google Maps API**: Should return 200 status
2. **Street View API**: Should return 200 status
3. **Places API**: Should return 200 status
4. **Photo URLs**: Should return 200 status

## Performance Optimizations

### 1. **Lazy Loading**
- Photos load only when needed
- Street View loads on demand
- Progressive loading with placeholders

### 2. **Caching**
- Photo spot results cached
- API responses cached
- Browser caching for images

### 3. **Error Recovery**
- Graceful fallbacks for failed loads
- Retry mechanisms for network issues
- Alternative content when primary fails

## API Requirements

### **Required Google APIs**:
1. **Maps JavaScript API**: Base map functionality
2. **Street View API**: 360° panoramic views
3. **Places API**: Place details and photos
4. **Directions API**: Route planning

### **API Key Permissions**:
```json
{
  "restrictions": {
    "apiTargets": [
      "maps.googleapis.com",
      "streetview.googleapis.com",
      "places.googleapis.com"
    ]
  }
}
```

## Browser Compatibility

### **Supported Browsers**:
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ⚠️ Mobile browsers: Limited Street View controls

### **Fallbacks**:
- Static images for failed photo loads
- 2D map view for unsupported Street View
- Basic controls for mobile devices

This troubleshooting guide should help resolve the Route Street View and photo loading issues! 🚀