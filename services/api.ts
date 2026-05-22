import { TripPlan } from "@/types";
import { config } from "@/config/env";

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
  async generateItinerary(prompt: string): Promise<TripPlan> {
    const response = await fetch(`${this.baseUrl}/api/trips/plan/natural`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
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
    // You can implement a backend endpoint for this later
    throw new Error('Modify itinerary endpoint not yet implemented on backend');
  }

  /**
   * Transform backend API response to our TripPlan interface
   */
  private transformApiResponse(data: GenerateItineraryResponse): TripPlan {
    return {
      destination: data.destination,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      travelers: {
        adults: data.travelers.adults,
        children: data.travelers.children,
      },
      days: data.days.map(day => ({
        day: day.day,
        date: day.date,
        activities: day.activities.map((act: any) => ({
          timeBlock: act.timeBlock,
          startTime: act.startTime,
          endTime: act.endTime,
          type: act.type,
          isPartner: act.isPartner,
          activity: {
            id: act.activity.id,
            name: act.activity.name,
            provider: act.activity.provider,
            category: act.activity.category,
            cuisineType: act.activity.cuisineType,
            rating: act.activity.rating,
            reviews: act.activity.reviews,
            price: act.activity.price,
            currency: act.activity.currency,
            priceLevel: act.activity.priceLevel,
            duration: act.activity.duration,
            description: act.activity.description,
            highlights: act.activity.highlights,
            included: act.activity.included,
            notIncluded: act.activity.notIncluded,
            meetingPoint: act.activity.meetingPoint,
            contact: act.activity.contact,
            bookingUrl: act.activity.bookingUrl,
            images: act.activity.images,
            verified: act.activity.verified,
            popular: act.activity.popular,
            openNow: act.activity.openNow,
            availability: act.activity.availability,
            cancellationPolicy: act.activity.cancellationPolicy,
            earnPoints: act.activity.earnPoints,
            amenities: act.activity.amenities,
            reviewSnippet: act.activity.reviewSnippet,
            distance: act.activity.distance,
            walkingTime: act.activity.walkingTime,
          },
        })),
      })),
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
}

// Export a singleton instance
export const apiService = new ApiService();
