"use client";

import { ItineraryActivity } from "@/types";
import Image from "next/image";

interface Props {
  activity: ItineraryActivity;
  isModified?: boolean;
}

const typeIcons: Record<string, string> = {
  restaurant: "🍽️",
  transit: "🚇",
  scenic: "🏞️",
  activity: "🎯",
  museum: "🏛️",
  attraction: "🎡",
};

const typeColors: Record<string, string> = {
  restaurant: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  transit: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  scenic: "bg-green-500/20 text-green-300 border-green-500/30",
  activity: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  museum: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  attraction: "bg-pink-500/20 text-pink-300 border-pink-500/30",
};

export default function ItineraryCard({ activity, isModified = false }: Props) {
  const tierMessage = activity.isPartner
    ? "Free cancellation until last minute since you are Titanium member"
    : null;

  // IMPORTANT: Always use activity names directly from mock data without modification
  const activityName = activity.activity.name; // Direct from mock data
  const activityProvider = activity.activity.provider; // Direct from mock data

  return (
    <div className={`glass-dark rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all ${isModified ? 'ring-2 ring-green-400 animate-pulse-highlight' : ''}`}>
      {isModified && (
        <div className="bg-green-500/20 border-b border-green-500/30 px-4 py-2 flex items-center gap-2">
          <span className="text-green-400 text-sm font-semibold">✨ NEW</span>
          <span className="text-green-300 text-xs">Just added to your itinerary</span>
        </div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-white/90 font-semibold text-sm">
          <span className="text-marriott-coral">⏰</span>
          <span>
            {activity.startTime} - {activity.endTime}
          </span>
          <span className="text-white/50">({activity.timeBlock})</span>
        </div>

        <div className="flex gap-4">
          <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden">
            <Image
              src={activity.activity.images[0]}
              alt={activity.activity.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${
                  typeColors[activity.type] || typeColors.activity
                }`}
              >
                <span>{typeIcons[activity.type] || "📍"}</span>
                <span className="capitalize">{activity.type}</span>
              </span>
            </div>

            <h4 className="text-white font-semibold text-lg leading-tight">
              {activityName}
            </h4>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-yellow-400">
                <span>⭐</span>
                <span className="font-semibold">
                  {activity.activity.rating}
                </span>
              </div>
              <span className="text-white/60">
                ({activity.activity.reviews.toLocaleString()} reviews)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="text-white font-semibold">
                ${activity.activity.price}
              </div>
              {activity.isPartner && activity.activity.earnPoints > 0 && (
                <>
                  <span className="text-white/50">•</span>
                  <div className="flex items-center gap-1 text-marriott-coral">
                    <span>💎</span>
                    <span className="font-semibold">
                      {activity.activity.earnPoints} pts
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/70">
          <span>🕒</span>
          <span>{activity.activity.availability}</span>
        </div>

        <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
          {activity.activity.description}
        </p>

        {activity.isPartner && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            {activity.activity.earnPoints > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">✓</span>
                <span className="text-white/90">
                  Earn{" "}
                  <span className="font-semibold text-marriott-coral">
                    {activity.activity.earnPoints} Bonvoy Points
                  </span>{" "}
                  on this booking
                </span>
              </div>
            )}

            {tierMessage && (
              <div className="flex items-start gap-2 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                <span className="text-amber-400 text-xs">👑</span>
                <span className="text-amber-200 text-xs leading-relaxed">
                  {tierMessage}
                </span>
              </div>
            )}

            <button className="w-full bg-gradient-to-r from-marriott-red to-marriott-lightRed hover:from-marriott-darkRed hover:to-marriott-red text-white font-semibold py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg">
              Book Now
            </button>
          </div>
        )}

        {!activity.isPartner && (
          <div className="pt-2 border-t border-white/10">
            <a
              href="#"
              className="block w-full text-center text-marriott-coral hover:text-marriott-lightRed font-medium py-2 transition-colors"
            >
              View Details →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
