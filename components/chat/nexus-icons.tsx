import React from "react";

export const NexusPlanetIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Planet core sphere */}
    <circle cx="12" cy="12" r="5" fill="url(#nexus-planet-grad)" />
    {/* Inner shadow/highlight for 3D sphere look */}
    <path
      d="M12 7C9.24 7 7 9.24 7 12C7 13.06 7.33 14.05 7.9 14.86C8.75 13.1 10.2 11.8 12 11.8C14.2 11.8 16.1 13.5 16.7 15.7C16.89 14.58 17 13.3 17 12C17 9.24 14.76 7 12 7Z"
      fill="url(#nexus-sphere-highlight)"
      fillOpacity="0.6"
    />
    {/* Orbit Ring */}
    <ellipse
      cx="12"
      cy="12"
      rx="9.5"
      ry="3.6"
      transform="rotate(-28 12 12)"
      stroke="url(#nexus-ring-grad)"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="nexus-planet-grad" x1="7" y1="7" x2="17" y2="17" gradientUnits="userSpaceOnUse">
        <stop stopColor="#06B6D4" />
        <stop offset="0.6" stopColor="#8B5CF6" />
        <stop offset="1" stopColor="#3B0764" />
      </linearGradient>
      <linearGradient id="nexus-sphere-highlight" x1="7" y1="7" x2="15" y2="15" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22D3EE" stopOpacity="0.8" />
        <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="nexus-ring-grad" x1="2.5" y1="8.5" x2="21.5" y2="15.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22D3EE" />
        <stop offset="0.5" stopColor="#C084FC" />
        <stop offset="1" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
  </svg>
);
