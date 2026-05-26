# Frontend Changes - CodeFest Features

## Overview

This document outlines the frontend implementation of two CodeFest features that integrate with the backend trip planner:
1. **Google Maps Link Display** - Clickable map links for daily routes
2. **User Profile Selector** - UI for personalizing trip plans based on user preferences

---

## Feature 1: Google Maps Link Display

### What It Does
Displays clickable "View Map" links in the itinerary that open Google Maps with pre-loaded routes for each day's activities.

### Implementation

**Files Changed:**
- `services/api.ts` - Updated `transformApiResponse()` to map `mapLink` field
- `components/MessageBubble.tsx` - Displays map links in trip plan UI (no changes needed, already supported)

**How It Works:**

1. **Backend Integration**: Backend returns `mapLink` field in day objects
2. **Data Transformation**: API service maps backend field to frontend interface
   ```typescript
   // Backend response has: day.mapLink
   // Frontend expects: day.mapUrl
   
   private transformApiResponse(data: any): TripPlan {
     return {
       days: (data.days || []).map((day: any) => ({
         day: day.day,
         date: day.date,
         mapUrl: day.mapLink || day.mapUrl,  // Map backend field to frontend
         activities: [...]
       }))
     };
   }
   ```

3. **UI Display**: MessageBubble component automatically renders map links
   - Shows as blue "View Map" link with map icon
   - Opens in new tab when clicked
   - Only appears if `mapUrl` is present in the day data

**Code Changes:**

**services/api.ts:**
```typescript
private transformApiResponse(data: any): TripPlan {
  return {
    destination: typeof data.destination === 'string' ? data.destination : data.destination?.name || 'Unknown',
    description: data.description || '',
    startDate: data.startDate,
    endDate: data.endDate,
    travelers: data.travelers || { adults: 1, children: 0 },
    days: (data.days || []).map((day: any) => {
      const dayActivities = day.activities || day.blocks || [];
      return {
        day: day.day,
        date: day.date,
        mapUrl: day.mapLink || day.mapUrl,  // ← KEY CHANGE: Map backend field
        activities: dayActivities.map((act: any) => ({
          // Activity transformation...
        }))
      };
    })
  };
}
```

**User Flow:**
1. User requests trip with maps: "Plan a 1-day NYC trip with map links"
2. Backend generates route and returns `mapLink` in response
3. Frontend transforms `mapLink` → `mapUrl`
4. UI displays "View Map" link under each day
5. Click opens Google Maps with full day's route

### Testing
1. Start backend: `npm start` in trip-planner-server
2. Start frontend: `npm run dev` in trip-planner-ui
3. Request: "Plan a 1-day NYC trip with map links"
4. Verify: Blue "View Map" link appears under Day 1
5. Click link: Opens Google Maps with route through all activities

---

## Feature 2: User Profile Selector

### What It Does
Provides a dropdown UI in the chat header for users to select travel profiles (dietary restrictions, budget, travel style, fitness level), enabling personalized trip recommendations.

### Implementation

**New Files Created:**
- `components/UserProfileSelector.tsx` - Profile dropdown component

**Files Modified:**
- `types/index.ts` - Added `UserProfile` interface
- `services/api.ts` - Added `getUserProfiles()` method and `userId` parameter
- `components/ChatInterface.tsx` - Integrated profile selector and state management

**Component Architecture:**

```
ChatInterface
  └─ Header
      └─ UserProfileSelector ← NEW COMPONENT
          └─ Dropdown with 5 profiles + "None (Generic)"
```

### UserProfile Interface

**types/index.ts:**
```typescript
/**
 * User Profile Interface
 * 
 * Represents a traveler's preferences and constraints for personalized trip planning.
 * Used to customize AI-generated itineraries based on dietary restrictions, accessibility
 * needs, budget constraints, travel style, and fitness level.
 */
export interface UserProfile {
  id: string;                           // e.g., "user-002"
  name: string;                         // e.g., "Goose"
  bonvoyMemberNumber: string;
  dietaryRestrictions: string[];        // e.g., ["vegan", "gluten-free"]
  accessibilityNeeds: string[];         // e.g., ["wheelchair", "hearing aid"]
  budgetLevel: "budget" | "moderate" | "luxury";
  travelStyle: "adventure" | "relaxation" | "cultural" | "foodie" | "mixed";
  preferences: {
    avoidCrowds: boolean;
    preferLocalExperiences: boolean;
    fitnessLevel: "low" | "moderate" | "high";
  };
}
```

