"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/solid";
import awsCertificate from "@/app/AWS.jpeg";
import genAiCertificate from "@/app/Gen AI.png";
import microsoftCertificate from "@/app/Microsoft.png";
import oracleDatabaseCertificate from "@/app/Oracle database .jpeg";
import oracleCertificate from "@/app/Oracle Certificate.jpg";
import virtualInternshipCertificate from "@/app/Virtual Internship Certificate.jpg";

const CERTIFICATES = [
  {
    title: "Virtual Internship",
    issuer: "Certificate",
    period: "2026",
    details:
      "Successfully completed a virtual internship focused on practical AI/ML workflows, real-world problem solving, and professional project execution.",
    image: virtualInternshipCertificate,
  },
  {
    title: "Oracle Certificate",
    issuer: "Oracle",
    period: "2025",
    details:
      "Completed Oracle certification training that strengthened database fundamentals, SQL proficiency, and industry-ready technical practices.",
    image: oracleCertificate,
  },
  {
    title: "Microsoft Azure 900 Fundamentals",
    issuer: "Microsoft",
    period: "2025",
    details:
      "Earned foundational cloud certification covering Azure core services, security, pricing, and cloud concepts for modern solution building.",
    image: microsoftCertificate,
  },
  {
    title: "Google Cloud Gen AI Certificate",
    issuer: "Google Cloud",
    period: "2026",
    details:
      "Completed Google Cloud Generative AI learning track with hands-on understanding of foundation models, prompt design, and applied Gen AI workflows.",
    image: genAiCertificate,
  },
  {
    title: "AWS ML Foundation",
    issuer: "AWS",
    period: "2025",
    details:
      "Completed AWS Machine Learning Foundation training covering core ML concepts, AWS ML services, and practical cloud-based model workflows.",
    image: awsCertificate,
  },
  {
    title: "Database Foundation Oracle Certificate",
    issuer: "Oracle",
    period: "2025",
    details:
      "Completed Oracle Database Foundation certification focused on relational database concepts, SQL fundamentals, and practical data management skills.",
    image: oracleDatabaseCertificate,
  },
] as const;

export const Certificates = () => {
  const [activeCertificate, setActiveCertificate] = useState<(typeof CERTIFICATES)[number] | null>(null);

  return (
    <>
      <motion.section
        id="certificates"
        initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-18 md:px-8 md:py-20"
      >
        <div className="Welcome-box mx-auto mb-8 border border-[#7042f88b] px-[7px] py-[8px] opacity-[0.9] sm:mb-10 md:mb-14">
          <SparklesIcon className="mr-[10px] h-5 w-5 text-[#b49bff]" />
          <span className="Welcome-text font-sans text-[12px] font-semibold uppercase tracking-wider">My Certificates</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {CERTIFICATES.map((certificate, index) => (
            <motion.button
              key={certificate.title}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              viewport={{ once: true, amount: 0.25 }}
              onClick={() => setActiveCertificate(certificate)}
              className="flex h-full flex-col rounded-2xl border border-violet-400/25 bg-[rgba(10,15,36,0.75)] p-4 text-left shadow-[0_0_24px_rgba(76,29,149,0.2)] backdrop-blur-sm transition hover:border-cyan-300/60 sm:p-5"
            >
              <div className="relative mb-4 h-44 overflow-hidden rounded-lg border border-white/10 bg-[#0b122f] p-2 sm:h-52 md:h-48 lg:h-56">
                <Image
                  src={certificate.image}
                  alt={`${certificate.title} certificate preview`}
                  className="h-full w-full rounded object-contain"
                  priority
                />
              </div>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-cyan-300/90">{certificate.period}</p>
              <h3 className="font-heading mt-2 text-lg font-bold leading-tight text-gray-100 sm:text-xl">{certificate.title}</h3>
              <p className="font-sans mt-1.5 text-xs sm:text-sm font-medium text-violet-200">{certificate.issuer}</p>
              <p className="font-sans mt-2.5 text-xs sm:text-sm leading-relaxed text-gray-300/90">{certificate.details}</p>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {activeCertificate && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/85 p-3 sm:items-center sm:p-4"
          onClick={() => setActiveCertificate(null)}
        >
          <button
            type="button"
            onClick={() => setActiveCertificate(null)}
            className="absolute right-3 top-3 z-10 rounded-full border border-white/40 bg-black/45 px-3 py-1 text-sm font-semibold text-white hover:border-cyan-300 hover:text-cyan-300 sm:right-4 sm:top-4"
          >
            Close
          </button>

          <div
            className="relative mt-12 w-full max-w-sm overflow-auto rounded-xl border border-white/20 bg-[#050816] p-1.5 sm:mt-0 sm:max-h-[90vh] sm:max-w-3xl sm:p-2 lg:max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={activeCertificate.image}
              alt={`${activeCertificate.title} full certificate`}
              className="h-auto w-full rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};