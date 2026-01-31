"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Image from "next/image";

interface HeroProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

const Hero = ({ title, subtitle, children }: HeroProps) => {
  const heroImages = [
    "/images/hero.webp",
    "/images/hero1.webp",
    "/images/hero2.webp",
    "/images/hero3.webp",
    "/images/hero4.webp",
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [heroImages.length]);

  return (
    <section className="relative z-10 w-full overflow-visible bg-white">
      <div className="absolute inset-0 -z-10">
        {heroImages.map((src, idx) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={idx === 0}
            className={
              "object-cover object-center transition-opacity duration-1000 ease-in-out " +
              (idx === activeIndex ? "opacity-100" : "opacity-0")
            }
            sizes="100vw"
          />
        ))}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.45)_45%,rgba(255,255,255,0.18)_70%,rgba(255,255,255,0)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-white/25 to-white"
        />
      </div>

      <div className="main-container relative py-14 md:py-24 min-h-[420px] md:min-h-[600px] flex items-center">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <Image
              src="/images/logo.png"
              alt="Lugario"
              width={160}
              height={60}
              priority
              className="h-9 w-auto md:h-12"
            />
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-neutral-900 md:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 md:text-base">
            {subtitle}
          </p>

          {children ? (
            <div className="mt-6 flex justify-center">
              <div className="w-full max-w-[720px]">{children}</div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default Hero;
