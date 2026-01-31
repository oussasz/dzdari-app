"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import throttle from "lodash.throttle";
import "swiper/css";
import { useTranslations } from "next-intl";

import CategoryBox from "./CategoryBox";
import {
  durationCategories,
  purposeCategories,
  featureCategories,
} from "@/utils/constants";

const Categories = () => {
  const t = useTranslations("Categories");
  const tDuration = useTranslations("DurationOptions");
  const tPurpose = useTranslations("PurposeOptions");
  const tFeature = useTranslations("FeatureOptions");

  const [isActive, setIsActive] = useState(false);
  const params = useSearchParams();
  const pathname = usePathname();
  const selectedPurposes = params?.getAll("category") ?? [];
  const selectedDurations = params?.getAll("duration") ?? [];
  const selectedFeatures = params?.getAll("feature") ?? [];

  const isMainPage = pathname === "/";

  const rafId = useRef<number | null>(null);
  const swiperRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const edgeZonePx = 120;
  const boostIntervalRef = useRef<number | null>(null);
  const isBoosted = useRef<boolean>(false);
  const baseSpeed = 8000; // Faster default
  const boostedSpeed = 2500; // 3x faster at edges

  const applyEdgeFade = useCallback((swiper: any) => {
    if (!swiper?.el || !swiper?.slides?.length) return;

    const ribbonRect = swiper.el.getBoundingClientRect();
    const fadeZone = 150; // px from edge where shrinking starts

    swiper.slides.forEach((slideEl: HTMLElement) => {
      const inner = slideEl.firstElementChild as HTMLElement | null;
      if (!inner) return;

      const slideRect = slideEl.getBoundingClientRect();
      const slideCenter = slideRect.left + slideRect.width / 2;

      // Distance from left and right edges
      const fromLeft = slideCenter - ribbonRect.left;
      const fromRight = ribbonRect.right - slideCenter;
      const edgeDist = Math.min(fromLeft, fromRight);

      // If within fade zone, shrink proportionally to zero
      if (edgeDist < fadeZone) {
        const t = edgeDist / fadeZone; // 0 at edge, 1 at fadeZone
        const scale = t; // Shrink to 0
        const opacity = t;
        inner.style.opacity = String(opacity);
        inner.style.transform = `scale(${scale})`;
      } else {
        inner.style.opacity = "1";
        inner.style.transform = "scale(1)";
      }

      inner.style.transformOrigin = "center";
      inner.style.willChange = "transform, opacity";
    });
  }, []);

  const scheduleEdgeFade = useCallback(
    (swiper: any) => {
      if (rafId.current !== null) return;
      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        applyEdgeFade(swiper);
      });
    },
    [applyEdgeFade],
  );

  const setSpeed = useCallback((speed: number) => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    swiper.params.speed = speed;

    // Restart autoplay with new speed
    if (swiper.autoplay?.running) {
      swiper.autoplay.stop();
      swiper.autoplay.start();
    }
  }, []);

  const startEdgeBoost = useCallback(() => {
    if (isBoosted.current) return;
    isBoosted.current = true;
    setSpeed(boostedSpeed);
  }, [boostedSpeed, setSpeed]);

  const stopEdgeBoost = useCallback(() => {
    if (!isBoosted.current) return;
    isBoosted.current = false;
    setSpeed(baseSpeed);
  }, [baseSpeed, setSpeed]);

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current);
      }

      if (boostIntervalRef.current !== null) {
        window.cancelAnimationFrame(boostIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };

    const throttledHandleScroll = throttle(handleScroll, 150);
    window.addEventListener("scroll", throttledHandleScroll);

    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, []);

  if (!isMainPage) {
    return null;
  }

  return (
    <div
      className={` ${
        isActive ? "shadow-md shadow-[rgba(0,0,0,.045)]" : ""
      } transition-all duration-150`}
    >
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        onMouseMove={(e) => {
          // Boost when mouse is in the left or right third of the viewport
          const viewportWidth = window.innerWidth;
          const mouseX = e.clientX;
          const oneThird = viewportWidth / 3;

          if (mouseX < oneThird || mouseX > viewportWidth - oneThird) {
            startEdgeBoost();
          } else {
            stopEdgeBoost();
          }
        }}
        onMouseLeave={() => stopEdgeBoost()}
      >
        <Swiper
          slidesPerView="auto"
          loop
          speed={baseSpeed}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          modules={[Autoplay]}
          pagination={{
            clickable: true,
          }}
          watchSlidesProgress
          onInit={(swiper) => {
            swiperRef.current = swiper;
            scheduleEdgeFade(swiper);
          }}
          onSetTranslate={(swiper) => scheduleEdgeFade(swiper)}
          onProgress={(swiper) => scheduleEdgeFade(swiper)}
          onResize={(swiper) => scheduleEdgeFade(swiper)}
          className="categories-ribbon-swiper mt-2 lg:!px-3 !px-2"
        >
          <SwiperSlide className="max-w-fit" key="group-duration">
            <div className="px-3 py-2 text-xs font-semibold text-neutral-500 select-none">
              {t("duration")}
            </div>
          </SwiperSlide>
          {durationCategories.map((item) => (
            <SwiperSlide className="max-w-fit" key={`duration-${item.label}`}>
              <CategoryBox
                label={item.label}
                displayLabel={tDuration(`${item.id}.label`)}
                icon={item.icon}
                queryKey="duration"
                selected={selectedDurations.includes(item.label)}
              />
            </SwiperSlide>
          ))}

          <SwiperSlide className="max-w-fit" key="divider-1">
            <div className="h-8 w-px bg-neutral-200 my-2 mx-2" />
          </SwiperSlide>

          <SwiperSlide className="max-w-fit" key="group-purpose">
            <div className="px-3 py-2 text-xs font-semibold text-neutral-500 select-none">
              {t("purpose")}
            </div>
          </SwiperSlide>
          {purposeCategories.map((item) => (
            <SwiperSlide className="max-w-fit" key={`purpose-${item.label}`}>
              <CategoryBox
                label={item.label}
                displayLabel={tPurpose(`${item.id}.label`)}
                icon={item.icon}
                queryKey="category"
                selected={selectedPurposes.includes(item.label)}
              />
            </SwiperSlide>
          ))}

          <SwiperSlide className="max-w-fit" key="divider-2">
            <div className="h-8 w-px bg-neutral-200 my-2 mx-2" />
          </SwiperSlide>

          <SwiperSlide className="max-w-fit" key="group-features">
            <div className="px-3 py-2 text-xs font-semibold text-neutral-500 select-none">
              {t("features")}
            </div>
          </SwiperSlide>
          {featureCategories.map((item) => (
            <SwiperSlide className="max-w-fit" key={`feature-${item.label}`}>
              <CategoryBox
                label={item.label}
                displayLabel={tFeature(`${item.id}.label`)}
                icon={item.icon}
                queryKey="feature"
                selected={selectedFeatures.includes(item.label)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Categories;
