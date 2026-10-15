"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrophyIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/solid";

interface ExperienceItem {
  period: string;
  event: string;
  role?: string;
  org: string;
  trackOrContext?: string;
  project?: {
    name: string;
    summary: string;
    repoUrl?: string;
  };
  achievement?: {
    label: string;
    type: "award" | "participant";
  };
  contributions: string[];
  capabilities?: string[];
  technologies?: string[];
}

const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    period: "October 2026",
    event: "AGNITIA '26 National-Level Hackathon",
    role: "Deployment & Documentation",
    org: "Prestige Institute of Engineering Management and Research (PIEMR), Indore",
    trackOrContext:
      "Team DeveloperX · Track: TERRA02 (Industrial Pollution Source Attribution Engine)",
    project: {
      name: "Air Kavach",
      summary:
        "Air Kavach is an Industrial Pollution Source Attribution Engine designed to investigate potential industrial sources of pollution using ambient air-quality observations, surface wind transport regimes, and geospatial facility screening.",
      repoUrl: "https://github.com/Afsar426/-AIR-KAVACH",
    },
    achievement: {
      label: "5th Place — National-Level Hackathon",
      type: "award",
    },
    contributions: [
      "Contributed to deployment preparation and technical documentation for the Air Kavach environmental intelligence platform.",
      "Documented system architecture, multi-provider telemetry ingestion, and forensic investigative workflows.",
      "Helped communicate the end-to-end technical solution, containerization strategy, and mathematical baseline models.",
      "Supported the live presentation and demonstration of the environmental AI solution during the 36-hour hackathon.",
    ],
    
    technologies: [
      "React.js",
      "Vite",
      "Python",
      "FastAPI",
      "Scikit-learn",
      "Isolation Forest",
      "Pandas",
      "NumPy",
      "GeoPandas",
      "Leaflet",
      "Docker",
    ],
  },
  {
    period: "September 2026",
    event: "Smart India Hackathon (SIH) 2026",
    role: "AI/ML Project Developer — SatQuery AI",
    org: "Ministry of Education & AICTE Initiative",
    trackOrContext:
      "Problem Statement: SIH26167 · Domain: Geospatial AI & Remote Sensing",
    project: {
      name: "SatQuery AI",
      summary:
        "SatQuery AI is a vision-language assistant designed to simplify satellite remote-sensing analysis through natural-language queries, combining multimodal Earth observation understanding with agentic specialist routing.",
      repoUrl: "https://github.com/Ayush-0915/SATQUERY-2.0",
    },
    achievement: {
      label: "SIH 2026 Participant · Problem SIH26167",
      type: "participant",
    },
    contributions: [
      "Participated in Smart India Hackathon 2026 and worked on national problem statement SIH26167.",
      "Contributed to the development of SatQuery AI, an AI solution designed for natural-language interaction with satellite imagery.",
      "Worked on problem analysis and multimodal workflows addressing remote-sensing analysis and geospatial intelligence.",
      "Collaborated with teammates on project development, testing, and hackathon deliverables.",
    ],

    technologies: [
      "Python",
      "PyTorch",
      "Hugging Face Transformers",
      "Computer Vision",
      "FastAPI",
    ],
  },
  {
    period: "2024–Present",
    event: "AI/ML Project Developer",
    org: "Self-Learning & Personal Projects",
    contributions: [
      "Designed and developed end-to-end Machine Learning projects for real-world problem solving.",
      "Built interactive dashboards and deployment apps using Streamlit and Python.",
      "Worked on data preprocessing, feature engineering, model training, and evaluation.",
      "Created projects like Car Evaluation System, Netflix Data Analysis, and Uber Trips Data Analysis.",
      "Continuously improving skills through hands-on practice, certifications, and new technologies.",
    ],
    technologies: [
      "Python",
      "Scikit-learn",
      "Pandas",
      "NumPy",
      "Streamlit",
      "Power BI",
    ],
  },
  {
    period: "2024–2028",
    event: "B.Tech Student in AI/ML",
    org: "Sage University, Indore",
    contributions: [
      "Pursuing Bachelor of Technology in Artificial Intelligence and Machine Learning.",
      "Building strong expertise in Machine Learning, Deep Learning, and Data Science.",
      "Developing real-world projects using Python, Streamlit, SQL, and ML frameworks.",
      "Exploring advanced concepts in Computer Vision, NLP, and Predictive Analytics.",
      "Actively participating in hackathons, coding challenges, and technical events.",
    ],
    technologies: [
      "Machine Learning",
      "Deep Learning",
      "Data Science",
      "Python",
      "SQL",
    ],
  },
];

