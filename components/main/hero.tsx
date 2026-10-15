import { HeroContent } from "@/components/sub/hero-content";

export const Hero = () => {
  return (
    <section
      id="hero"
      aria-label="Hero Section"
      className="relative flex min-h-[calc(100svh-65px)] w-full flex-col justify-center overflow-hidden pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-24 lg:pb-12"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[-180px] h-full w-full rotate-180 object-cover -z-20 opacity-70 sm:top-[-240px] lg:top-[-340px]"
      >
        <source src="/videos/blackhole.webm" type="video/webm" />
      </video>

      {/* Top subtle fade overlay to integrate smoothly with the fixed navbar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#030014] via-[#030014]/60 to-transparent -z-10"
      />

      <HeroContent />
    </section>
  );
};