### API Service Updates

**services/api.ts - New Methods:**

```typescript
/**
 * Generate a new trip itinerary from a natural language prompt
 */
async generateItinerary(prompt: string, userId?: string): Promise<TripPlan> {
  const body = userId ? { prompt, userId } : { prompt };
  
  const response = await fetch(`${this.baseUrl}/api/trips/plan/natural`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  // ... rest of method
}

/**
 * Get all user profiles for personalization
 */
async getUserProfiles(): Promise<UserProfile[]> {
  const response = await fetch(`${this.baseUrl}/api/trips/profiles`);
  if (!response.ok) throw new Error('Failed to fetch user profiles');
  return await response.json();
}
```

**Key Change:**
- `generateItinerary()` now accepts optional `userId` parameter
- Automatically includes in request body if provided
- Backend uses this to personalize the entire trip

### UserProfileSelector Component

**components/UserProfileSelector.tsx:**

```typescript
/**
 * User Profile Selector Component
 * 
 * Dropdown UI for selecting user travel profiles to personalize trip planning.
 * Fetches available profiles from the backend and displays them with key preferences.
 * 
 * Features:
 * - Glassmorphic design matching Marriott brand
 * - Profile summary preview (diet, budget)
 * - "None (Generic)" option for non-personalized planning
 * - Visual checkmark for selected profile
 */

export default function UserProfileSelector({ selectedUserId, onProfileChange }: Props) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await apiService.getUserProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Renders dropdown with profile list
  // Shows: "Travel as: [Maverick]" with dropdown icon
  // Displays profile summary (diet, budget) for each option
}
```

**UI Design:**
- **Button**: "Travel as: Generic" (default) or "Travel as: Maverick" (selected)
- **Dropdown**: Glassmorphic panel with profile list
- **Profile Item**: Name + summary (e.g., "High-protein, Luxury")
- **Checkmark**: Green checkmark next to selected profile
- **None Option**: "None (Generic)" at bottom for non-personalized planning

### ChatInterface Integration

**components/ChatInterface.tsx - State Management:**

```typescript
export default function ChatInterface({ onChatStart }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([...]);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();  // ← NEW STATE
  // ... other state

  // Generate trip with selected user profile
  const handleSend = async (userInput: string) => {
    // ...
    if (config.useApiData) {
      // Pass userId to API for personalization
      tripPlan = await apiService.generateItinerary(userInput, selectedUserId);  // ← PASS USERID
    } else {
      tripPlan = generateTripPlan(userInput);
    }
    // ...
  };
}
```

**Chat Header Layout:**

```tsx
<div className="p-6 border-b border-white/10 flex items-center gap-4">
  <div className="w-12 h-12 bg-gradient-to-br from-marriott-red ...">
    🤖
  </div>
  <div className="flex-1">
    <h3>Welcome to Marriott NextGen Navigators</h3>
    <p>We are here to help planning your trip</p>
  </div>
  
  {/* ← NEW: Profile Selector */}
  <UserProfileSelector 
    selectedUserId={selectedUserId}
    onProfileChange={setSelectedUserId}
  />
  
  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
</div>
```

### User Flow

1. **Initial State**: User sees "Travel as: Generic" dropdown in chat header
2. **Profile Selection**: 
   - User clicks dropdown
   - Sees 5 profiles (Maverick, Goose, Emily, Sarah, Taylor) + "None"
   - Each shows summary: "High-protein, Luxury" or "Vegan, Budget"
3. **Select Profile**: User clicks "Goose" (foodie, moderate)
4. **Visual Feedback**: Checkmark appears next to Goose, button shows "Travel as: Goose"
5. **Request Trip**: User types "Plan a 1-day NYC trip focused on food"
6. **Backend Personalization**: 
   - Frontend sends: `{ prompt: "...", userId: "user-002" }`
   - Backend loads Goose's profile (foodie, moderate budget, high fitness)
   - AI generates foodie-focused itinerary with moderate-priced activities
