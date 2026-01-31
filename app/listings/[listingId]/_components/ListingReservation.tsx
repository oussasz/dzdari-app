"use client";

import React from "react";
import { Range } from "react-date-range";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";

import Button from "@/components/Button";
import SpinnerMini from "@/components/Loader";
import { formatPrice } from "@/utils/helper";
import { durationCategories } from "@/utils/constants";

interface ListingReservationProps {
  price: number;
  duration?: string | null;
  dateRange: Range;
  totalPrice: number;
  onChangeDate: (name: string, value: Range) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  disabledDates: Date[];
}

const Calendar = dynamic(() => import("@/components/Calender"), {
  ssr: false,
});

const ListingReservation: React.FC<ListingReservationProps> = ({
  price,
  duration,
  dateRange,
  totalPrice,
  onChangeDate,
  onSubmit,
  disabledDates,
  isLoading,
}) => {
  const locale = useLocale();
  const t = useTranslations("Listing");

  const getDurationId = () => {
    if (!duration) return null;
    const match = durationCategories.find(
      (d) => d.id === duration || d.label === duration,
    );
    return match?.id ?? null;
  };

  const getDurationLabel = () => {
    switch (getDurationId()) {
      case "byNight":
        return t("night");
      case "perWeek":
        return t("week");
      case "perMonth":
        return t("month");
      case "per3Months":
        return t("threeMonths");
      case "perYear":
        return t("year");
      case "longTerm":
        return t("longTerm");
      default:
        return t("night");
    }
  };

  return (
    <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden">
      <div className="flex flex-row items-center gap-1 p-4">
        <span className="text-lg font-semibold">
          DZD {formatPrice(price, locale)}
        </span>
        <span className="font-light text-neutral-600">
          / {getDurationLabel()}
        </span>
      </div>
      <hr />
      <Calendar
        value={dateRange}
        disabledDates={disabledDates}
        onChange={onChangeDate}
      />
      <hr />
      <div className="p-4">
        <Button
          disabled={isLoading}
          onClick={onSubmit}
          className="flex flex-row items-center justify-center h-[42px] "
          size="large"
        >
          {isLoading ? <SpinnerMini /> : <span>{t("reserve")}</span>}
        </Button>
      </div>
      <hr />
      <div className="p-4 flex flex-row items-center justify-between font-semibold text-lg">
        <span>{t("total")}</span>
        <span>DZD {formatPrice(totalPrice, locale)}</span>
      </div>
    </div>
  );
};

export default ListingReservation;
