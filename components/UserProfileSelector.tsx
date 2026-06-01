"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/types";
import { apiService } from "@/services/api";

/**
 * User Profile Selector Component
 * 
 * Dropdown UI for selecting user travel profiles to personalize trip planning.
 * Fetches available profiles from the backend and displays them with key preferences
 * (dietary restrictions, budget level). Emits profile changes to parent component.
 * 
 * Features:
 * - Glassmorphic design matching Marriott brand
 * - Profile summary preview (diet, budget)
 * - "None (Generic)" option for non-personalized planning
 * - Visual checkmark for selected profile
 */

interface Props {
  selectedUserId?: string;
  onProfileChange: (userId: string | undefined) => void;
}

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

  const selectedProfile = profiles.find(p => p.id === selectedUserId);

  const getProfileSummary = (profile: UserProfile) => {
    const parts = [];
    if (profile.dietaryRestrictions.length > 0) {
      parts.push(profile.dietaryRestrictions[0]);
    }
    parts.push(profile.budgetLevel);
    return parts.join(', ');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass px-4 py-2 rounded-lg flex items-center gap-2 text-white text-sm hover:bg-white/10 transition-colors border border-white/10"
        disabled={isLoading}
      >
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        <span className="font-semibold text-white/90">
          {selectedProfile ? selectedProfile.name : 'Generic'}
        </span>
        <span className="text-white/50">▼</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl z-50 overflow-hidden border border-white/20 bg-slate-900/70 backdrop-blur-lg">
            <div className="p-2 space-y-1">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    onProfileChange(profile.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedUserId === profile.id
                      ? 'bg-marriott-red/20 border border-marriott-red/30'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedUserId === profile.id && (
                      <span className="text-green-400">✓</span>
                    )}
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm">
                        {profile.name}
                      </div>
                      <div className="text-white/60 text-xs capitalize">
                        {getProfileSummary(profile)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              
              <div className="border-t border-white/10 pt-1 mt-1">
                <button
                  onClick={() => {
                    onProfileChange(undefined);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedUserId
                      ? 'bg-marriott-red/20 border border-marriott-red/30'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {!selectedUserId && (
                      <span className="text-green-400">✓</span>
                    )}
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm">
                        None (Generic)
                      </div>
                      <div className="text-white/60 text-xs">
                        No personalization
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
