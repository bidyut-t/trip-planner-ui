// Environment configuration
export const config = {
  // Backend API URL
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000',
  
  // App Environment
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  
  // Response Data Source (mock or api)
  responseData: process.env.NEXT_PUBLIC_RESPONSE_DATA || 'mock',
  
  // Check if we're in production
  isProduction: process.env.NEXT_PUBLIC_APP_ENV === 'production',
  
  // Check if we're in development
  isDevelopment: process.env.NEXT_PUBLIC_APP_ENV === 'development',
  
  // Check if using mock data
  useMockData: process.env.NEXT_PUBLIC_RESPONSE_DATA === 'mock',
  
  // Check if using API data
  useApiData: process.env.NEXT_PUBLIC_RESPONSE_DATA === 'api',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Trip Planning
  generateItinerary: `${config.apiBaseUrl}/api/itinerary/generate`,
  modifyItinerary: `${config.apiBaseUrl}/api/itinerary/modify`,
  
  // Activities
  getActivities: `${config.apiBaseUrl}/api/activities`,
  getActivityById: (id: string) => `${config.apiBaseUrl}/api/activities/${id}`,
  
  // Destinations
  getDestinations: `${config.apiBaseUrl}/api/destinations`,
  getDestinationById: (id: string) => `${config.apiBaseUrl}/api/destinations/${id}`,
  
  // Health check
  health: `${config.apiBaseUrl}/health`,
};

// Validate required environment variables
export function validateEnvVars() {
  const required = [
    'NEXT_PUBLIC_API_BASE_URL',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(', ')}. Using default values.`
    );
  }
}

// Run validation in development
if (config.isDevelopment) {
  validateEnvVars();
}
