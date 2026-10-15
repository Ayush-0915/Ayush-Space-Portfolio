"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { slideInFromTop } from "@/lib/motion";

export const Encryption = () => {
  return (
    <div className="relative flex h-full min-h-[70vh] w-full flex-row items-center justify-center overflow-hidden px-4 py-12 sm:min-h-[80vh] sm:py-16 md:min-h-screen -z-20">
      <div className="absolute w-auto h-auto top-0 z-[5]">
        <motion.div
          variants={slideInFromTop}
          className="px-2 text-center font-heading text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl"
        >
          Performance{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">
            &
          </span>{" "}
          security.
        </motion.div>
      </div>

      <div className="flex flex-col items-center justify-center translate-y-[-50px] absolute z-[20] w-auto h-auto">
        <div className="flex flex-col items-center group cursor-pointer w-auto h-auto">
          <Image
            src="/lock-top.png"
            alt="Lock top"
            width={50}
            height={50}
            className="translate-y-5 transition-all duration-200 group-hover:translate-y-11"
          />
          <Image
            src="/lock-main.png"
            alt="Lock main"
            width={70}
            height={70}
            className="z-10"
          />
        </div>

        <div className="Welcome-box px-[15px] py-[4px] z-[20] border my-[20px] border-[#7042F88B] opacity-[0.9]">
          <span className="Welcome-text font-sans text-[12px] font-semibold uppercase tracking-wider">Encryption</span>
        </div>
      </div>

      <div className="absolute bottom-[10px] z-[20] px-[5px]">
        <div className="cursive font-cursive px-2 text-center text-base font-normal text-gray-300 sm:text-xl">
          Secure your data with end-to-end encryption.
        </div>
      </div>

      <div className="w-full flex items-start justify-center absolute">
        <video
          loop
          muted
          autoPlay
          playsInline
          preload="false"
          className="h-auto w-full"
        >
          <source src="/videos/encryption-bg.webm" type="video/webm" />
        </video>
      </div>
    </div>
  );
};
