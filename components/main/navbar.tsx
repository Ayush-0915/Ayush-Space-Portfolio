'use client';
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { NAV_LINKS, SOCIALS } from "@/constants";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#about-me");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      for (const item of NAV_LINKS) {
        const sectionId = item.link.replace("#", "");
        const section = document.getElementById(sectionId);

        if (!section) {
          continue;
        }

        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          setActiveLink(item.link);
          break;
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 z-50 h-[65px] w-full bg-[#03001427] px-3 shadow-lg shadow-[#2A0E61]/50 backdrop-blur-md sm:px-6 lg:px-10">
      {/* Navbar Container */}
      <div className="m-auto flex h-full w-full max-w-7xl items-center justify-between px-1 sm:px-2">
        {/* Logo + Name */}
        <Link
          href="#about-me"
          className="flex items-center"
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={70}
            height={70}
            draggable={false}
            className="h-12 w-12 cursor-pointer object-contain sm:h-14 sm:w-14"
          />
          <div className="ml-2.5 hidden font-heading text-sm sm:text-base font-bold tracking-tight text-white lg:flex">Ayush Singh</div>
        </Link>

        {/* Web Navbar */}
        <div className="hidden h-full flex-1 flex-row items-center justify-end md:flex md:pl-6 lg:pl-10">
          <div className="flex h-auto w-full max-w-[780px] items-center justify-between rounded-full border border-[rgba(112,66,248,0.38)] bg-[rgba(3,0,20,0.37)] px-3 py-2 text-gray-200 lg:px-5">
            {NAV_LINKS.map((link) => {
              const isActive = activeLink === link.link;

              return (
                <Link
                  key={link.title}
                  href={link.link}
                  onClick={() => setActiveLink(link.link)}
                  className={`font-sans whitespace-nowrap rounded-full border px-3 py-1.5 text-xs lg:text-[13px] font-medium tracking-wide transition-all duration-300 ${
                    isActive
                      ? "border-cyan-400/70 bg-cyan-500/20 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.28)]"
                      : "border-transparent text-gray-200 hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-violet-200"
                  }`}
                >
                  {link.title}
                </Link>
              );
            })}

          </div>
        </div>

        {/* Social Icons (Web) */}
        <div className="hidden flex-row gap-4 pl-4 lg:flex">
          {SOCIALS.map(({ link, name, icon: Icon }) => (
            <Link
              href={link}
              target="_blank"
              rel="noreferrer noopener"
              key={name}
            >
              <Icon className="h-5 w-5 text-white transition-colors duration-200 hover:text-cyan-300" />
            </Link>
          ))}
        </div>

        {/* Hamburger Menu */}
        <button
          className="text-3xl text-white focus:outline-none md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 top-[65px] w-full border-t border-white/10 bg-[#030014] p-5 text-gray-300 md:hidden">
          {/* Links */}
          <div className="flex flex-col items-center gap-3">
            {NAV_LINKS.map((link) => {
              const isActive = activeLink === link.link;

              return (
                <Link
                  key={link.title}
                  href={link.link}
                  className={`font-sans w-full max-w-xs rounded-full border px-4 py-2 text-center text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "border-cyan-400/70 bg-cyan-500/20 text-cyan-200"
                      : "border-transparent text-gray-200 hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-violet-200"
                  }`}
                  onClick={() => {
                    setActiveLink(link.link);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {link.title}
                </Link>
              );
            })}
          </div>

          {/* Social Icons */}
          <div className="mt-6 flex justify-center gap-6">
            {SOCIALS.map(({ link, name, icon: Icon }) => (
              <Link
                href={link}
                target="_blank"
                rel="noreferrer noopener"
                key={name}
              >
                <Icon className="h-8 w-8 text-white" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};