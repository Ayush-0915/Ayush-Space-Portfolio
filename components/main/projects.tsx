import { ProjectCard } from "@/components/sub/project-card";
import { PROJECTS } from "@/constants";
import { SparklesIcon } from "@heroicons/react/24/solid";

export const Projects = () => {
  return (
    <section
      id="projects"
      className="relative flex flex-col items-center justify-center px-4 py-16 sm:px-6 md:py-20 lg:py-24"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center justify-center text-center mb-10 sm:mb-14 px-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/30 px-3.5 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(112,66,248,0.2)] mb-3.5">
          <SparklesIcon className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
            Featured Engineering
          </span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
          Crafted{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-300">
            Projects & Systems
          </span>
        </h2>
        <p className="mt-3.5 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
          Production-grade machine learning classifiers, exploratory business intelligence dashboards, conversational AI assistants, and interactive 3D web applications.
        </p>
      </div>

      {/* Horizontal Cards List */}
      <div className="flex w-full max-w-[1360px] flex-col gap-6 sm:gap-7 lg:gap-8 px-2 sm:px-4 md:px-6">
        {PROJECTS.map((project, index) => (
          <ProjectCard
            key={project.title}
            project={project}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};
