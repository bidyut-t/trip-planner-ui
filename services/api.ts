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
   * 
   * USER PROFILE FEATURE: Accepts optional userId parameter for personalized planning
   * When userId is provided, backend uses that profile's preferences (dietary, fitness, travel style)
   * 
   * CONVERSATIONAL MEMORY FEATURE: Accepts optional previousPlan for modifications
   * When previousPlan is provided, backend uses AI to refine the existing plan
   * 
   * @param prompt - Natural language trip request or modification
   * @param userId - Optional user ID for personalization (e.g., "user-005" for Taylor)
   * @param previousPlan - Optional current plan for conversational refinement
   * @returns Personalized trip plan matching user preferences
   */
  async generateItinerary(prompt: string, userId?: string, previousPlan?: TripPlan): Promise<TripPlan> {
    // CONVERSATIONAL MEMORY FEATURE: Include previousPlan in request body for modifications
    const body = { 
      prompt, 
      ...(userId && { userId }),
      ...(previousPlan && { previousPlan })
    };
    
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
   * 
   * MAP LINK FEATURE: Handles mapLink field from backend, maps to mapUrl for frontend
   * Provides robust fallbacks for missing or incomplete data
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
          // MAP LINK FEATURE: Backend returns 'mapLink', frontend expects 'mapUrl'
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
              // FIX: Backend refinement returns flat structure (blocks), not nested (activities)
              // Check both act.rating and act.activity.rating
              rating: act.activity?.rating || act.rating || 0,
              reviews: act.activity?.reviews || act.reviews || 0,
              price: act.activity?.price || act.price || 0,
              currency: act.activity?.currency || act.currency || 'USD',
              priceLevel: act.activity?.priceLevel || act.priceLevel || 1,
              duration: act.activity?.duration || act.duration || '1 hour',
              description: act.activity?.description || act.notes || '',
              highlights: act.activity?.highlights || act.highlights || [],
              included: act.activity?.included || [],
              notIncluded: act.activity?.notIncluded || [],
              meetingPoint: act.activity?.meetingPoint || '',
              contact: act.activity?.contact || '',
              bookingUrl: act.activity?.bookingUrl || act.bookingUrl || '',
              images: act.activity?.images || act.images || [],
              verified: act.activity?.verified || false,
              popular: act.activity?.popular || false,
              openNow: act.activity?.openNow || true,
              availability: act.activity?.availability || act.availability || '',
              cancellationPolicy: act.activity?.cancellationPolicy || act.cancellationPolicy || '',
              earnPoints: act.activity?.earnPoints || act.earnPoints || 0,
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
   * 
   * USER PROFILE FEATURE: Fetches available user profiles from backend
   * Used to populate the profile selector dropdown in the UI
   * 
   * @returns Array of user profiles with preferences (dietary, fitness, travel style, etc.)
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
