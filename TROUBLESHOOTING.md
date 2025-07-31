# Google Maps API Troubleshooting Guide

## Common Issues and Solutions

### 1. API Key Issues
- **Problem**: API key not loading or invalid
- **Solution**:
  - Check that your `.env.local` file contains: `REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key`
  - Restart your development server after changing environment variables
  - Verify the API key is correct in Google Cloud Console

### 2. API Services Not Enabled
- **Problem**: APIs are enabled but still getting errors
- **Solution**: Ensure these APIs are enabled in Google Cloud Console:
  - Maps JavaScript API
  - Places API
  - Directions API
  - Geocoding API

### 3. Domain Restrictions
- **Problem**: API key has domain restrictions
- **Solution**:
  - Add `localhost` to allowed domains in Google Cloud Console
  - Add `127.0.0.1` to allowed domains
  - For production, add your actual domain

### 4. Billing Issues
- **Problem**: API calls failing due to billing
- **Solution**:
  - Enable billing in Google Cloud Console
  - Check billing status and quotas

### 5. Rate Limiting
- **Problem**: Too many API calls
- **Solution**:
  - Check your quota usage in Google Cloud Console
  - Implement request caching if needed

## Debugging Steps

1. **Check Console Logs**: Open browser developer tools and look for errors
2. **Test API Key**: Open `test-api-simple.html` in your browser
3. **Check Network Tab**: Look for failed API requests
4. **Verify Environment**: Ensure `.env.local` is in the root directory

## Testing Your Setup

1. Open `test-api-simple.html` in your browser
2. Check if the map loads and shows status messages
3. If it works, the issue is in your React app
4. If it doesn't work, the issue is with your API key or services

## Common Error Messages

- `"Google Maps API key is required"` → Check `.env.local` file
- `"Failed to load Google Maps API"` → Check API key validity and enabled services
- `"Directions request failed"` → Check if Directions API is enabled
- `"Places API error"` → Check if Places API is enabled

## Quick Fixes

1. **Restart Development Server**:
   ```bash
   npm start
   ```

2. **Clear Browser Cache**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)

3. **Check API Key**: Verify in Google Cloud Console that the key is active

4. **Test with Simple HTML**: Use the test files to isolate the issue