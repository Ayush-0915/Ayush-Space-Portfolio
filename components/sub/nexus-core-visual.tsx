"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

const CHIPS = [
  {
    name: "Python",
    icon: "/skills/python.svg",
    position: "top-[5%] left-[0%] sm:top-[7%] sm:left-[2%]",
    borderClass: "border-cyan-400/60 hover:border-cyan-300",
    glowClass: "shadow-[0_0_22px_rgba(34,211,238,0.3)] hover:shadow-[0_0_32px_rgba(34,211,238,0.55)]",
    dotColor: "bg-cyan-400",
  },
  {
    name: "Scikit-learn",
    icon: "/skills/scikitlearn.svg",
    position: "top-[5%] right-[0%] sm:top-[7%] sm:right-[2%]",
    borderClass: "border-amber-400/60 hover:border-amber-300",
    glowClass: "shadow-[0_0_22px_rgba(245,158,11,0.3)] hover:shadow-[0_0_32px_rgba(245,158,11,0.55)]",
    dotColor: "bg-amber-400",
  },
  {
    name: "FastAPI",
    icon: "/skills/fastapi.svg",
    position: "bottom-[5%] left-[0%] sm:bottom-[7%] sm:left-[2%]",
    borderClass: "border-teal-400/60 hover:border-teal-300",
    glowClass: "shadow-[0_0_22px_rgba(45,212,191,0.3)] hover:shadow-[0_0_32px_rgba(45,212,191,0.55)]",
    dotColor: "bg-teal-400",
  },
  {
    name: "PyTorch",
    icon: "/skills/pytorch.svg",
    position: "bottom-[5%] right-[0%] sm:bottom-[7%] sm:right-[2%]",
    borderClass: "border-rose-400/60 hover:border-rose-300",
    glowClass: "shadow-[0_0_22px_rgba(244,63,94,0.3)] hover:shadow-[0_0_32px_rgba(244,63,94,0.55)]",
    dotColor: "bg-rose-400",
  },
] as const;

