export interface Activity {
  id: string;
  name: string;
  provider: string;
  category: string;
  cuisineType?: string | null;
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  priceLevel: number;
  duration: string;
  description: string;
  highlights: string[];
  included: string[];
  notIncluded: string[];
  meetingPoint: string;
  contact: string;
  bookingUrl: string;
  images: string[];
  verified: boolean;
  popular: boolean;
  openNow: boolean;
  availability: string;
  cancellationPolicy: string;
  earnPoints: number;
  amenities: string[];
  reviewSnippet: string;
  distance: string;
  walkingTime: string;
  latitude?: number;  // Coordinates for map
  longitude?: number; // Coordinates for map
}

export interface HotelRecommendation {
  id: string;
  name: string;
  address: string;
  description: string;
  tags: string[];
  isPartnerHotel: boolean;
  matchedUserPreferences: string[];
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  bonvoyPoints?: number;
  distanceFromActivities: string;
  images: string[];
  amenities: string[];
  latitude?: number;
  longitude?: number;
  bookingUrl?: string;
}

export interface ItineraryActivity {
  timeBlock: string;
  startTime: string;
  endTime: string;
  activity: Activity;
  type: 'restaurant' | 'transit' | 'scenic' | 'activity' | 'museum' | 'attraction';
  isPartner: boolean;
}

export interface DayPlan {
  day: number;
  date: string;
  activities: ItineraryActivity[];
  mapUrl?: string; // Daily map route link
}

export interface TripPlan {
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  travelers: {
    adults: number;
    children: number;
  };
  days: DayPlan[];
  accommodation?: {
    bookedHotel?: HotelRecommendation;
    suggestions?: HotelRecommendation[];
  };
  summary?: {
    estimatedBudget?: {
      min: number;
      max: number;
      currency: string;
    };
    packingTips?: string[];
    travelTips?: string[];
    weatherInfo?: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tripPlan?: TripPlan;
  timestamp: Date;
  isModification?: boolean;
  modifiedActivities?: string[]; // IDs of modified/new activities
}

export interface TripPlanContext {
  originalPrompt: string;
  currentPlan?: TripPlan;
  modifications: string[];
  planHistory?: {           // Track full conversation history
    prompt: string;
    plan: TripPlan;
    timestamp: Date;
  }[];
}

/**
 * User Profile Interface
 * 
 * Represents a traveler's preferences and constraints for personalized trip planning.
 * Used to customize AI-generated itineraries based on dietary restrictions, accessibility
 * needs, budget constraints, travel style, and fitness level.
 * 
 * Example profiles: Maverick (high-protein, luxury), Sarah (vegan, budget)
 */
export interface UserProfile {
  id: string;
  name: string;
  bonvoyMemberNumber: string;
  dietaryRestrictions: string[];  // e.g., ["vegan", "gluten-free"]
  accessibilityNeeds: string[];   // e.g., ["wheelchair", "hearing aid"]
  budgetLevel: "budget" | "moderate" | "luxury";
  travelStyle: "adventure" | "relaxation" | "cultural" | "foodie" | "mixed";
  preferences: {
    avoidCrowds: boolean;
    preferLocalExperiences: boolean;
    fitnessLevel: "low" | "moderate" | "high";
  };
  hotelBookings?: {
    hotelId: string;
    hotelName: string;
    destination: string;
    checkInDate: string;
    checkOutDate: string;
    confirmationNumber: string;
    roomType: string;
  }[];
}
