import GoogleMapsService from '../services/googleMapsService.ts';

export const testGoogleMapsInitialization = async (apiKey: string): Promise<boolean> => {
  try {
    console.log('Testing Google Maps initialization...');

    const mapsService = GoogleMapsService.getInstance();
    await mapsService.initialize(apiKey);

    console.log('✅ Google Maps initialized successfully');
    console.log('✅ Service is ready:', mapsService.isReady());

    return true;
  } catch (error) {
    console.error('❌ Google Maps initialization failed:', error);
    return false;
  }
};

export const testMultipleInitializations = async (apiKey: string): Promise<boolean> => {
  try {
    console.log('Testing multiple initializations...');

    const mapsService1 = GoogleMapsService.getInstance();
    const mapsService2 = GoogleMapsService.getInstance();

    // Both should be the same instance
    if (mapsService1 !== mapsService2) {
      throw new Error('Singleton pattern failed');
    }

    await mapsService1.initialize(apiKey);
    await mapsService2.initialize(apiKey); // Should not cause conflicts

    console.log('✅ Multiple initializations work correctly');
    return true;
  } catch (error) {
    console.error('❌ Multiple initializations failed:', error);
    return false;
  }
};