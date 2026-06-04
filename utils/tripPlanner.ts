import { TripPlan, DayPlan, ItineraryActivity, Activity } from "@/types";
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

export function generateTripPlan(userPrompt: string): TripPlan {
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

  return {
    destination,
    description,
    startDate,
    endDate,
    travelers,
    days,
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
