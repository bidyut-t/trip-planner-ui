import { TripPlan, DayPlan, ItineraryActivity, Activity, UserProfile, HotelRecommendation } from "@/types";
import { parseUserPrompt, mockUserProfile } from "./userProfile";
import nycActivitiesData from "@/data/marriott-nyc-activities-mock.json";

// IMPORTANT: Always use data directly from mock JSON without modification
// All activity names, place titles, and descriptions come from the mock data
const activities: Activity[] = nycActivitiesData.destinations.new_york.activities;
const destinationInfo = nycActivitiesData.destinations.new_york;

const categorizeActivity = (activity: Activity): ItineraryActivity["type"] => {
  if (activity.category === "restaurant" || activity.cuisineType) return "restaurant";
  if (activity.category === "attraction") return "attraction";
  if (activity.name.toLowerCase().includes("museum")) return "museum";
  if (activity.name.toLowerCase().includes("transit") || activity.name.toLowerCase().includes("ferry")) return "transit";
  if (activity.name.toLowerCase().includes("park") || activity.name.toLowerCase().includes("walk")) return "scenic";
  return "activity";
};

const isPartnerActivity = (activity: Activity): boolean => {
  return activity.provider === "Marriott Bonvoy Tours & Activities";
};

/**
 * Check if user has an existing hotel booking for the given dates and destination
 */
function findExistingBooking(
  userProfile: UserProfile | null,
  destination: string,
  startDate: string,
  endDate: string
): HotelRecommendation | null {
  if (!userProfile?.hotelBookings || userProfile.hotelBookings.length === 0) {
    return null;
  }

  // Normalize destination for matching (remove "City", case insensitive)
  const normalizeDestination = (dest: string) => 
    dest.toLowerCase().replace(/\s+city$/i, '').trim();

  const normalizedTripDest = normalizeDestination(destination);

  // Find booking that matches destination and overlaps with trip dates
  const booking = userProfile.hotelBookings.find(b => {
    const normalizedBookingDest = normalizeDestination(b.destination);
    const matches = normalizedTripDest.includes(normalizedBookingDest) || 
                   normalizedBookingDest.includes(normalizedTripDest);
    return matches;
  });

  if (!booking) {
    return null;
  }

  // Return the booked hotel as a HotelRecommendation
  return {
    id: booking.hotelId,
    name: booking.hotelName,
    address: "160 Central Park South, New York, NY 10019",
    description: "Luxury property perfectly positioned across from Central Park with easy access to museums, fine dining, and world-class amenities.",
    tags: ["Luxury", "Central Park Views", "Spa", "Fine Dining", "Concierge Service"],
    isPartnerHotel: true,
    matchedUserPreferences: [
      `Booked dates: ${booking.checkInDate} - ${booking.checkOutDate}`,
      `Room type: ${booking.roomType}`,
      `Confirmation: ${booking.confirmationNumber}`,
    ],
    rating: 4.8,
    reviewCount: 2340,
    pricePerNight: 450,
    currency: "$",
    bonvoyPoints: 60000,
    distanceFromActivities: "0.4 mi avg from your planned activities",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"],
    amenities: ["Spa", "Restaurant", "Fitness Center", "Concierge"],
    bookingUrl: "https://www.marriott.com/reservation/confirmation",
  };
}

