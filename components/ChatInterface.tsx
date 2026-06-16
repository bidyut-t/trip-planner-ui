"use client";

import { useState, useRef, useEffect } from "react";
import { Message, TripPlanContext } from "@/types";
import MessageBubble from "./MessageBubble";
import { generateTripPlan } from "@/utils/tripPlanner";
import { apiService } from "@/services/api";
import { config } from "@/config/env";
import UserProfileSelector from "./UserProfileSelector";
import Image from "next/image";

interface ChatInterfaceProps {
  onChatStart?: () => void;
}

export default function ChatInterface({ onChatStart }: ChatInterfaceProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [selectedUserName, setSelectedUserName] = useState<string>("there");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        `Hello there! I'm your AI Travel companion ready to unlock new adventures around the world. How can I help you plan your perfect trip?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isChatReady, setIsChatReady] = useState(false);
  const [hasResponse, setHasResponse] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [tripContext, setTripContext] = useState<TripPlanContext>({
    originalPrompt: "",
    modifications: [],
    currentPlan: undefined,  // Explicitly initialize to track state properly
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set chat as ready after component mounts
    const timer = setTimeout(() => setIsChatReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Cycle through loading messages
  useEffect(() => {
    if (isLoading) {
      const messages = [
        "Gathering information...",
        "Searching for amazing places...",
        "Finding the best activities...",
        "Checking partner availability...",
        "Generating your itinerary...",
        "Finalizing your trip plan..."
      ];
      let index = 0;
      setLoadingMessage(messages[0]);
      
      const interval = setInterval(() => {
        if (index < messages.length - 1) {
          index++;
          setLoadingMessage(messages[index]);
        }
      }, 2500); // Change message every 2.5 seconds (for 15s total = 6 messages * 2.5s)
      
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Update welcome message when user profile changes
  useEffect(() => {
    if (messages.length > 0 && messages[0].id === "1") {
      const updatedMessages = [...messages];
      updatedMessages[0] = {
        ...updatedMessages[0],
        content: `Hello${selectedUserName !== "Generic" ? ` ${selectedUserName}` : ""}! I'm your AI Travel companion ready to unlock new adventures around the world. How can I help you plan your perfect trip?`,
      };
      setMessages(updatedMessages);
    }
  }, [selectedUserName]);

  const handleProfileChange = async (userId: string | undefined) => {
    setSelectedUserId(userId);
    if (userId) {
      try {
        const profiles = await apiService.getUserProfiles();
        const profile = profiles.find(p => p.id === userId);
        if (profile) {
          setSelectedUserName(profile.name);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setSelectedUserName("Generic");
      }
    } else {
      setSelectedUserName("Generic");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only scroll to bottom for user messages and initial assistant greeting
    // Don't scroll when itinerary responses are added - let user scroll manually
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only scroll for user messages or non-itinerary assistant messages
      if (lastMessage.role === 'user' || 
          (lastMessage.role === 'assistant' && !lastMessage.tripPlan && messages.length <= 2)) {
        scrollToBottom();
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Hide backdrop text on first user message (not counting the initial assistant message)
    if (messages.length === 1 && onChatStart) {
      onChatStart();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // AI-POWERED CONVERSATIONAL MEMORY: Let the AI decide everything!
      // No brittle keyword detection - AI understands intent naturally
      
      // ALWAYS pass current plan if it exists - let AI decide what to do with it
      // AI will determine: "Is this modifying existing plan or requesting a new trip?"
      let tripPlan;
      
      if (config.useApiData) {
        tripPlan = await apiService.generateItinerary(
          userInput, 
          selectedUserId,
          tripContext.currentPlan  // Always pass current plan if exists
        );
      } else {
        // Mock mode: Get user profile and pass to trip planner
        let userProfile = null;
        if (selectedUserId) {
          try {
            const profiles = await apiService.getUserProfiles();
            userProfile = profiles.find(p => p.id === selectedUserId) || null;
          } catch (error) {
            console.error('Failed to load profile for trip planning:', error);
          }
        }
        tripPlan = generateTripPlan(userInput, userProfile);
      }

      const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: tripContext.currentPlan 
            ? `I've updated your itinerary. Here's your refined ${tripPlan.days.length}-day plan:`
            : `I've created a personalized ${tripPlan.days.length}-day itinerary for your trip to ${tripPlan.destination}. Here's your complete plan:`,
          tripPlan,
          timestamp: new Date(),
          isModification: !!tripContext.currentPlan,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        
        // CONVERSATIONAL MEMORY FEATURE: Store plan history for undo/debugging
        setTripContext(prev => ({
          originalPrompt: prev.originalPrompt || userInput,
          currentPlan: tripPlan,
          modifications: prev.currentPlan ? [...prev.modifications, userInput] : [],
          planHistory: [
            ...(prev.planHistory || []),
            { prompt: userInput, plan: tripPlan, timestamp: new Date() }
          ]
        }));
        
        setIsLoading(false);
        setHasResponse(true);

        // Add follow-up message after a short delay
        setTimeout(() => {
          const followUpMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: "Would you like to make any changes to this itinerary? I can help adjust activities, timings, or suggest alternatives! 😊",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, followUpMessage]);
        }, 800);
    } catch (error) {
      console.error('Error processing request:', error);
      setIsLoading(false);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: config.useApiData 
          ? `Sorry, I encountered an error while connecting to the backend API. Please make sure the server is running at ${config.apiBaseUrl} or switch to mock data mode.`
          : `Sorry, I encountered an error while generating your itinerary. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSelectActivity = (activityId: string, isSelected: boolean) => {
    setSelectedActivities(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(activityId);
      } else {
        newSet.delete(activityId);
      }
      return newSet;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-4 md:p-10">
      {!isChatReady && (
        <>
          <div className="text-center mb-16 md:mb-24 animate-fade-in-down">
            <div className="inline-flex items-center gap-3 glass rounded-full px-5 py-2 mb-5">
              <div className="w-6 h-6 bg-gradient-to-br from-marriott-red to-marriott-lightRed rounded-full flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <span className="text-white text-sm font-medium">
                Marriott International
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl mb-4">
              Welcome to Marriott NextGen Navigators
            </h1>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg font-light">
              We are here to help planning your trip
            </p>
          </div>
        </>
      )}

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl glass rounded-3xl shadow-2xl overflow-hidden animate-slide-up hover:shadow-[0_20px_60px_rgba(220,20,60,0.3)] transition-all duration-500">
        <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-gradient-to-r from-transparent via-white/5 to-transparent">
          <div className="w-12 h-12 bg-gradient-to-br from-marriott-red via-marriott-lightRed to-marriott-coral rounded-full flex items-center justify-center shadow-lg animate-pulse-slow p-2.5">
            <Image
              src="/marriott-logo-white.png"
              alt="Marriott Logo"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">
              Welcome to Marriott NextGen Navigators
            </h3>
            <p className="text-white/70 text-sm">
              We are here to help planning your trip
            </p>
          </div>
          
          {/* USER PROFILE FEATURE: Selector component for choosing travel profiles */}
          <UserProfileSelector 
            selectedUserId={selectedUserId}
            onProfileChange={handleProfileChange}
          />
          
          {/* Shopping Bag Indicator */}
          {selectedActivities.size > 0 && (
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 glass rounded-full flex items-center justify-center shadow-lg border border-marriott-coral/30">
                <svg className="w-5 h-5 text-marriott-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-marriott-red to-marriott-lightRed rounded-full flex items-center justify-center border border-white/20 shadow-lg animate-pulse-slow">
                <span className="text-white text-xs font-bold">{selectedActivities.size}</span>
              </div>
              <div className="absolute top-12 right-0 glass-dark text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 z-50">
                {selectedActivities.size} {selectedActivities.size === 1 ? 'activity' : 'activities'} for booking
              </div>
            </div>
          )}
          
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>

        <div 
          className={`overflow-y-auto p-6 space-y-4 transition-all duration-500 ${messages.length > 1 ? 'h-[55vh] md:h-[60vh]' : 'h-52 md:h-64'}`}
        >
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message}
              selectedActivities={selectedActivities}
              onSelectActivity={handleSelectActivity}
            />
          ))}
          {isLoading && (
            <div className="flex gap-2 items-start">
              <div className="glass-dark rounded-2xl px-4 py-3 text-white min-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 items-end">
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bouncy-dot" />
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bouncy-dot delay-100" />
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bouncy-dot delay-200" />
                  </div>
                  <span className="text-sm text-white/80 animate-pulse">{loadingMessage}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-white/10 bg-gradient-to-b from-transparent to-white/5">
          <div className="glass rounded-2xl p-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-marriott-red/50 focus-within:scale-[1.01] transition-all duration-300 hover:bg-white/15">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Try asking: Plan a 3-day trip to Jaipur with heritage sites and Rajasthani cuisine"
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/50 px-2"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 bg-gradient-to-br from-marriott-red to-marriott-lightRed rounded-xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-[0_8px_25px_rgba(220,20,60,0.5)]"
            >
              <span className="text-xl animate-pulse-subtle">➤</span>
            </button>
          </div>
          
          {/* Marriott Branding */}
          <div className="mt-3 flex items-center justify-end gap-2 text-white/50 text-xs">
            <span className="font-medium">Powered by</span>
            <span className="text-white font-semibold text-xs">Marriott International</span>
          </div>
        </div>
      </div>
    </div>
  );
}
