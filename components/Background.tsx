"use client";

import { useEffect, useRef, useState } from "react";

interface BackgroundProps {
  hideTitleText?: boolean;
}

export default function Background({ hideTitleText = false }: BackgroundProps) {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.cssText = `
        position: fixed;
        width: 3px;
        height: 3px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        pointer-events: none;
        left: ${Math.random() * 100}%;
        animation: float-particle ${15 + Math.random() * 10}s linear infinite;
        animation-delay: ${Math.random() * 20}s;
        z-index: 1;
      `;
      particlesRef.current.appendChild(particle);
    }
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes float-particle {
          0% {
            transform: translateY(100vh) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(100px) scale(1);
            opacity: 0;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-0 overflow-hidden">
        <img 
          src="/jw-marriott-4k.png" 
          alt="Marriott Background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-orange-900/20 to-blue-900/25 z-10" />
      </div>

      <div ref={particlesRef} />
    </>
  );
}
