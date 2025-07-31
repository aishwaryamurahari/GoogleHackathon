# 🚀 SnapRoute Setup Guide

## 🔑 Google Maps API Key Setup

### Step 1: Get Your API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create/Select Project**
   - Create a new project or select existing one
   - Note your project ID

3. **Enable Required APIs**
   Go to "APIs & Services" → "Library" and enable:
   - ✅ **Maps JavaScript API**
   - ✅ **Places API**
   - ✅ **Directions API**
   - ✅ **Street View API** (optional)

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your new API key

5. **Restrict API Key** (Recommended)
   - Click on your API key to edit
   - Under "Application restrictions" select "HTTP referrers"
   - Add: `localhost:3000/*` (for development)
   - Under "API restrictions" select "Restrict key"
   - Select the 4 APIs you enabled above

### Step 2: Add to Your Project

1. **Create Environment File**
   Create a file named `.env.local` in your project root:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

2. **Replace the placeholder**
   Replace `your_actual_api_key_here` with your real API key

3. **Restart Development Server**
   ```bash
   npm start
   ```

### Step 3: Test Your Setup

1. **Start the app**: `npm start`
2. **Enter test addresses**:
   - Origin: "Times Square"
   - Destination: "Brooklyn Bridge"
3. **Click "Find Photo-Worthy Routes"**
4. **You should see**: Interactive map with routes and photo spots

## 🔧 Troubleshooting

### If you see "Demo Mode" message:
- Check that your `.env.local` file exists
- Verify your API key is correct
- Make sure you've enabled all required APIs
- Check browser console for errors

### If APIs are not working:
- Verify all 4 APIs are enabled in Google Cloud Console
- Check that your API key has the correct restrictions
- Ensure billing is enabled for your Google Cloud project

### Common Issues:
- **"Maps JavaScript API error"**: Enable Maps JavaScript API
- **"Places API error"**: Enable Places API
- **"Directions API error"**: Enable Directions API
- **"Billing not enabled"**: Enable billing in Google Cloud Console

## 💰 Cost Information

Google Maps APIs have a generous free tier:
- **Maps JavaScript API**: $200/month free
- **Places API**: $200/month free
- **Directions API**: $200/month free
- **Street View API**: $200/month free

For a hackathon project, you'll likely stay well within the free tier.

## 🎯 Next Steps

Once your API key is working:
1. The demo data will be replaced with real Google Maps data
2. You'll see actual photo spots along routes
3. Real-time route calculation will work
4. Interactive map with markers will be functional

---

**Need help?** Check the browser console for specific error messages!