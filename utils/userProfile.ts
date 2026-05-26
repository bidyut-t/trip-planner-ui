// User profile with preferences
export interface UserProfile {
  name: string;
  defaultTravelers: {
    adults: number;
    children: number;
  };
  preferences: {
    interests: string[]; // museums, food, shopping, nightlife, outdoor, cultural
    pace: 'relaxed' | 'moderate' | 'packed';
    wakeUpTime: string; // "9:00 AM"
    budget: 'budget' | 'moderate' | 'luxury';
    dietaryRestrictions?: string[];
  };
  bonvoyTier?: 'member' | 'silver' | 'gold' | 'platinum' | 'titanium';
}

// Mock user profile
export const mockUserProfile: UserProfile = {
  name: "Guest User",
  defaultTravelers: {
    adults: 1,
    children: 0,
  },
  preferences: {
    interests: ['museums', 'food', 'cultural'],
    pace: 'moderate',
    wakeUpTime: '9:00 AM',
    budget: 'moderate',
  },
  bonvoyTier: 'titanium',
};

// Parse vague prompts and extract information
export function parseUserPrompt(prompt: string): {
  destination?: string;
  dates?: { start: string; end: string };
  travelers?: { adults: number; children: number };
  interests?: string[];
  specialRequests?: string[];
} {
  const result: any = {};
  const lowerPrompt = prompt.toLowerCase();

  // Extract destination
  const cityPatterns = [
    /(?:visit|go to|trip to|traveling to|explore)\s+([a-z\s]+?)(?:\s+next|\s+in|\s+for|$)/i,
    /(?:\d+-day\s+)?([a-z\s]+?)\s+trip/i, // Skip "3-day" prefix
  ];

  for (const pattern of cityPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      result.destination = match[1].trim();
      break;
    }
  }

  // Extract time references
  if (lowerPrompt.includes('next week')) {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const endDate = new Date(nextWeek);
    endDate.setDate(nextWeek.getDate() + 2); // 3-day default
    
    result.dates = {
      start: nextWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      end: endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
  }

  // Extract travelers
  const adultMatch = prompt.match(/(\d+)\s+adult/i);
  const childMatch = prompt.match(/(\d+)\s+(?:child|kid)/i);
  
  if (adultMatch || childMatch) {
    result.travelers = {
      adults: adultMatch ? parseInt(adultMatch[1]) : 1,
      children: childMatch ? parseInt(childMatch[1]) : 0,
    };
  }

  // Extract interests from keywords
  const interestKeywords = {
    museums: ['museum', 'art', 'gallery', 'exhibition'],
    food: ['food', 'restaurant', 'dining', 'cuisine', 'eat'],
    shopping: ['shop', 'shopping', 'mall', 'boutique'],
    nightlife: ['nightlife', 'bar', 'club', 'evening'],
    outdoor: ['outdoor', 'park', 'nature', 'hiking'],
    cultural: ['cultural', 'history', 'heritage', 'local'],
  };

  const detectedInterests: string[] = [];
  for (const [interest, keywords] of Object.entries(interestKeywords)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      detectedInterests.push(interest);
    }
  }

  if (detectedInterests.length > 0) {
    result.interests = detectedInterests;
  }

  return result;
}

// Parse modification requests
export function parseModificationRequest(request: string): {
  action: 'add' | 'remove' | 'replace' | 'adjust';
  target?: string;
  constraint?: string;
  details?: any;
  day?: number;  // Add day property for day-specific modifications
  timeOfDay?: string;  // Add timeOfDay property for time-specific modifications
} {
  const lowerRequest = request.toLowerCase();
  const result: any = {};

  // Detect action type
  if (lowerRequest.includes('add') || lowerRequest.includes('include')) {
    result.action = 'add';
  } else if (lowerRequest.includes('remove') || lowerRequest.includes('skip') || lowerRequest.includes('don\'t want')) {
    result.action = 'remove';
  } else if (lowerRequest.includes('replace') || lowerRequest.includes('change') || lowerRequest.includes('swap')) {
    result.action = 'replace';
  } else {
    result.action = 'adjust';
  }

  // Extract constraints
  if (lowerRequest.includes('before 10') || lowerRequest.includes('after 10')) {
    result.constraint = 'wakeUpTime';
    result.details = { wakeUpTime: '10:00 AM' };
  }

  if (lowerRequest.includes('wake up before 10')) {
    result.constraint = 'noEarlyMorning';
    result.details = { earliestStart: '10:00 AM' };
  }

  // Extract target
  if (lowerRequest.includes('food') || lowerRequest.includes('restaurant') || lowerRequest.includes('street food')) {
    result.target = 'food';
  } else if (lowerRequest.includes('shopping')) {
    result.target = 'shopping';
  } else if (lowerRequest.includes('museum')) {
    result.target = 'museum';
  } else if (lowerRequest.includes('game') || lowerRequest.includes('activity')) {
    result.target = 'activity';
  }

  // Extract day/time references
  const dayMatch = request.match(/day\s+(\d+)/i);
  if (dayMatch) {
    result.day = parseInt(dayMatch[1]);
  }

  const timeMatch = request.match(/(morning|afternoon|evening|night)/i);
  if (timeMatch) {
    result.timeOfDay = timeMatch[1].toLowerCase();
  }

  return result;
}
