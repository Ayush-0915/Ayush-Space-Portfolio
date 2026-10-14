"use client";

import React, { useState, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { NexusPlanetIcon } from "./nexus-icons";
import { NexusChatWindow } from "./nexus-chat-window";

export const NexusChatLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement | null>(null);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => launcherRef.current?.focus(), 50);
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <NexusChatWindow isOpen={isOpen} onClose={handleClose} />

      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 select-none">
        {/* Tooltip badge on desktop matching design mockup */}
        {!isOpen && (
          <div
            id="nexus-launcher-tooltip"
            role="tooltip"
            className="hidden sm:flex items-center gap-2 rounded-full border border-violet-400/35 bg-[#0c0728]/95 px-3.5 py-1.5 shadow-[0_0_20px_rgba(112,66,248,0.35)] backdrop-blur-md transition-all duration-300 motion-reduce:transition-none"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="text-xs font-medium text-gray-200">
              Chat with <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">Nexus AI</span>
            </span>
          </div>
        )}

        {/* Floating Launcher Button */}
        <button
          ref={launcherRef}
          type="button"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-controls="nexus-chat-window"
          aria-haspopup="dialog"
          aria-label={isOpen ? "Close Nexus AI chat" : "Open Nexus AI chat"}
          aria-describedby={!isOpen ? "nexus-launcher-tooltip" : undefined}
          className={`group relative flex h-14 w-14 items-center justify-center rounded-full border border-[#7042f88b] bg-gradient-to-br from-[#2A0E61] via-[#1a0a3a] to-[#0c0728] text-white shadow-[0_0_25px_rgba(112,66,248,0.55)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-cyan-400/80 hover:shadow-[0_0_35px_rgba(34,211,238,0.45)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 motion-reduce:transform-none motion-reduce:transition-none`}
        >
          {/* Subtle luminous ring aura */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 opacity-30 blur-sm group-hover:opacity-60 transition-opacity motion-reduce:transition-none" />

          {/* Active indicator dot */}
          {!isOpen && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-[#030014] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            </span>
          )}

          {/* Icon: Planet with orbit ring in closed state; XMark in open state */}
          <div className="relative z-10 transition-transform duration-200 motion-reduce:transition-none">
            {isOpen ? (
              <XMarkIcon className="h-6 w-6 text-white group-hover:rotate-90 transition-transform duration-200 motion-reduce:transition-none" />
            ) : (
              <NexusPlanetIcon className="h-7 w-7 text-cyan-300 group-hover:scale-110 transition-transform duration-200 motion-reduce:transition-none" />
            )}
          </div>
        </button>
      </div>
    </>
  );
};
