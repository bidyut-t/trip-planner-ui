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

      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-rose-700/25 to-orange-600/20 z-10" />
        </div>
      </div>

      {!hideTitleText && (
        <div
          className="fixed top-[15%] left-1/2 -translate-x-1/2 text-[clamp(3rem,12vw,10rem)] font-black text-white/[0.08] text-center tracking-wider z-[1] pointer-events-none select-none uppercase whitespace-nowrap"
          style={{ fontWeight: 900 }}
        >
          MARRIOTT BONVOY
        </div>
      )}

      <div ref={particlesRef} />
    </>
  );
}