export const NexusCoreVisual = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative flex aspect-square w-full max-w-[340px] flex-shrink-0 items-center justify-center mx-auto sm:max-w-[420px] md:max-w-[480px] lg:max-w-[580px] xl:max-w-[640px]">
      {/* Background Soft Atmospheric Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 sm:inset-4 rounded-full bg-gradient-to-tr from-purple-600/35 via-cyan-500/25 to-pink-500/30 blur-3xl -z-10 animate-pulse-subtle motion-reduce:animate-none"
      />

      {/* SVG Canvas for High-Tech HUD, Orbits, Core & Circuit Traces */}
      <svg
        viewBox="0 0 600 600"
        className="h-full w-full select-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Central Core Surface Gradient */}
          <radialGradient id="core-surface-grad" cx="34%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#cffafe" stopOpacity="0.98" />
            <stop offset="16%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="36%" stopColor="#818cf8" stopOpacity="0.85" />
            <stop offset="58%" stopColor="#9333ea" stopOpacity="0.9" />
            <stop offset="78%" stopColor="#4c0519" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#030014" stopOpacity="1" />
          </radialGradient>

          {/* Core Corona Glow Gradient */}
          <linearGradient id="corona-rim-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.98" />
            <stop offset="45%" stopColor="#c084fc" stopOpacity="0.75" />
            <stop offset="85%" stopColor="#f43f5e" stopOpacity="0.95" />
          </linearGradient>

          {/* Orbit 1 (Magenta) Gradient */}
          <linearGradient id="orbit-magenta-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.92" />
            <stop offset="40%" stopColor="#c084fc" stopOpacity="0.85" />
            <stop offset="80%" stopColor="#818cf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.85" />
          </linearGradient>

          {/* Orbit 2 (Cyan) Gradient */}
          <linearGradient id="orbit-cyan-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.98" />
            <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="80%" stopColor="#a855f7" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
          </linearGradient>

          {/* Miniature Earth Planet Gradient */}
          <radialGradient id="earth-planet-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="40%" stopColor="#0284c7" />
            <stop offset="70%" stopColor="#047857" />
            <stop offset="100%" stopColor="#082f49" />
          </radialGradient>

          {/* Miniature Violet Moon Gradient */}
          <radialGradient id="moon-planet-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="50%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#1e1035" />
          </radialGradient>

          {/* Filters for Radiant Corona & Soft Glows */}
          <filter id="corona-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="node-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Frame Guide Ring */}
        <circle
          cx="300"
          cy="300"
          r="275"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />

        {/* Secondary Concentric Calibration Ring */}
        <circle
          cx="300"
          cy="300"
          r="245"
          fill="none"
          stroke="rgba(112,66,248,0.15)"
          strokeWidth="1"
          strokeDasharray="2 12"
        />

        {/* Orbit 1: Dynamic Tilted Ellipse (Magenta / Purple) */}
        <ellipse
          cx="300"
          cy="300"
          rx="225"
          ry="115"
          transform="rotate(-28 300 300)"
          fill="none"
          stroke="url(#orbit-magenta-grad)"
          strokeWidth="2.4"
          filter="url(#glow-filter)"
        />
        {/* Orbit 1: Neon Traveling Light Stream */}
        <ellipse
          cx="300"
          cy="300"
          rx="225"
          ry="115"
          transform="rotate(-28 300 300)"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="3.2"
          strokeDasharray="95 350"
          filter="url(#node-glow-filter)"
          className="animate-dash-travel motion-reduce:animate-none"
        />

        {/* Orbit 2: Dynamic Tilted Ellipse (Electric Cyan / Blue) */}
        <ellipse
          cx="300"
          cy="300"
          rx="215"
          ry="105"
          transform="rotate(38 300 300)"
          fill="none"
          stroke="url(#orbit-cyan-grad)"
          strokeWidth="2.4"
          filter="url(#glow-filter)"
        />
        {/* Orbit 2: Neon Traveling Light Stream (Counter-direction) */}
        <ellipse
          cx="300"
          cy="300"
          rx="215"
          ry="105"
          transform="rotate(38 300 300)"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="3.2"
          strokeDasharray="85 345"
          filter="url(#node-glow-filter)"
          className="animate-dash-travel-reverse motion-reduce:animate-none"
        />

        {/* Orbit 3: Concentric Dashed Telemetry HUD Ring */}
        <circle
          cx="300"
          cy="300"
          r="168"
          fill="none"
          stroke="rgba(34, 211, 238, 0.35)"
          strokeWidth="1.3"
          strokeDasharray="5 7"
          className="animate-spin-slow motion-reduce:animate-none"
          style={{ transformOrigin: "300px 300px" }}
        />

        {/* Orbit 4: Secondary Reverse Telemetry Ring */}
        <circle
          cx="300"
          cy="300"
          r="192"
          fill="none"
          stroke="rgba(192, 132, 252, 0.22)"
          strokeWidth="1"
          strokeDasharray="3 14"
          className="animate-spin-reverse-slow motion-reduce:animate-none"
          style={{ transformOrigin: "300px 300px" }}
        />

        {/* Miniature Orbiting Violet Moon on Orbit 1 with float motion */}
        <g className="animate-planet-float motion-reduce:animate-none">
          <ellipse
            cx="120"
            cy="260"
            rx="15"
            ry="4.5"
            transform="rotate(-25 120 260)"
            fill="none"
            stroke="rgba(192,132,252,0.6)"
            strokeWidth="1"
          />
          <circle cx="120" cy="260" r="9" fill="url(#moon-planet-grad)" stroke="#c084fc" strokeWidth="1" />
        </g>

        {/* Miniature Orbiting Earth-like Planetoid on Orbit 2 with float motion */}
        <g className="animate-planet-float motion-reduce:animate-none" style={{ animationDelay: "1.8s" }}>
          <circle cx="442" cy="245" r="12" fill="url(#earth-planet-grad)" stroke="rgba(34,211,238,0.85)" strokeWidth="1.2" filter="url(#glow-filter)" />
          {/* Atmosphere crescent highlight */}
          <path
            d="M 434 238 A 12 12 0 0 1 454 252 A 12 12 0 0 0 434 238"
            fill="rgba(255,255,255,0.45)"
          />
        </g>

        {/* Glowing Magenta Pearl / Beacon on Orbit 1 */}
        <g className="animate-beacon-pulse motion-reduce:animate-none" style={{ transformOrigin: "225px 185px" }}>
          <circle cx="225" cy="185" r="7.5" fill="#f43f5e" filter="url(#node-glow-filter)" />
          <circle cx="225" cy="185" r="3.5" fill="#ffffff" />
        </g>

        {/* Glowing Cyan Pearl / Beacon on Orbit 2 */}
        <g className="animate-beacon-pulse motion-reduce:animate-none" style={{ transformOrigin: "392px 398px", animationDelay: "1.5s" }}>
          <circle cx="392" cy="398" r="8" fill="#06b6d4" filter="url(#node-glow-filter)" />
          <circle cx="392" cy="398" r="4" fill="#ffffff" />
        </g>

        {/* Circuit Leader Lines to Technology Chips */}
        {/* Leader to Python (Top-Left) */}
        <polyline
          points="225,185 185,145 105,145"
          fill="none"
          stroke="#c084fc"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.88"
        />
        <circle cx="185" cy="145" r="2.5" fill="#f43f5e" />

        {/* Leader to Scikit-learn (Top-Right) */}
        <polyline
          points="385,175 425,145 495,145"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.88"
        />
        <circle cx="425" cy="145" r="2.5" fill="#f59e0b" />

        {/* Leader to FastAPI (Bottom-Left) */}
        <polyline
          points="205,395 175,452 105,452"
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.88"
        />
        <circle cx="175" cy="452" r="2.5" fill="#14b8a6" />

        {/* Leader to PyTorch (Bottom-Right) */}
        <polyline
          points="392,398 428,452 495,452"
          fill="none"
          stroke="#fb7185"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.88"
        />
        <circle cx="428" cy="452" r="2.5" fill="#f43f5e" />

        {/* Technical HUD Coordinates & Crosshairs (Top-Right) */}
        <g opacity="0.8">
          <path d="M 470 195 L 480 195 M 475 190 L 475 200" stroke="#38bdf8" strokeWidth="1" />
          <text x="488" y="193" fill="#94a3b8" fontSize="8.5" fontFamily="var(--font-jetbrains-mono), monospace" fontWeight="500">
            N 28.7041°
          </text>
          <text x="488" y="205" fill="#94a3b8" fontSize="8.5" fontFamily="var(--font-jetbrains-mono), monospace" fontWeight="500">
            E 77.1025°
          </text>
        </g>

        {/* Technical HUD Telemetry & Crosshairs (Bottom-Left) */}
        <g opacity="0.75">
          <path d="M 85 450 L 95 450 M 90 445 L 90 455" stroke="#a855f7" strokeWidth="1" />
          <text x="98" y="475" fill="#64748b" fontSize="8.5" fontFamily="var(--font-jetbrains-mono), monospace">
            0.0012
          </text>
          <text x="98" y="487" fill="#64748b" fontSize="8.5" fontFamily="var(--font-jetbrains-mono), monospace">
            0.0321
          </text>
          <text x="98" y="499" fill="#94a3b8" fontSize="8.5" fontFamily="var(--font-jetbrains-mono), monospace">
            + 0.9845
          </text>
        </g>

        {/* Fine Star Points in Outer Space */}
        <circle cx="75" cy="95" r="1.4" fill="#ffffff" opacity="0.85" />
        <circle cx="525" cy="85" r="1.6" fill="#67e8f9" opacity="0.95" />
        <circle cx="535" cy="380" r="1.3" fill="#c084fc" opacity="0.75" />
        <circle cx="85" cy="340" r="1.4" fill="#ffffff" opacity="0.65" />
        <circle cx="285" cy="45" r="1.8" fill="#ffffff" opacity="0.9" />
        <circle cx="340" cy="555" r="1.4" fill="#38bdf8" opacity="0.75" />

        {/* CENTRAL ENERGY SPHERE: NEXUS CORE */}
        {/* Outer Atmospheric Corona Ring */}
        <circle
          cx="300"
          cy="300"
          r="135"
          fill="none"
          stroke="url(#corona-rim-grad)"
          strokeWidth="3.8"
          filter="url(#corona-blur)"
          opacity="0.92"
        />
        <circle
          cx="300"
          cy="300"
          r="128"
          fill="none"
          stroke="rgba(34, 211, 238, 0.45)"
          strokeWidth="1.6"
        />

        {/* Planet Sphere Body */}
        <circle cx="300" cy="300" r="122" fill="url(#core-surface-grad)" />

        {/* Moving Energy Shimmer & Atmospheric Swirls */}
        <g className="animate-energy-shimmer motion-reduce:animate-none">
          <path
            d="M 195 260 C 230 230, 310 250, 390 220 C 370 270, 320 290, 260 280 Z"
            fill="rgba(56, 189, 248, 0.28)"
            filter="url(#glow-filter)"
          />
          <path
            d="M 210 330 C 260 360, 340 330, 400 350 C 360 380, 280 385, 220 360 Z"
            fill="rgba(192, 132, 252, 0.3)"
            filter="url(#glow-filter)"
          />
        </g>

        {/* Specular Sun Flare & Atmospheric Highlights */}
        <ellipse
          cx="260"
          cy="235"
          rx="34"
          ry="17"
          transform="rotate(-30 260 235)"
          fill="rgba(255, 255, 255, 0.48)"
          filter="url(#glow-filter)"
        />
        <circle cx="252" cy="230" r="4.8" fill="#ffffff" opacity="0.98" />

        {/* Center Sparkle Emblem Circle */}
        <circle
          cx="300"
          cy="268"
          r="26"
          fill="#09051d"
          stroke="rgba(34, 211, 238, 0.8)"
          strokeWidth="1.8"
          filter="url(#glow-filter)"
        />

        {/* 4-Point Star Cluster Icon */}
        <g transform="translate(300, 268)">
          <path
            d="M 0 -13 Q 0 0 13 0 Q 0 0 0 13 Q 0 0 -13 0 Q 0 0 0 -13 Z"
            fill="#ffffff"
          />
          <circle cx="7" cy="-7" r="2.2" fill="#67e8f9" />
          <circle cx="-6" cy="7" r="1.6" fill="#bae6fd" />
        </g>

        {/* Typography: NEXUS CORE */}
        <text
          x="300"
          y="320"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="16.5"
          fontWeight="800"
          letterSpacing="3"
          fontFamily="var(--font-space-grotesk), system-ui, sans-serif"
        >
          NEXUS CORE
        </text>

        {/* Typography: AI / ML SYSTEMS */}
        <text
          x="300"
          y="338"
          textAnchor="middle"
          fill="#67e8f9"
          fontSize="8.8"
          fontWeight="700"
          letterSpacing="3.5"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          AI / ML SYSTEMS
        </text>
      </svg>

      {/* Four Floating Glass-Style Technology Chips */}
      {CHIPS.map((chip, index) => (
        <motion.div
          key={chip.name}
          className={`absolute ${chip.position} orbit-float group z-20 flex items-center gap-2.5 rounded-xl border ${chip.borderClass} ${chip.glowClass} bg-[#090520]/92 px-3.5 py-2 sm:px-4 sm:py-2.5 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:brightness-110 motion-reduce:animate-none`}
          style={{ animationDelay: `${index * 0.75}s` }}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.08, y: -3 }}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${chip.dotColor} shadow-[0_0_10px_currentColor]`} />
          <Image
            src={chip.icon}
            alt={chip.name}
            width={24}
            height={24}
            className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
            draggable={false}
          />
          <span className="font-sans text-xs font-semibold tracking-wide text-gray-100 group-hover:text-white sm:text-sm">
            {chip.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
};
