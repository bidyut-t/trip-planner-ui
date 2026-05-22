"use client";

import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import Background from "@/components/Background";

export default function HomePage() {
  const [hideBackdropText, setHideBackdropText] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Background hideTitleText={hideBackdropText} />
      <ChatInterface onChatStart={() => setHideBackdropText(true)} />
    </div>
  );
}