7. **Display Results**: Trip shows food tours, local restaurants, culinary experiences

### Profile-Specific Results

**Example: Goose (Foodie, Moderate Budget)**
```
Description: "An immersive, foodie-focused adventure..."
Activities:
- Chinatown & Little Italy Food Tour ($85)
- Joe's Pizza - Greenwich Village ($15)
- Russ & Daughters - bagels and lox ($25)
- Asiate - upscale dining ($120)
Total: ~$245, All food-related experiences
```

**Example: Sarah (Vegan, Budget) - Same Prompt**
```
Description: "A vegan-friendly, budget-conscious exploration..."
Activities:
- Vegan cafe breakfast ($15)
- Free walking tour in Central Park ($0)
- Plant-based lunch spot ($20)
- Affordable vegan dinner ($25)
Total: ~$60, All vegan options
```

### Available Profiles

The frontend fetches these 5 profiles from the backend:

1. **Maverick** (user-001)
   - High-protein, no sugar
   - Luxury budget
   - Adventure style
   - High fitness

2. **Goose** (user-002)
   - No restrictions
   - Moderate budget
   - Foodie style
   - High fitness

3. **Emily** (user-003)
   - Pescatarian
   - Moderate budget
   - Cultural style
   - Moderate fitness

4. **Sarah** (user-004)
   - Vegan
   - Budget conscious
   - Relaxation style
   - Low fitness

5. **Taylor** (user-005)
   - Gluten-free
   - Hearing aid (accessibility)
   - Moderate budget
   - Cultural style
   - Low fitness

### Styling

**Design System:**
- **Glassmorphism**: Semi-transparent glass effect with blur
- **Marriott Colors**: Red (#DC143C), light red, coral
- **Typography**: White text on dark glass backgrounds
- **Animations**: Smooth transitions, hover effects
- **Accessibility**: Proper contrast, keyboard navigation

**CSS Classes Used:**
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(15px);
}

.bg-marriott-red {
  background-color: #DC143C;
}
```

---

## Data Transformation Robustness

### Challenge
Backend API responses can vary in structure:
- Initial plans: `day.activities[]`
- Some responses: `day.blocks[]`
- Field names: `mapLink` vs `mapUrl`
- Missing data: prices, images, ratings might be absent

### Solution
The `transformApiResponse()` function handles all variations:

```typescript
private transformApiResponse(data: any): TripPlan {
  return {
    destination: typeof data.destination === 'string' 
      ? data.destination 
      : data.destination?.name || 'Unknown',
    
    description: data.description || '',
    startDate: data.startDate,
    endDate: data.endDate,
    travelers: data.travelers || { adults: 1, children: 0 },
    
    days: (data.days || []).map((day: any) => {
      const dayActivities = day.activities || day.blocks || [];  // Handle both formats
      
      return {
        day: day.day,
        date: day.date,
        mapUrl: day.mapLink || day.mapUrl,  // Handle field name variations
        
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
            
            // Provide defaults for potentially missing fields
            rating: act.activity?.rating || 0,
            reviews: act.activity?.reviews || 0,
            price: act.activity?.price || 0,  // Fallback to $0 if missing
            currency: act.activity?.currency || 'USD',
            priceLevel: act.activity?.priceLevel || 1,
            
            images: act.activity?.images || [],  // Empty array if missing
            earnPoints: act.activity?.earnPoints || 0,
            
            // ... all other fields with fallbacks
          }
        }))
      };
    })
  };
}
```

**Benefits:**
- Prevents UI crashes from missing fields
- Handles backend schema changes gracefully
- Works with both `activities` and `blocks` formats
- Provides sensible defaults ($0, empty images, etc.)

---

## Environment Configuration

**Required Environment Variables:**

`.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
NEXT_PUBLIC_RESPONSE_DATA=api
```

**Configuration Flags:**

`config/env.ts`:
```typescript
export const config = {
  useApiData: process.env.NEXT_PUBLIC_RESPONSE_DATA === 'api',  // Use backend vs mock
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081',
};
```

---

## Testing the Features

### 1. Google Maps Links
1. Start backend and frontend
2. In chat, type: "Plan a 1-day NYC trip with map links"
3. Wait for response
4. Verify: Blue "View Map" link appears under Day 1
5. Click link: Should open Google Maps with route

### 2. User Profile Selector
1. Start backend and frontend
2. Look at chat header: "Travel as: Generic" dropdown
3. Click dropdown: Should see 5 profiles + None option
4. Select "Goose": Button changes to "Travel as: Goose"
5. Type: "Plan a 1-day NYC food tour"
6. Verify: Results are foodie-focused (food tours, restaurants, culinary experiences)
7. Change to "Sarah": Select Sarah from dropdown
8. Type same prompt
9. Verify: Results are vegan and budget-friendly (different from Goose)

### Browser Console Verification
Open browser console (F12) to verify:
- No errors during profile loading
- API calls include userId parameter
- Responses properly transformed

---

## Known Limitations

### Conversational Refinement
**Not Integrated on Frontend**

The backend supports conversational refinement, but the frontend currently uses a client-side rule-based system (`utils/modificationEngine.ts`) instead of the backend API.

**Why:**
- Backend refinement returns incomplete activity data
- Missing prices, images, Bonvoy points in refined plans
- Data quality issues led to revert of frontend integration

**Current Behavior:**
When user modifies a plan:
- Frontend uses local modification logic
- Simple operations: remove activity, change time, add note
- No AI-powered intelligent refinement
- No backend API call for modifications

**To Integrate Backend Refinement:**
Would need to:
1. Call `/api/trips/plan/natural` with `previousPlan` parameter
2. Handle incomplete data responses gracefully
3. OR wait for backend to improve data preservation

### Image Fallbacks
- Missing activity images show placeholder
- Gracefully handled by `ItineraryCard.tsx` component
- No UI crashes from missing image URLs

---

## Component Dependencies

```
app/
├── page.tsx (renders ChatInterface)
└── layout.tsx (global layout)