export function generateTripPlan(userPrompt: string, userProfile?: UserProfile | null): TripPlan {
  // Parse the user prompt
  const parsedPrompt = parseUserPrompt(userPrompt);
  
  // Use parsed data or fall back to user profile defaults and mock data
  const destination = parsedPrompt.destination || destinationInfo.city; // Use "New York City" from mock data
  const travelers = parsedPrompt.travelers || mockUserProfile.defaultTravelers;
  const interests = parsedPrompt.interests || mockUserProfile.preferences.interests;
  
  // Generate dates
  let startDate = "July 1";
  let endDate = "July 3";
  
  if (parsedPrompt.dates) {
    startDate = parsedPrompt.dates.start;
    endDate = parsedPrompt.dates.end;
  }

  const description =
    `Experience the vibrant energy of ${destinationInfo.city}, where world-class museums meet diverse culinary adventures. From iconic landmarks to hidden local gems, your personalized itinerary combines culture, cuisine, and unforgettable experiences.`;

  const days: DayPlan[] = [
    {
      day: 1,
      date: "July 1, 2026",
      mapUrl: "https://www.google.com/maps/dir/?api=1&waypoints=40.7259,-73.9965|40.7484,-73.9857|40.7829,-73.9654|40.7614,-73.9776&travelmode=walking",
      activities: [
        {
          timeBlock: "9:00 AM - 10:30 AM",
          startTime: "9:00 AM",
          endTime: "10:30 AM",
          activity: activities.find((a) => a.id === "nyc-breakfast-jacks-wife-freda")!,
          type: "restaurant",
          isPartner: isPartnerActivity(activities.find((a) => a.id === "nyc-breakfast-jacks-wife-freda")!),
        },
        {
          timeBlock: "11:00 AM - 3:00 PM",
          startTime: "11:00 AM",
          endTime: "3:00 PM",
          activity: activities.find((a) => a.id === "nyc-empire-state-top-rock")!,
          type: "attraction",
          isPartner: true,
        },
        {
          timeBlock: "3:30 PM - 5:00 PM",
          startTime: "3:30 PM",
          endTime: "5:00 PM",
          activity: activities.find((a) => a.id === "nyc-central-park-bike")!,
          type: "scenic",
          isPartner: true,
        },
        {
          timeBlock: "6:30 PM - 8:30 PM",
          startTime: "6:30 PM",
          endTime: "8:30 PM",
          activity: activities.find((a) => a.id === "nyc-dinner-le-bernardin")!,
          type: "restaurant",
          isPartner: isPartnerActivity(activities.find((a) => a.id === "nyc-dinner-le-bernardin")!),
        },
      ],
    },
    {
      day: 2,
      date: "July 2, 2026",
      mapUrl: "https://www.google.com/maps/dir/?api=1&waypoints=40.7223,-73.9987|40.7794,-73.9632|40.7223,-73.9873|40.7061,-73.9969|40.7388,-73.9877&travelmode=walking",
      activities: [
        {
          timeBlock: "9:00 AM - 10:00 AM",
          startTime: "9:00 AM",
          endTime: "10:00 AM",
          activity: activities.find((a) => a.id === "nyc-breakfast-balthazar")!,
          type: "restaurant",
          isPartner: isPartnerActivity(activities.find((a) => a.id === "nyc-breakfast-balthazar")!),
        },
        {
          timeBlock: "10:30 AM - 1:30 PM",
          startTime: "10:30 AM",
          endTime: "1:30 PM",
          activity: activities.find((a) => a.id === "nyc-met-museum-tour")!,
          type: "museum",
          isPartner: true,
        },
        {
          timeBlock: "2:00 PM - 3:30 PM",
          startTime: "2:00 PM",
          endTime: "3:30 PM",
          activity: activities.find((a) => a.id === "nyc-lunch-katzs")!,
          type: "restaurant",
          isPartner: isPartnerActivity(activities.find((a) => a.id === "nyc-lunch-katzs")!),
        },
        {
          timeBlock: "4:00 PM - 6:00 PM",
          startTime: "4:00 PM",
          endTime: "6:00 PM",
          activity: activities.find((a) => a.id === "nyc-brooklyn-bridge-walk")!,
          type: "scenic",
          isPartner: true,
        },
        {
          timeBlock: "7:00 PM - 9:00 PM",
          startTime: "7:00 PM",
          endTime: "9:00 PM",
          activity: activities.find((a) => a.id === "nyc-dinner-gramercy-tavern")!,
          type: "restaurant",
          isPartner: isPartnerActivity(activities.find((a) => a.id === "nyc-dinner-gramercy-tavern")!),
        },
      ],
    },
    {
      day: 3,
      date: "July 3, 2026",
      mapUrl: "https://www.google.com/maps/dir/?api=1&waypoints=40.7215,-73.9842|40.7614,-73.9776|40.7480,-74.0048|40.7425,-73.9870&travelmode=walking",
      activities: [
        {
          timeBlock: "9:00 AM - 10:30 AM",
          startTime: "9:00 AM",
          endTime: "10:30 AM",
          activity: activities.find((a) => a.id === "nyc-brunch-clinton-street")!,
          type: "restaurant",
          isPartner: isPartnerActivity(activities.find((a) => a.id === "nyc-brunch-clinton-street")!),
        },
        {
          timeBlock: "11:00 AM - 2:00 PM",
          startTime: "11:00 AM",
          endTime: "2:00 PM",
          activity: activities.find((a) => a.id === "nyc-moma-american-museum")!,
          type: "museum",
          isPartner: true,
        },
        {
          timeBlock: "2:30 PM - 4:30 PM",
          startTime: "2:30 PM",
          endTime: "4:30 PM",
          activity: activities.find((a) => a.id === "nyc-high-line-chelsea")!,
          type: "scenic",
          isPartner: true,
        },
        {
          timeBlock: "6:00 PM - 8:00 PM",
          startTime: "6:00 PM",
          endTime: "8:00 PM",
          activity: activities.find((a) => a.id === "nyc-dinner-eleven-madison")!,
          type: "restaurant",
          isPartner: isPartnerActivity(activities.find((a) => a.id === "nyc-dinner-eleven-madison")!),
        },
      ],
    },
  ];

  // Check if user has existing booking
  const existingBooking = findExistingBooking(userProfile || null, destination, startDate, endDate);

  return {
    destination,
    description,
    startDate,
    endDate,
    travelers,
    days,
    accommodation: existingBooking ? {
      bookedHotel: existingBooking,
    } : {
      suggestions: [
        {
          id: "jw-marriott-essex-house",
          name: "JW Marriott Essex House New York",
          address: "160 Central Park South, New York, NY 10019",
          description: "Luxury property perfectly positioned across from Central Park with easy access to your planned museums and fine dining experiences.",
          tags: ["Luxury", "Central Park Views", "Fine Dining", "Concierge Service"],
          isPartnerHotel: true,
          matchedUserPreferences: [
            "Luxury tier - matches your budget preference",
            "Central to all planned activities (avg 0.4 mi)",
            "Fine dining options for food enthusiasts",
          ],
          rating: 4.8,
          reviewCount: 2340,
          pricePerNight: 450,
          currency: "$",
          bonvoyPoints: 60000,
          distanceFromActivities: "0.4 mi avg from your planned activities",
          images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"],
          amenities: ["Spa", "Restaurant", "Fitness Center", "Concierge", "Room Service"],
          bookingUrl: "https://www.marriott.com/",
        },
        {
          id: "marriott-marquis-times-square",
          name: "New York Marriott Marquis",
          address: "1535 Broadway, New York, NY 10036",
          description: "Iconic Times Square location with spectacular city views, perfect for families and groups seeking central Manhattan access.",
          tags: ["Times Square", "Family-Friendly", "City Views", "Theater District"],
          isPartnerHotel: true,
          matchedUserPreferences: [
            "Family-friendly amenities",
            "Walking distance to Broadway theaters",
            "Central location for all NYC attractions",
          ],
          rating: 4.6,
          reviewCount: 5890,
          pricePerNight: 380,
          currency: "$",
          bonvoyPoints: 50000,
          distanceFromActivities: "0.6 mi avg from your planned activities",
          images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400"],
          amenities: ["Restaurant", "Lounge", "Fitness Center", "Business Center"],
          bookingUrl: "https://www.marriott.com/",
        },
        {
          id: "courtyard-manhattan-fifth-avenue",
          name: "Courtyard New York Manhattan/Fifth Avenue",
          address: "3 E 40th St, New York, NY 10016",
          description: "Modern boutique hotel near Bryant Park offering excellent value with upscale amenities and walkability to your itinerary stops.",
          tags: ["Boutique Style", "Great Value", "Bryant Park", "Modern"],
          isPartnerHotel: true,
          matchedUserPreferences: [
            "Excellent value for premium location",
            "Modern amenities and design",
            "Close to museums and dining",
          ],
          rating: 4.5,
          reviewCount: 1820,
          pricePerNight: 320,
          currency: "$",
          bonvoyPoints: 40000,
          distanceFromActivities: "0.5 mi avg from your planned activities",
          images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400"],
          amenities: ["Fitness Center", "Restaurant", "Free WiFi", "Business Center"],
          bookingUrl: "https://www.marriott.com/",
        },
      ],
    },
    summary: {
      estimatedBudget: {
        min: 450,
        max: 650,
        currency: "$",
      },
      weatherInfo: "Expect warm summer weather with temperatures around 75-85°F. Pack light, breathable clothing and sunscreen.",
      packingTips: [
        "Comfortable walking shoes (expect 8-10 miles of walking per day)",
        "Light jacket or sweater for air-conditioned museums",
        "Sunscreen and sunglasses",
        "Portable phone charger",
        "Reusable water bottle",
        "Camera for iconic photo opportunities",
      ],
      travelTips: [
        "Purchase a MetroCard for unlimited subway rides ($33 for 7 days)",
        "Make restaurant reservations at least 2 weeks in advance for popular spots",
        "Download the Citymapper app for easy navigation",
        "Consider getting a CityPASS to save on attraction entries",
        "Museums are often less crowded on weekday mornings",
        "Tipping standard is 15-20% at restaurants",
      ],
    },
  };
}
