"use client";

import { HotelRecommendation } from "@/types";
import Image from "next/image";
import { useState } from "react";

interface Props {
  hotel: HotelRecommendation;
  isBooked?: boolean;
}

export default function HotelCard({ hotel, isBooked = false }: Props) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`glass-dark rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all ${isBooked ? 'w-full' : 'flex-shrink-0 w-[475px]'}`}>
      
      <div className="p-3">
        <div className="flex gap-3">
          {/* Hotel Image */}
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
            {!imageError && hotel.images.length > 0 ? (
              <Image
                src={hotel.images[0]}
                alt={hotel.name}
                fill
                className="object-cover"
                unoptimized
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-marriott-red/40 via-marriott-lightRed/30 to-marriott-coral/40 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center">
                <span className="text-5xl opacity-40">🏨</span>
              </div>
            )}
          </div>

          {/* Hotel Details */}
          <div className="flex-1 space-y-1">
            {/* Hotel Name & Partner Badge Chip */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-white font-semibold text-base leading-tight flex-1">
                {hotel.name}
              </h4>
              {hotel.isPartnerHotel && (
                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-marriott-red/20 to-marriott-lightRed/20 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full border border-marriott-red/30 whitespace-nowrap">
                  <span>🏨</span>
                  <span>HOTEL</span>
                </div>
              )}
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 text-[10px]">
              <div className="flex items-center gap-1 text-yellow-400">
                <span>⭐</span>
                <span className="font-semibold">{hotel.rating}</span>
              </div>
              <span className="text-white/60">
                ({hotel.reviewCount.toLocaleString()})
              </span>
            </div>

            {/* Address */}
            <p className="text-white/60 text-[10px] line-clamp-1">
              📍 {hotel.address}
            </p>

            {/* Price */}
            <div className="flex items-center gap-2 text-xs">
              <div className="text-white font-bold">
                {hotel.currency}{hotel.pricePerNight}/night
              </div>
              {hotel.bonvoyPoints && (
                <div className="flex items-center gap-1 text-marriott-coral text-[10px]">
                  <span>💎</span>
                  <span className="font-semibold">
                    {hotel.bonvoyPoints.toLocaleString()} pts
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/70 text-xs leading-relaxed mt-2 mb-2 line-clamp-2">
          {hotel.description}
        </p>

        {/* Matched Preferences & Amenities in single box with 2 columns */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-2 mb-2">
          <div className="grid grid-cols-2 gap-3">
            {/* Left column - Matched Preferences or Booking Details */}
            {hotel.matchedUserPreferences && hotel.matchedUserPreferences.length > 0 && (
              <div>
                <div className="text-green-400 text-[10px] font-semibold mb-1 flex items-center gap-1">
                  <span>{isBooked ? '📋' : '✓'}</span>
                  <span>{isBooked ? 'Booking Details' : 'Matched Preferences'}</span>
                </div>
                <div className="space-y-0.5">
                  {hotel.matchedUserPreferences.map((pref, idx) => (
                    <div key={idx} className="text-white/70 text-[9px] flex items-start gap-1">
                      <span className="text-green-400">•</span>
                      <span className="line-clamp-1">{pref}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Right column - Amenities */}
            <div>
              <div className="text-blue-400 text-[10px] font-semibold mb-1.5">
                Amenities
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hotel.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="text-[9px] px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div className="text-white/60 text-[10px] flex items-center gap-1 mb-2">
          <span>🗺️</span>
          <span>{hotel.distanceFromActivities}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => hotel.bookingUrl && window.open(hotel.bookingUrl, '_blank')}
          className="w-full bg-gradient-to-r from-marriott-red to-marriott-lightRed hover:from-marriott-darkRed hover:to-marriott-red text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          {isBooked ? 'View Reservation' : 'View Details & Book'}
        </button>
      </div>
    </div>
  );
}