components/
├── ChatInterface.tsx (main chat UI)
│   └── UserProfileSelector.tsx (profile dropdown) ← NEW
├── MessageBubble.tsx (displays messages & trip plans)
└── ItineraryCard.tsx (displays individual activities)

services/
└── api.ts (backend API integration) ← MODIFIED

types/
└── index.ts (TypeScript interfaces) ← MODIFIED

utils/
├── tripPlanner.ts (mock trip generation)
└── modificationEngine.ts (client-side modifications)
```

---

## Integration with Backend

### API Calls

**1. Fetch Profiles (on component mount):**
```typescript
GET http://localhost:8081/api/trips/profiles
Response: UserProfile[]
```

**2. Generate Trip (with profile):**
```typescript
POST http://localhost:8081/api/trips/plan/natural
Body: {
  "prompt": "Plan a 1-day NYC food tour",
  "userId": "user-002"  // Goose
}
Response: TripPlan with personalized activities
```

**3. Generate Trip (without profile):**
```typescript
POST http://localhost:8081/api/trips/plan/natural
Body: {
  "prompt": "Plan a 1-day NYC food tour"
  // No userId = generic planning
}
Response: TripPlan with generic recommendations
```

### Data Flow
```
User Action (Select Profile)
  → Component State (setSelectedUserId)
  → User Request (Type prompt)
  → API Call (generateItinerary with userId)
  → Backend (Loads profile, injects into AI prompt)
  → AI Generation (Personalized based on profile)
  → API Response (Full trip plan)
  → Frontend Transform (transformApiResponse)
  → UI Display (MessageBubble renders plan)
```

---

## Summary

### What's Implemented
- Google Maps link display (clickable View Map buttons)
- User profile selector dropdown (5 profiles + generic)
- Profile state management in ChatInterface
- API service updated with userId parameter
- Robust data transformation (handles schema variations)
- Professional styling (glassmorphism, Marriott brand)

### What's Working End-to-End
- Users can select profiles and see personalized trip plans
- Map links display and open Google Maps correctly
- Different profiles generate different trip recommendations
- Backend personalization fully reflected in frontend UI

### What's Not Integrated
- Conversational refinement (backend ready, frontend uses client-side alternative)

### User Experience
- Smooth, intuitive profile selection
- Clear visual feedback (checkmarks, button text changes)
- Immediate personalization on next request
- Beautiful Marriott-branded UI
- Graceful handling of missing data
- No crashes or errors from incomplete responses
