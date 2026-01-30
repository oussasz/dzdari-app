"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Scrollbar } from "swiper/modules";
import throttle from "lodash.throttle";
import "swiper/css";
import "swiper/css/scrollbar";
import type { Swiper as SwiperType } from "swiper";
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
  const swiperRef = useRef<SwiperType | null>(null);
  const params = useSearchParams();
  const pathname = usePathname();
  const selectedPurposes = params?.getAll("category") ?? [];
  const selectedDurations = params?.getAll("duration") ?? [];
  const selectedFeatures = params?.getAll("feature") ?? [];

  const isMainPage = pathname === "/";

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
      <Swiper
        slidesPerView="auto"
        // NOTE: We intentionally avoid `loop` because it makes the scrollbar progress
        // jitter/oscillate (loop duplicates slides). We use `rewind` to get a clean
        // beginning/end feel while still cycling.
        rewind
        speed={9000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        scrollbar={{
          draggable: true,
          hide: false,
        }}
        modules={[Autoplay, Scrollbar]}
        pagination={{
          clickable: true,
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;

          const resume = () => swiper.autoplay?.resume?.();
          swiper.on("touchStart", resume);
          swiper.on("touchEnd", resume);
          swiper.on("sliderMove", resume);
          swiper.on("scrollbarDragMove", resume);
          swiper.on("scrollbarDragEnd", resume);
        }}
        className="categories-ribbon-swiper main-container mt-2 lg:!px-3 !px-2 pb-6"
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
  );
};

export default Categories;
