"use client";

import { Message } from "@/types";
import ItineraryCard from "./ItineraryCard";
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues
const ItineraryMap = dynamic(() => import('./ItineraryMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] glass-dark rounded-2xl flex items-center justify-center">
      <p className="text-white/70">Loading map...</p>
    </div>
  ),
});

interface Props {
  message: Message;
  selectedActivities?: Set<string>;
  onSelectActivity?: (activityId: string, isSelected: boolean) => void;
}

export default function MessageBubble({ message, selectedActivities, onSelectActivity }: Props) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[70%] bg-gradient-to-br from-marriott-red to-marriott-lightRed text-white rounded-2xl px-5 py-3 shadow-lg">
          <p className="text-[15px] leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      <div className="glass-dark rounded-2xl px-5 py-3 max-w-[85%]">
        <p className="text-white text-[15px] leading-relaxed">
          {message.content}
        </p>
      </div>

      {message.tripPlan && (
        <div className="space-y-4 max-w-full">
          {/* Trip Summary with animation */}
          <div className="glass-dark rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <h3 className="text-white font-semibold text-lg mb-2">
              {message.tripPlan.destination}
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {message.tripPlan.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
              <span>
                📅 {message.tripPlan.startDate} - {message.tripPlan.endDate}
              </span>
              <span>•</span>
              <span>
                👥 {message.tripPlan.travelers.adults} Adults
                {message.tripPlan.travelers.children > 0 &&
                  `, ${message.tripPlan.travelers.children} ${
                    message.tripPlan.travelers.children === 1 ? "Child" : "Children"
                  }`}
              </span>
            </div>
          </div>

          {/* Day by Day Itinerary with staggered animation */}
          {message.tripPlan.days.map((day, dayIndex) => (
            <div key={day.day} className="space-y-3">
              <div 
                className="glass-dark rounded-xl px-4 py-2 animate-fade-in-up"
                style={{ animationDelay: `${0.1 + dayIndex * 0.05}s` }}
              >
                <h4 className="text-white font-semibold">
                  Day {day.day} - {day.date}
                </h4>
              </div>

              {day.activities.map((activity, idx) => (
                <div
                  key={`${day.day}-${idx}`}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${0.15 + dayIndex * 0.05 + idx * 0.05}s` }}
                >
                  <ItineraryCard
                    activity={activity}
                    isModified={message.isModification && message.modifiedActivities?.includes(activity.activity.id)}
                    isSelected={selectedActivities?.has(activity.activity.id)}
                    onSelect={onSelectActivity}
                  />
                </div>
              ))}

              {/* Daily Map Route Link */}
              {day.mapUrl && (
                <div 
                  className="glass-dark rounded-xl px-4 py-3 flex items-center justify-between animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + dayIndex * 0.05 + day.activities.length * 0.05}s` }}
                >
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="text-xl">🗺️</span>
                    <span className="text-sm font-medium">View Day {day.day} Route on Map</span>
                  </div>
                  <a
                    href={day.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-marriott-red hover:bg-marriott-lightRed text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <span>Open Map</span>
                    <span>→</span>
                  </a>
                </div>
              )}
            </div>
          ))}

          {/* Map View - At the end with animation */}
          <div 
            className="glass-dark rounded-2xl p-4 animate-fade-in-up"
            style={{ animationDelay: `${0.3 + message.tripPlan.days.length * 0.1}s` }}
          >
            <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <span>🗺️</span>
              <span>Your Trip Route</span>
            </h4>
            <ItineraryMap 
              activities={message.tripPlan.days.flatMap(day => day.activities)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
