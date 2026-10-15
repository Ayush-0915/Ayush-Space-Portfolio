"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { RxGithubLogo } from "react-icons/rx";
import {
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import type { ProjectItem } from "@/constants";

export type ProjectCardProps = {
  project?: ProjectItem;
  // Backward compatibility props
  src?: string;
  title?: string;
  description?: string;
  link?: string;
  index?: number;
};

export const ProjectCard = ({
  project,
  src,
  title: fallbackTitle,
  description: fallbackDescription,
  link: fallbackLink,
  index = 0,
}: ProjectCardProps) => {
  const shouldReduceMotion = useReducedMotion();

  // Normalize project properties with backward-compatible fallbacks
  const title = project?.title ?? fallbackTitle ?? "Project";
  const category = project?.category ?? "AI/ML Project";
  const description = project?.description ?? fallbackDescription ?? "";
  const image = project?.image ?? src ?? "/projects/project-1.png";
  const githubUrl = project?.githubUrl ?? project?.link ?? fallbackLink ?? "#";
  const liveDemoUrl = project?.liveDemoUrl ?? null;
  const completedDate = project?.completedDate ?? "2025–2026";
  const status = project?.status ?? "Completed";
  const technologies = project?.technologies ?? ["Python", "Machine Learning"];

  const primaryLink = liveDemoUrl || githubUrl;

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.45,
        delay: shouldReduceMotion ? 0 : Math.min(index * 0.08, 0.4),
        ease: "easeOut",
      }}
      className="group relative flex flex-col md:flex-row md:items-stretch overflow-hidden rounded-2xl border border-purple-500/20 bg-[#09051d]/85 p-4 sm:p-5 lg:p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_28px_rgba(112,66,248,0.22),0_0_12px_rgba(6,182,212,0.18)] motion-reduce:hover:translate-y-0 gap-5 lg:gap-6"
    >
      {/* Subtle Ambient Hover Glow Accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100 opacity-30"
      />

      {/* =========================================================================
          LEFT COLUMN — Project Image (30% desktop width / ~220px tablet / full mobile)
          ========================================================================= */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#120a33]/60 shadow-[0_0_15px_rgba(112,66,248,0.12)] transition-shadow duration-300 group-hover:shadow-[0_0_24px_rgba(34,211,238,0.25)] md:aspect-auto md:w-[220px] lg:w-[30%] min-h-[175px] sm:min-h-[195px]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 240px, 420px"
          unoptimized
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
        />
        {/* Subtle overlay gradient vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09051d]/75 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-30" />
      </div>

      {/* =========================================================================
          CENTER COLUMN — Project Information (Flexible width)
          ========================================================================= */}
      <div className="flex flex-1 min-w-0 flex-col justify-between gap-3 sm:gap-3.5">
        <div className="space-y-2">
          {/* Category & Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
              {category}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-sans text-[11px] font-medium ${
                status === "Completed"
                  ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
                  : status === "Live Experience"
                  ? "border-purple-500/30 bg-purple-950/40 text-purple-300"
                  : "border-amber-500/30 bg-amber-950/40 text-amber-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status === "Completed"
                    ? "bg-emerald-400"
                    : status === "Live Experience"
                    ? "bg-purple-400"
                    : "bg-amber-400"
                }`}
              />
              {status}
            </span>
          </div>

          {/* Project Title */}
          <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-cyan-300">
            <a
              href={primaryLink}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
            >
              {title}
            </a>
          </h3>

          {/* Concise Problem & Solution Description */}
          <p className="font-sans text-sm leading-[1.68] text-gray-300/90 sm:text-[15px]">
            {description}
          </p>
        </div>

        {/* Technology Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-sans text-xs font-medium text-gray-300 backdrop-blur-sm transition-colors duration-200 hover:border-purple-400/40 hover:text-white"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* =========================================================================
          RIGHT COLUMN — Project Metadata (Desktop / Tablet column: ~120-150px)
          ========================================================================= */}
      <div className="hidden md:flex md:w-[130px] lg:w-[145px] xl:w-[150px] shrink-0 flex-col justify-between border-l border-white/10 pl-4 lg:pl-5 gap-3">
        {/* Top Actions: GitHub & Optional Live Demo */}
        <div className="flex flex-col gap-2">
          {/* GitHub Repository Link */}
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="group/btn inline-flex w-full items-center justify-between rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:border-cyan-400/50 hover:bg-white/[0.12] hover:text-cyan-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label={`View ${title} repository on GitHub`}
          >
            <span className="flex items-center gap-1.5">
              <RxGithubLogo className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>GitHub</span>
            </span>
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-gray-400 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover/btn:text-cyan-400 motion-reduce:group-hover/btn:translate-x-0 shrink-0" />
          </a>

          {/* Live Demo Link (when available) */}
          {liveDemoUrl && (
            <a
              href={liveDemoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="group/demo inline-flex w-full items-center justify-between rounded-lg border border-purple-500/40 bg-gradient-to-r from-purple-900/40 to-cyan-900/40 px-3 py-2 text-xs font-semibold text-purple-200 transition-all duration-200 hover:border-cyan-400 hover:bg-cyan-950/50 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label={`View live demo of ${title}`}
            >
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                </span>
                <span>Live Demo</span>
              </span>
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-cyan-400 transition-transform duration-200 group-hover/demo:translate-x-0.5 group-hover/demo:-translate-y-0.5 motion-reduce:group-hover/demo:translate-x-0 shrink-0" />
            </a>
          )}
        </div>

        {/* Bottom: Completion Month & Year */}
        <div className="flex flex-col gap-0.5 pt-2 border-t border-white/5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Completed
          </span>
          <span className="font-mono text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <CalendarDaysIcon className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <span>{completedDate}</span>
          </span>
        </div>
      </div>

      {/* =========================================================================
          MOBILE METADATA FOOTER (< md screens)
          ========================================================================= */}
      <div className="flex md:hidden items-center justify-between border-t border-white/10 pt-3.5 mt-1">
        {/* Left: Completion Date */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
          <CalendarDaysIcon className="h-3.5 w-3.5 text-purple-400 shrink-0" />
          <span>{completedDate}</span>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {liveDemoUrl && (
            <a
              href={liveDemoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 rounded-lg border border-purple-500/40 bg-purple-950/40 px-2.5 py-1.5 text-xs font-semibold text-purple-200 hover:border-cyan-400 hover:text-white"
              aria-label={`View live demo of ${title}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>Demo</span>
              <ArrowTopRightOnSquareIcon className="h-3 w-3" />
            </a>
          )}
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-xs font-semibold text-white hover:border-cyan-400 hover:text-cyan-300"
            aria-label={`View ${title} repository on GitHub`}
          >
            <RxGithubLogo className="h-3.5 w-3.5 text-cyan-400" />
            <span>GitHub</span>
            <ArrowTopRightOnSquareIcon className="h-3 w-3 text-gray-400" />
          </a>
        </div>
      </div>
    </motion.article>
  );
};
