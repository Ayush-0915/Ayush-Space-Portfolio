'use client';

import { motion } from "framer-motion";
import { slideInFromLeft, slideInFromTop } from "@/lib/motion";
import { SparklesIcon } from "@heroicons/react/24/solid";

export const About = () => {
  return (
    <section
      id="about-me"
      className="flex flex-col items-center justify-center px-6 py-16 sm:px-10 md:py-20 lg:px-20"
    >
      <motion.div
        variants={slideInFromTop}
        className="Welcome-box py-[8px] px-[7px] border border-[#7042f88b] opacity-[0.9] mb-[20px]"
      >
        <SparklesIcon className="text-[#b49bff] mr-[10px] h-5 w-5" />
        <span className="Welcome-text font-sans text-[12px] font-semibold uppercase tracking-wider">About Me</span>
      </motion.div>

      <motion.h2
        variants={slideInFromLeft(0.3)}
        className="mb-5 font-heading text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-300"
      >
        Who am I?
      </motion.h2>

      <motion.div
        variants={slideInFromLeft(0.5)}
        className="max-w-[760px] text-center font-sans text-[15px] sm:text-base leading-[1.75] text-gray-300/90 space-y-3.5"
      >
        <p>
          I&apos;m an <span className="text-white font-semibold">AI/ML Engineer</span> and undergraduate researcher pursuing a Bachelor of Technology in Artificial Intelligence and Machine Learning at Sage University, Indore.
        </p>

        <p>
          My focus centers on designing robust machine learning pipelines, predictive modeling, and applied computer vision. From national hackathon platforms to exploratory data dashboards, I combine clean architecture with data-driven algorithms to engineer solutions that deliver measurable real-world value.
        </p>
      </motion.div>

    </section>
  );
};
