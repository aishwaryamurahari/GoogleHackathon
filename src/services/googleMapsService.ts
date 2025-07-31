import { Loader } from '@googlemaps/js-api-loader';

class GoogleMapsService {
  private static instance: GoogleMapsService;
  private loader: Loader | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  async initialize(apiKey: string): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInitialize(apiKey);
    return this.initPromise;
  }

  private async doInitialize(apiKey: string): Promise<void> {
    try {
      this.loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry', 'streetView'] // Include all required libraries
      });

      await this.loader.load();
      this.isInitialized = true;
      console.log('Google Maps API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Maps API:', error);
      this.initPromise = null;
      throw error;
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getLoader(): Loader | null {
    return this.loader;
  }
}

export default GoogleMapsService;