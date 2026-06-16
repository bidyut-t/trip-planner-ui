"use client";

import { Message } from "@/types";
import ItineraryCard from "./ItineraryCard";
import HotelCard from "./HotelCard";
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

          {/* Hotel Recommendations - Right after trip summary */}
          {message.tripPlan.accommodation && (
            <div className="space-y-3">
              {message.tripPlan.accommodation.bookedHotel ? (
                // User has a booked hotel
                <div className="animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-semibold text-lg flex items-center gap-2">
                      <span>🏨</span>
                      <span>Your Accommodation</span>
                    </h4>
                  </div>
                  <HotelCard hotel={message.tripPlan.accommodation.bookedHotel} isBooked={true} />
                </div>
              ) : message.tripPlan.accommodation.suggestions && message.tripPlan.accommodation.suggestions.length > 0 ? (
                // Show hotel suggestions
                <div className="animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="text-white font-semibold text-lg flex items-center gap-2">
                      <span>🏨</span>
                      <span>Recommended Hotels for Your Trip</span>
                    </h4>
                    <div className="text-white/60 text-xs flex items-center gap-1">
                      <span>←</span>
                      <span>Scroll</span>
                      <span>→</span>
                    </div>
                  </div>
                  {/* Horizontal scrollable carousel */}
                  <div className="overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scroll-smooth">
                    <div className="flex gap-3">
                      {message.tripPlan.accommodation.suggestions.map((hotel, idx) => (
                        <div 
                          key={hotel.id}
                          className="animate-fade-in-up snap-start"
                          style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                        >
                          <HotelCard hotel={hotel} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Trip Plan Heading */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
            <h4 className="text-white font-semibold text-lg flex items-center gap-2 mb-3">
              <span>📅</span>
              <span>Your Trip Plan</span>
            </h4>
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

          {/* Trip Summary & Tips */}
          {message.tripPlan.summary && (
            <div 
              className="glass-dark rounded-2xl p-4 animate-fade-in-up"
              style={{ animationDelay: `${0.4 + message.tripPlan.days.length * 0.1}s` }}
            >
              <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <span>💼</span>
                <span>Trip Summary & Tips</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* Estimated Budget - Top Left */}
                {message.tripPlan.summary.estimatedBudget && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">💰</span>
                      <h5 className="text-white font-semibold text-sm">Estimated Budget</h5>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-marriott-coral text-xl font-bold">
                        {message.tripPlan.summary.estimatedBudget.currency}{message.tripPlan.summary.estimatedBudget.min}
                      </span>
                      <span className="text-white/60 text-sm">-</span>
                      <span className="text-marriott-coral text-xl font-bold">
                        {message.tripPlan.summary.estimatedBudget.currency}{message.tripPlan.summary.estimatedBudget.max}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs mt-1">
                      Per person estimate
                    </p>
                  </div>
                )}

                {/* Weather Info - Top Right */}
                {message.tripPlan.summary.weatherInfo && (
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🌤️</span>
                      <h5 className="text-blue-300 font-semibold text-sm">Weather</h5>
                    </div>
                    <p className="text-white/80 text-xs leading-relaxed">
                      {message.tripPlan.summary.weatherInfo}
                    </p>
                  </div>
                )}

                {/* Travel Tips - Bottom Left */}
                {message.tripPlan.summary.travelTips && message.tripPlan.summary.travelTips.length > 0 && (
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💡</span>
                      <h5 className="text-amber-300 font-semibold text-sm">Travel Tips</h5>
                    </div>
                    <ul className="space-y-1">
                      {message.tripPlan.summary.travelTips.slice(0, 4).map((tip, idx) => (
                        <li key={idx} className="text-white/80 text-xs flex items-start gap-1.5">
                          <span className="text-amber-400 mt-0.5 text-xs">→</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Packing Tips - Bottom Right */}
                {message.tripPlan.summary.packingTips && message.tripPlan.summary.packingTips.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🧳</span>
                      <h5 className="text-white font-semibold text-sm">Don't Forget to Pack</h5>
                    </div>
                    <ul className="space-y-1">
                      {message.tripPlan.summary.packingTips.slice(0, 4).map((tip, idx) => (
                        <li key={idx} className="text-white/80 text-xs flex items-start gap-1.5">
                          <span className="text-green-400 mt-0.5 text-xs">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
