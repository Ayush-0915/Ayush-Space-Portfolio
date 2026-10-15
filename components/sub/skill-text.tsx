"use client";

import { SparklesIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

import {
  slideInFromLeft,
  slideInFromRight,
  slideInFromTop,
} from "@/lib/motion";

export const SkillText = () => {
  return (
    <div className="w-full h-auto flex flex-col items-center justify-center">
      <motion.div
        variants={slideInFromTop}
        className="Welcome-box py-[8px] px-[7px] border border-[#7042f88b] opacity-[0.9]]"
      >
        <SparklesIcon className="text-[#b49bff] mr-[10px] h-5 w-5" />
        <span className="Welcome-text font-sans text-[12px] font-semibold uppercase tracking-wider">
          AI/ML Core Toolset
        </span>
      </motion.div>

      <motion.div
        variants={slideInFromLeft(0.5)}
        className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mt-3 text-center mb-3"
      >
        Building modern AI systems, one model at a time.
      </motion.div>

      <motion.div
        variants={slideInFromRight(0.5)}
        className="font-sans text-sm sm:text-base text-gray-400 mb-8 mt-1 text-center max-w-lg"
      >
        From exploratory data analysis to production-ready ML pipelines.
      </motion.div>
    </div>
  );
};
