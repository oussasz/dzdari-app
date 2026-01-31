"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Listing } from "@prisma/client";
import Skeleton from "react-loading-skeleton";
import { useLocale, useTranslations } from "next-intl";

import HeartButton from "./HeartButton";
import Image from "./Image";
import { formatPrice } from "@/utils/helper";
import ListingMenu from "./ListingMenu";
import { durationCategories, purposeCategories } from "@/utils/constants";

interface ListingCardProps {
  data: Listing;
  reservation?: {
    id: string;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
  };
  hasFavorited: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({
  data,
  reservation,
  hasFavorited,
}) => {
  const locale = useLocale();
  const tListing = useTranslations("Listing");
  const tPurpose = useTranslations("PurposeOptions");

  const price = reservation ? reservation.totalPrice : data?.price;

  let reservationDate;
  if (reservation) {
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    reservationDate = `${format(start, "PP")} - ${format(end, "PP")}`;
  }

  const categoryDisplay = (() => {
    const match = purposeCategories.find((c) => c.label === data.category);
    return match ? tPurpose(`${match.id}.label`) : data.category;
  })();

  const cardImageSrc = (() => {
    const raw = (data as any).images;
    if (typeof raw === "string" && raw) {
      try {
        const parsed = JSON.parse(raw);
        if (
          Array.isArray(parsed) &&
          parsed.length &&
          typeof parsed[0] === "string"
        ) {
          return parsed[0];
        }
      } catch {
        // ignore
      }
    }
    return data.imageSrc;
  })();

  const getDurationId = () => {
    const value = data.duration;
    if (!value) return null;
    const match = durationCategories.find(
      (d) => d.id === value || d.label === value,
    );
    return match?.id ?? null;
  };

  // Map duration to translation key
  const getDurationLabel = () => {
    switch (getDurationId()) {
      case "byNight":
        return tListing("night");
      case "perWeek":
        return tListing("week");
      case "perMonth":
        return tListing("month");
      case "per3Months":
        return tListing("threeMonths");
      case "perYear":
        return tListing("year");
      case "longTerm":
        return tListing("longTerm");
      default:
        return tListing("night");
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 p-3 flex items-center justify-between w-full">
        <div className="z-5">
          <ListingMenu id={reservation?.id || data.id} />
        </div>

        <div className="w-[28px] h-[28px] flex items-center justify-center">
          <HeartButton
            listingId={data.id}
            key={data.id}
            hasFavorited={hasFavorited}
          />
        </div>
      </div>
      <Link href={`/listings/${data.id}`} className="col-span-1 cursor-pointer">
        <div className="flex flex-col gap-1 w-full">
          <div className=" overflow-hidden md:rounded-xl rounded-md">
            <div className="aspect-[1/0.95] relative bg-gray-100">
              <Image
                imageSrc={cardImageSrc}
                fill
                alt={data.title}
                effect="zoom"
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </div>
          <span className="font-semibold text-[16px] mt-[4px]">
            {data?.region}, {data?.country}
          </span>
          <span className="font-light text-neutral-500 text-sm">
            {reservationDate || categoryDisplay}
          </span>

          <div className="flex flex-row items-baseline gap-1">
            <span className="font-bold text-[#444] text-[14px]">
              DZD {formatPrice(price, locale)}
            </span>
            {!reservation && (
              <span className="font-light">/ {getDurationLabel()}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;

export const ListingSkeleton = () => {
  return (
    <div className="col-span-1 ">
      <div className="flex flex-col gap-1 w-full">
        <Skeleton
          width={"100%"}
          height={"100%"}
          borderRadius={"12px"}
          className="aspect-square"
        />

        <div className="flex flex-row gap-3">
          <Skeleton height={"18px"} width={"84px"} />
          <Skeleton height={"18px"} width={"84px"} />
        </div>
        <Skeleton height={"16px"} width={"102px"} />
        <Skeleton height={"18px"} width={"132px"} />
      </div>
    </div>
  );
};
