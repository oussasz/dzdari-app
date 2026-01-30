"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import throttle from "lodash.throttle";
import "swiper/css";

import CategoryBox from "./CategoryBox";
import {
  durationCategories,
  purposeCategories,
  featureCategories,
} from "@/utils/constants";
import { Category } from "@/types";

const Categories = () => {
  const [isActive, setIsActive] = useState(false);
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
        loop
        speed={14000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        modules={[Autoplay]}
        pagination={{
          clickable: true,
        }}
        className="categories-ribbon-swiper main-container mt-2 lg:!px-3 !px-2"
      >
        <SwiperSlide className="max-w-fit" key="group-duration">
          <div className="px-3 py-2 text-xs font-semibold text-neutral-500 select-none">
            Duration
          </div>
        </SwiperSlide>
        {durationCategories.map((item: Category) => (
          <SwiperSlide className="max-w-fit" key={`duration-${item.label}`}>
            <CategoryBox
              label={item.label}
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
            Purpose
          </div>
        </SwiperSlide>
        {purposeCategories.map((item: Category) => (
          <SwiperSlide className="max-w-fit" key={`purpose-${item.label}`}>
            <CategoryBox
              label={item.label}
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
            Features
          </div>
        </SwiperSlide>
        {featureCategories.map((item: Category) => (
          <SwiperSlide className="max-w-fit" key={`feature-${item.label}`}>
            <CategoryBox
              label={item.label}
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