export const Experience = () => {
  return (
    <motion.section
      id="experience"
      initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative mx-auto mt-8 w-full max-w-6xl px-5 py-20 md:mt-12 md:px-8"
    >
      <h2 className="font-heading mb-10 text-2xl font-bold tracking-tight text-white sm:text-3xl md:mb-14 md:text-4xl">
        My Work Experience
      </h2>

      <div className="relative px-1 md:px-2">
        {/* Continuous space-themed timeline vertical line */}
        <div className="absolute left-[9px] top-3 h-[97%] w-px bg-gradient-to-b from-amber-400/60 via-cyan-400/50 via-violet-500/40 to-transparent md:left-3" />

        <div className="space-y-14 md:space-y-20">
          {EXPERIENCE_DATA.map((item, index) => {
            const isAward = item.achievement?.type === "award";
            const isParticipant = item.achievement?.type === "participant";

            return (
              <motion.article
                key={item.event}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true, amount: 0.15 }}
                className="relative grid items-start gap-8 pl-8 md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)] md:gap-12 md:pl-12"
              >
                {/* Timeline node marker */}
                <span
                  className={`absolute left-0 top-2.5 flex h-4 w-4 items-center justify-center rounded-full border bg-[#0a0f24] transition-all duration-300 ${
                    isAward
                      ? "border-amber-400/90 shadow-[0_0_18px_rgba(251,191,36,0.5)] ring-2 ring-amber-400/30"
                      : isParticipant
                      ? "border-cyan-300/80 shadow-[0_0_16px_rgba(34,211,238,0.4)] ring-2 ring-cyan-400/20"
                      : "border-violet-400/60 shadow-[0_0_14px_rgba(167,139,250,0.3)]"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isAward
                        ? "bg-amber-400 animate-pulse"
                        : isParticipant
                        ? "bg-cyan-400"
                        : "bg-violet-400"
                    }`}
                  />
                </span>

                {/* Left Column: Period, Title, Org, Role, Achievement Badge & Repo Link */}
                <div className="flex flex-col">
                  <h3 className="font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    {item.period}
                  </h3>

                  <p className="font-heading mt-2 text-xl font-bold leading-snug text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-cyan-200 to-white sm:text-2xl">
                    {item.event}
                  </p>

                  {item.role && (
                    <p className="font-sans mt-1.5 text-sm font-semibold text-cyan-300">
                      {item.role}
                    </p>
                  )}

                  <p className="font-sans mt-1 text-xs sm:text-sm font-medium leading-relaxed text-gray-300/90">
                    {item.org}
                  </p>

                  {item.trackOrContext && (
                    <p className="font-mono mt-0.5 text-xs text-gray-400/80 leading-relaxed">
                      {item.trackOrContext}
                    </p>
                  )}

                  {/* Prominent Achievement Badge */}
                  {item.achievement && (
                    <div
                      className={`font-sans mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm transition-all duration-300 ${
                        isAward
                          ? "border-amber-400/50 bg-gradient-to-r from-amber-500/20 via-purple-500/15 to-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                          : "border-cyan-400/40 bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-transparent text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.18)]"
                      }`}
                    >
                      {isAward ? (
                        <TrophyIcon className="h-4 w-4 text-amber-400 shrink-0" />
                      ) : (
                        <SparklesIcon className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      )}
                      <span className="leading-tight">
                        {item.achievement.label}
                      </span>
                    </div>
                  )}

                  {/* Verified Project Repository Link */}
                  {item.project?.repoUrl && (
                    <a
                      href={item.project.repoUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200 transition-colors duration-200 group w-fit"
                    >
                      <span>Explore {item.project.name} Repository</span>
                      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  )}
                </div>

                {/* Right Column: Project Mission, Contributions, Capabilities & Tech Badges */}
                <div className="flex flex-col">
                  {/* Project Overview Callout */}
                  {item.project && (
                    <div className="mb-4 rounded-lg border border-[#7042f840] bg-[#0c0728]/80 p-3.5 sm:p-4 backdrop-blur-sm shadow-md">
                      <div className="font-mono mb-1 text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                        Project Overview · {item.project.name}
                      </div>
                      <p className="font-sans text-sm leading-[1.68] text-gray-200">
                        {item.project.summary}
                      </p>
                    </div>
                  )}

                  {/* Key Contributions */}
                  <div className="font-mono mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    Key Contributions &amp; Scope
                  </div>
                  <ul className="font-sans list-disc space-y-2 pl-5 text-sm leading-[1.68] text-gray-300/90">
                    {item.contributions.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>

                  {/* Verified Capabilities (if present) */}
                  {item.capabilities && item.capabilities.length > 0 && (
                    <div className="mt-4">
                      <div className="font-mono mb-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
                        Verified System Capabilities
                      </div>
                      <ul className="font-sans list-disc space-y-1.5 pl-5 text-sm leading-[1.68] text-gray-300/90">
                        {item.capabilities.map((cap) => (
                          <li key={cap}>{cap}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Technology Badges */}
                  {item.technologies && item.technologies.length > 0 && (
                    <div className="mt-5 pt-1">
                      <div className="font-mono mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Technologies &amp; Tools
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="font-sans rounded-md border border-violet-500/30 bg-violet-950/40 px-2.5 py-0.5 text-xs font-medium text-cyan-200 shadow-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};
