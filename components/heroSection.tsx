"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["700"], // choose the weights you need
  variable: "--font-dm-sans",
});

const images = ["/images/Hero1.jpg", "/images/Hero2.jpg", "/images/Hero3.jpg"];

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000); // 4 seconds per image

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden bg-black">
      {images.map((img, i) => (
        <Image
          key={i}
          src={img}
          alt="Hero image"
          fill
          priority={i === 0}
          className={`object-cover transition-opacity duration-4000 ${
            index === i ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {/* 
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
        <div /> 
        <div className="flex items-center justify-center bg-[#F7F4EF]/80 md:bg-[#F7F4EF]">
          <h2
            className={`${dmSans.className} text-lg md:text-xl lg:text-2xl text-[#ABC3E5] max-w-xs text-center px-6"`}
          >
            The Body Flows, <br /> The Aura Flows.
          </h2>
        </div>
      </div> 
*/}
    </div>
  );
}
