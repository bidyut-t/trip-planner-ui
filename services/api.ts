import { TripPlan, UserProfile } from "@/types";
import { config } from "@/config/env";

/**
 * API Service for Trip Planning
 * 
 * Handles all communication with the backend trip planner API.
 * Responsible for:
 * - Generating new trip itineraries
 * - Fetching user profiles for personalization
 * - Transforming backend responses to frontend data models
 * - Health checks and error handling
 * 
 * Features:
 * - User profile personalization (userId parameter)
 * - Robust data transformation (handles schema variations)
 * - Fallback defaults for missing fields
 */

export interface GenerateItineraryRequest {
  prompt: string;
}

export interface GenerateItineraryResponse {
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  travelers: {
    adults: number;
    children: number;
  };
  plannerMode: string;
  days: any[];
}

export interface ModifyItineraryRequest {
  currentPlan: TripPlan;
  modification: string;
}

export class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  /**
   * Generate a new trip itinerary from a natural language prompt
   */
  async generateItinerary(prompt: string, userId?: string): Promise<TripPlan> {
    const body = userId ? { prompt, userId } : { prompt };
    
    const response = await fetch(`${this.baseUrl}/api/trips/plan/natural`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: GenerateItineraryResponse = await response.json();
    
    // Transform the backend response to match our TripPlan interface
    return this.transformApiResponse(data);
  }

  /**
   * Modify an existing trip itinerary
   */
  async modifyItinerary(
    currentPlan: TripPlan,
    modificationRequest: string
  ): Promise<{ plan: TripPlan; modifiedActivities: string[] }> {
    // For now, we'll handle modifications on the client side
    // Backend refinement endpoint integration is not yet complete
    throw new Error('Backend refinement not yet fully integrated - using client-side for now');
  }

  /**
   * Transform backend API response to our TripPlan interface
   */
  private transformApiResponse(data: any): TripPlan {
    // Handle new backend schema format (from both generation and refinement)
    return {
      destination: typeof data.destination === 'string' ? data.destination : data.destination?.name || 'Unknown',
      description: data.description || '',
      startDate: data.startDate,
      endDate: data.endDate,
      travelers: data.travelers || { adults: 1, children: 0 },
      days: (data.days || []).map((day: any) => {
        // Backend may return 'blocks' or 'activities' depending on schema version
        const dayActivities = day.activities || day.blocks || [];
        
        return {
          day: day.day,
          date: day.date,
          mapUrl: day.mapLink || day.mapUrl,
          activities: dayActivities.map((act: any) => ({
            timeBlock: act.timeBlock || `${act.start || ''} - ${act.end || ''}`,
            startTime: act.startTime || act.start || '',
            endTime: act.endTime || act.end || '',
            type: act.type,
            isPartner: act.isPartner || act.partner || false,
            activity: {
              id: act.activity?.id || act.id || `act-${Date.now()}`,
              name: act.activity?.name || act.title || 'Activity',
              provider: act.activity?.provider || act.provider || '',
              category: act.activity?.category || act.type,
              cuisineType: act.activity?.cuisineType,
              rating: act.activity?.rating || 0,
              reviews: act.activity?.reviews || 0,
              price: act.activity?.price || 0,
              currency: act.activity?.currency || 'USD',
              priceLevel: act.activity?.priceLevel || 1,
              duration: act.activity?.duration || '1 hour',
              description: act.activity?.description || act.notes || '',
              highlights: act.activity?.highlights || [],
              included: act.activity?.included || [],
              notIncluded: act.activity?.notIncluded || [],
              meetingPoint: act.activity?.meetingPoint || '',
              contact: act.activity?.contact || '',
              bookingUrl: act.activity?.bookingUrl || '',
              images: act.activity?.images || [],
              verified: act.activity?.verified || false,
              popular: act.activity?.popular || false,
              openNow: act.activity?.openNow || true,
              availability: act.activity?.availability || '',
              cancellationPolicy: act.activity?.cancellationPolicy || '',
              earnPoints: act.activity?.earnPoints || 0,
              amenities: act.activity?.amenities || [],
              reviewSnippet: act.activity?.reviewSnippet || '',
              distance: act.activity?.distance || '',
              walkingTime: act.activity?.walkingTime || '',
              latitude: act.activity?.latitude || act.latitude,
              longitude: act.activity?.longitude || act.longitude,
            },
          })),
        };
      }),
    };
  }

  /**
   * Health check to verify backend is running
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  /**
   * Get all user profiles for personalization
   */
  async getUserProfiles(): Promise<UserProfile[]> {
    const response = await fetch(`${this.baseUrl}/api/trips/profiles`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profiles');
    }

    return await response.json();
  }
}

// Export a singleton instance
export const apiService = new ApiService();
