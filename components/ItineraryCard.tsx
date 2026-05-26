"use client";

import { ItineraryActivity } from "@/types";
import Image from "next/image";
import { useState } from "react";

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

const placeholderBackgrounds: Record<string, string> = {
  restaurant: "bg-gradient-to-br from-orange-900/40 via-red-900/30 to-orange-800/40",
  transit: "bg-gradient-to-br from-blue-900/40 via-cyan-900/30 to-blue-800/40",
  scenic: "bg-gradient-to-br from-green-900/40 via-teal-900/30 to-green-800/40",
  activity: "bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-purple-800/40",
  museum: "bg-gradient-to-br from-amber-900/40 via-yellow-900/30 to-amber-800/40",
  attraction: "bg-gradient-to-br from-pink-900/40 via-rose-900/30 to-pink-800/40",
};

export default function ItineraryCard({ activity, isModified = false }: Props) {
  const [imageError, setImageError] = useState(false);
  
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
      <div className="p-3 space-y-2.5">
        <div className="flex items-center gap-2 text-white/90 font-semibold text-sm">
          <span className="text-marriott-coral">⏰</span>
          <span>
            {activity.startTime} - {activity.endTime}
          </span>
          <span className="text-white/50">({activity.timeBlock})</span>
        </div>

        <div className="flex gap-3">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
            {!imageError ? (
              <Image
                src={activity.activity.images[0]}
                alt={activity.activity.name}
                fill
                className="object-cover"
                unoptimized
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-full h-full ${placeholderBackgrounds[activity.type] || placeholderBackgrounds.activity} backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center`}>
                <span className="text-5xl opacity-40">{typeIcons[activity.type] || "📍"}</span>
                <span className="text-[10px] text-white/40 mt-1 font-medium uppercase tracking-wider">
                  {activity.type}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex items-start gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${
                  typeColors[activity.type] || typeColors.activity
                }`}
              >
                <span>{typeIcons[activity.type] || "📍"}</span>
                <span className="capitalize">{activity.type}</span>
              </span>
            </div>

            <h4 className="text-white font-semibold text-base leading-tight">
              {activityName}
            </h4>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-yellow-400">
                <span>⭐</span>
                <span className="font-semibold">
                  {activity.activity.rating}
                </span>
              </div>
              <span className="text-white/60">
                ({activity.activity.reviews.toLocaleString()})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
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

        <p className="text-white/80 text-xs leading-relaxed line-clamp-2">
          {activity.activity.description}
        </p>

        {activity.isPartner && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            {activity.activity.earnPoints > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400">✓</span>
                <span className="text-white/90">
                  Earn{" "}
                  <span className="font-semibold text-marriott-coral">
                    {activity.activity.earnPoints} Bonvoy Points
                  </span>
                </span>
              </div>
            )}

            {tierMessage && (
              <div className="flex items-start gap-1.5 text-xs bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                <span className="text-amber-400 text-xs">👑</span>
                <span className="text-amber-200 text-xs leading-relaxed">
                  {tierMessage}
                </span>
              </div>
            )}

            <button className="w-full bg-gradient-to-r from-marriott-red to-marriott-lightRed hover:from-marriott-darkRed hover:to-marriott-red text-white font-semibold py-2 px-3 rounded-lg text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg">
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
