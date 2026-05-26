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
}
