"use client";

import { useState, useRef, useEffect } from "react";
import { Message, TripPlanContext } from "@/types";
import MessageBubble from "./MessageBubble";
import { generateTripPlan } from "@/utils/tripPlanner";
import { modifyTripPlan } from "@/utils/modificationEngine";
import { apiService } from "@/services/api";
import { config } from "@/config/env";
import UserProfileSelector from "./UserProfileSelector";

interface ChatInterfaceProps {
  onChatStart?: () => void;
}

export default function ChatInterface({ onChatStart }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI Travel companion ready to unlock new adventures around the world. How can I help you plan your perfect trip?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatReady, setIsChatReady] = useState(false);
  const [hasResponse, setHasResponse] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [tripContext, setTripContext] = useState<TripPlanContext>({
    originalPrompt: "",
    modifications: [],
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set chat as ready after component mounts
    const timer = setTimeout(() => setIsChatReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
      // Check if this is a modification request
      const isModification = tripContext.currentPlan && (
        userInput.toLowerCase().includes('add') ||
        userInput.toLowerCase().includes('remove') ||
        userInput.toLowerCase().includes('replace') ||
        userInput.toLowerCase().includes('change') ||
        userInput.toLowerCase().includes('more') ||
        userInput.toLowerCase().includes('don\'t want')
      );

      if (isModification && tripContext.currentPlan) {
        // Add 1.5 second delay before showing response
        setTimeout(() => {
          // Handle modification (client-side)
          const { plan: updatedPlan, modifiedActivities } = modifyTripPlan(
            tripContext.currentPlan!,
            userInput
          );

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `I've updated your itinerary based on your request. Here's your modified plan:`,
            tripPlan: updatedPlan,
            timestamp: new Date(),
            isModification: true,
            modifiedActivities,
          };

          setMessages((prev) => [...prev, assistantMessage]);
          setTripContext({
            ...tripContext,
            currentPlan: updatedPlan,
            modifications: [...tripContext.modifications, userInput],
          });
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
        }, 1500);
      } else {
        // Generate new trip plan - use mock or API based on config
        let tripPlan;
        
        if (config.useApiData) {
          // Use API with selected user profile
          tripPlan = await apiService.generateItinerary(userInput, selectedUserId);
        } else {
          // Use mock data
          tripPlan = generateTripPlan(userInput);
        }

        // Add 1.5 second delay before showing response
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `I've created a personalized ${tripPlan.days.length}-day itinerary for your trip to ${tripPlan.destination}. Here's your complete plan:`,
            tripPlan,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
          setTripContext({
            originalPrompt: userInput,
            currentPlan: tripPlan,
            modifications: [],
          });
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
        }, 1500);
      }
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
          <div className="w-12 h-12 bg-gradient-to-br from-marriott-red via-marriott-lightRed to-marriott-coral rounded-full flex items-center justify-center text-2xl shadow-lg animate-pulse-slow">
            🤖
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">
              Welcome to Marriott NextGen Navigators
            </h3>
            <p className="text-white/70 text-sm">
              We are here to help planning your trip
            </p>
          </div>
          <UserProfileSelector 
            selectedUserId={selectedUserId}
            onProfileChange={setSelectedUserId}
          />
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>

        <div 
          className={`overflow-y-auto p-6 space-y-4 transition-all duration-500 ${messages.length > 1 ? 'h-[55vh] md:h-[60vh]' : 'h-52 md:h-64'}`}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex gap-2 items-center">
              <div className="glass-dark rounded-2xl px-4 py-3 text-white">
                <div className="flex gap-1.5 items-end h-6">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-bouncy-dot" />
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-bouncy-dot delay-100" />
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-bouncy-dot delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-white/10 bg-gradient-to-b from-transparent to-white/5">
          <div className="glass rounded-2xl p-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-marriott-red/50 focus-within:scale-[1.01] transition-all duration-300 hover:bg-white/15">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Try asking: Plan a 3-day trip to New York with museums and local cuisine"
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
