"use client";

import {
  SparklesIcon,
  ArrowRightIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { NexusCoreVisual } from "@/components/sub/nexus-core-visual";
import {
  slideInFromLeft,
  slideInFromRight,
  slideInFromTop,
} from "@/lib/motion";

const CORE_TECH = [
  { label: "Python" },
  { label: "PyTorch & Scikit-learn" },
  { label: "Computer Vision & NLP" },
  { label: "FastAPI & MLOps" },
] as const;

export const HeroContent = () => {
  const shouldReduceMotion = useReducedMotion();

  const leftVariant = (delay: number) =>
    shouldReduceMotion
      ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
      : slideInFromLeft(delay);

  const rightVariant = (delay: number) =>
    shouldReduceMotion
      ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
      : slideInFromRight(delay);

  const topVariant = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : slideInFromTop;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="z-20 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-8 px-4 sm:px-6 md:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 xl:gap-14 lg:px-10 xl:px-14"
    >
      {/* Left Column: Core Identity, Headline, Pitch & CTAs */}
      <div className="flex flex-col justify-center gap-6 text-start min-w-0">
        {/* Recruiter-friendly availability badge */}
        <motion.div
          variants={topVariant}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/30 px-3.5 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(112,66,248,0.2)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-300 sm:text-sm">
            Available for AI/ML Opportunities
          </span>
          <span className="h-3 w-px bg-white/20" />
          <span className="flex items-center gap-1 text-xs font-semibold tracking-wide text-purple-200 sm:text-sm">
            <SparklesIcon className="h-3.5 w-3.5 text-cyan-400" />
            AI/ML Engineer
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          variants={leftVariant(0.4)}
          className="space-y-1 sm:space-y-2"
        >
          <h1 className="font-heading text-[clamp(2.35rem,4.5vw,4.125rem)] font-bold tracking-[-0.03em] text-white leading-[1.08]">
            Building Intelligent Systems.{" "}
            <span className="block mt-1 sm:mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-300">
              Exploring What&apos;s Next.
            </span>
          </h1>
        </motion.div>

        {/* Supporting Paragraph */}
        <motion.p
          variants={leftVariant(0.6)}
          className="max-w-[620px] xl:max-w-[660px] font-sans text-[15px] sm:text-base leading-[1.7] text-gray-300/90"
        >
          I&apos;m <span className="font-semibold text-white">Ayush Singh</span>, an AI/ML Engineer and B.Tech student specializing in machine learning pipelines, computer vision, and geospatial AI. From national hackathons to predictive modeling, I engineer data-driven systems designed for real-world impact.
        </motion.p>

        {/* Action Buttons: Explore Projects & Download Resume */}
        <motion.div
          variants={leftVariant(0.8)}
          className="flex flex-wrap items-center gap-3.5 pt-1 sm:gap-4"
        >
          {/* Primary CTA: Explore Projects */}
          <Link
            href="#projects"
            className="group relative inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 px-6 py-3.5 font-sans text-sm sm:text-base font-semibold text-white shadow-lg shadow-purple-900/30 transition-all duration-300 hover:shadow-cyan-500/25 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030014]"
            aria-label="Explore Ayush Singh's Projects"
          >
            <span>Explore Projects</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
          </Link>

          {/* Secondary CTA: Download Resume */}
          <a
            href="/resume/Updated-Ayush-Resume.pdf"
            download="Ayush_Singh_Resume.pdf"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-6 py-3.5 font-sans text-sm sm:text-base font-semibold text-gray-200 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/[0.12] hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030014]"
            aria-label="Download Ayush Singh's Resume PDF"
          >
            <ArrowDownTrayIcon className="h-4 w-4 text-cyan-400" />
            <span>Download Resume</span>
          </a>
        </motion.div>

        {/* Verified Technology Focus */}
        <motion.div
          variants={leftVariant(1.0)}
          className="flex flex-col gap-2 pt-2"
        >
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Verified Core Focus
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {CORE_TECH.map((tech) => (
              <span
                key={tech.label}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 font-sans text-xs font-medium text-gray-300 backdrop-blur-sm transition-colors duration-200 hover:border-purple-400/40 hover:text-white"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                {tech.label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Column: Gen-Z Nexus Core AI Universe Visualization */}
      <motion.div
        variants={rightVariant(0.7)}
        className="relative flex w-full min-w-0 items-center justify-center py-2 lg:py-0"
      >
        <NexusCoreVisual />
      </motion.div>
    </motion.div>
  );
};
