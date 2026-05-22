import { TripPlan, DayPlan, ItineraryActivity, Activity } from "@/types";
import { parseModificationRequest } from "./userProfile";
import nycActivitiesData from "@/data/marriott-nyc-activities-mock.json";

// IMPORTANT: All activity data comes directly from mock JSON - never modify names or titles
const activities: Activity[] = nycActivitiesData.destinations.new_york.activities;

// Get activities by category
function getActivitiesByType(type: string): Activity[] {
  return activities.filter(activity => {
    if (type === 'food') {
      return activity.category === 'restaurant' || activity.cuisineType;
    }
    if (type === 'museum') {
      return activity.category === 'museum' || activity.name.toLowerCase().includes('museum');
    }
    if (type === 'shopping') {
      return activity.name.toLowerCase().includes('shop') || activity.name.toLowerCase().includes('market');
    }
    if (type === 'activity') {
      return activity.category === 'activity';
    }
    return false;
  });
}

// Helper to create activity block
function createActivityBlock(
  activity: Activity,
  startTime: string,
  endTime: string,
  type: ItineraryActivity['type']
): ItineraryActivity {
  return {
    timeBlock: `${startTime} - ${endTime}`,
    startTime,
    endTime,
    activity,
    type,
    isPartner: activity.provider === "Marriott Bonvoy Tours & Activities",
  };
}

// Modify existing trip plan based on user request
export function modifyTripPlan(
  currentPlan: TripPlan,
  modificationRequest: string
): { plan: TripPlan; modifiedActivities: string[] } {
  const modification = parseModificationRequest(modificationRequest);
  const modifiedActivityIds: string[] = [];
  const newPlan = JSON.parse(JSON.stringify(currentPlan)); // Deep clone
  const lowerRequest = modificationRequest.toLowerCase();

  console.log('Modification request:', modification);

  // Handle "add more food spots" - Check in the original request string
  if ((modification.action === 'add' && modification.target === 'food') || 
      lowerRequest.includes('add more food') || 
      lowerRequest.includes('more food')) {
    const foodActivities = getActivitiesByType('food');
    
    // Add a street food activity to Day 2
    if (newPlan.days[1]) {
      const newFoodSpot = foodActivities.find(a => a.id === 'nyc-lunch-katzs');
      if (newFoodSpot && !newPlan.days[1].activities.some((a: ItineraryActivity) => a.activity.id === newFoodSpot.id)) {
        const newActivity = createActivityBlock(
          newFoodSpot,
          '2:00 PM',
          '3:30 PM',
          'restaurant'
        );
        newPlan.days[1].activities.push(newActivity);
        modifiedActivityIds.push(newFoodSpot.id);
      }
    }

    // Add another food spot to Day 3 if requested "more"
    if (newPlan.days[2]) {
      const streetFood = foodActivities.find(a => 
        a.name.toLowerCase().includes('street') || 
        a.name.toLowerCase().includes('food tour')
      );
      if (streetFood && !newPlan.days[2].activities.some((a: ItineraryActivity) => a.activity.id === streetFood.id)) {
        const newActivity = createActivityBlock(
          streetFood,
          '1:00 PM',
          '2:30 PM',
          'restaurant'
        );
        newPlan.days[2].activities.splice(1, 0, newActivity);
        modifiedActivityIds.push(streetFood.id);
      }
    }
  }

  // Handle "don't wake up before 10 AM" - Check in the original request string
  if (modification.constraint === 'noEarlyMorning' || 
      lowerRequest.includes('wake up before 10') ||
      lowerRequest.includes('don\'t want to wake up before') ||
      lowerRequest.includes('no early morning')) {
    newPlan.days.forEach((day: DayPlan) => {
      day.activities.forEach((activity: ItineraryActivity) => {
        const [hours, minutes] = activity.startTime.split(':');
        const hour = parseInt(hours);
        const isPM = activity.startTime.includes('PM');
        const actualHour = isPM && hour !== 12 ? hour + 12 : hour;
        
        // If activity starts before 10 AM, shift it to 10 AM or later
        if (actualHour < 10) {
          const oldStartTime = activity.startTime;
          activity.startTime = '10:00 AM';
          const endHour = parseInt(activity.endTime.split(':')[0]);
          const endIsPM = activity.endTime.includes('PM');
          const actualEndHour = endIsPM && endHour !== 12 ? endHour + 12 : endHour;
          const duration = actualEndHour - actualHour;
          const newEndHour = 10 + duration;
          
          if (newEndHour <= 12) {
            activity.endTime = `${newEndHour}:00 AM`;
          } else if (newEndHour === 13) {
            activity.endTime = '1:00 PM';
          } else {
            activity.endTime = `${newEndHour - 12}:00 PM`;
          }
          
          activity.timeBlock = `${activity.startTime} - ${activity.endTime}`;
          
          // Only add to modified list if not already added
          if (!modifiedActivityIds.includes(activity.activity.id)) {
            modifiedActivityIds.push(activity.activity.id);
          }
        }
      });
    });
  }

  // Handle "replace Day 2 afternoon with shopping"
  if (modification.action === 'replace' && modification.target === 'shopping' && modification.day === 2) {
    const day2 = newPlan.days[1];
    if (day2) {
      // Find afternoon activity (after 12 PM)
      const afternoonIndex = day2.activities.findIndex((a: ItineraryActivity) => {
        const hour = parseInt(a.startTime.split(':')[0]);
        const isPM = a.startTime.includes('PM');
        return (isPM && hour >= 12) || hour >= 12;
      });

      if (afternoonIndex !== -1) {
        // Create a shopping activity
        const shoppingActivity = activities.find(a => 
          a.name.toLowerCase().includes('market') || 
          a.name.toLowerCase().includes('chelsea')
        );
        
        if (shoppingActivity) {
          const oldActivity = day2.activities[afternoonIndex];
          day2.activities[afternoonIndex] = createActivityBlock(
            shoppingActivity,
            oldActivity.startTime,
            oldActivity.endTime,
            'activity'
          );
          if (!modifiedActivityIds.includes(shoppingActivity.id)) {
            modifiedActivityIds.push(shoppingActivity.id);
          }
        }
      }
    }
  }

  // Handle "add game activity on Day 1 evening"
  if (modification.action === 'add' && modification.target === 'activity' && modification.day === 1 && modification.timeOfDay === 'evening') {
    const gameActivities = activities.filter(a => 
      a.name.toLowerCase().includes('game') || 
      a.name.toLowerCase().includes('sports') ||
      a.category === 'activity'
    );
    
    if (gameActivities.length > 0 && newPlan.days[0]) {
      const gameActivity = gameActivities[0];
      const newActivity = createActivityBlock(
        gameActivity,
        '7:00 PM',
        '9:00 PM',
        'activity'
      );
      newPlan.days[0].activities.push(newActivity);
      if (!modifiedActivityIds.includes(gameActivity.id)) {
        modifiedActivityIds.push(gameActivity.id);
      }
    }
  }

  return { plan: newPlan, modifiedActivities: modifiedActivityIds };
}
