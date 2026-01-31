"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { formatISO } from "date-fns";
import { IoMdClose } from "react-icons/io";
import { useLocale, useTranslations } from "next-intl";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import AlgeriaLocationSelect from "@/components/inputs/AlgeriaLocationSelect";

const Calendar = dynamic(() => import("@/components/Calender"), { ssr: false });

type SearchMode = "location" | "date";

export default function SearchPanel({
  mode,
  onClose,
}: {
  mode: SearchMode;
  onClose: () => void;
}) {
  const t = useTranslations("SearchModal");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = useMemo(() => {
    if (!searchParams) return {};
    return queryString.parse(searchParams.toString());
  }, [searchParams]);

  const hasExistingDates = useMemo(() => {
    return Boolean(currentQuery.startDate && currentQuery.endDate);
  }, [currentQuery.endDate, currentQuery.startDate]);

  const [hasPickedDates, setHasPickedDates] =
    useState<boolean>(hasExistingDates);

  const { handleSubmit, setValue, watch, getValues } = useForm<FieldValues>({
    defaultValues: {
      location: null,
      wilayaCode: "",
      municipality: "",
      dateRange: {
        startDate:
          typeof currentQuery.startDate === "string"
            ? new Date(currentQuery.startDate)
            : new Date(),
        endDate:
          typeof currentQuery.endDate === "string"
            ? new Date(currentQuery.endDate)
            : new Date(),
        key: "selection",
      },
    },
  });

  const location = watch("location");
  const wilayaCode = watch("wilayaCode");
  const municipality = watch("municipality");
  const dateRange = watch("dateRange");

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    const { dateRange } = data;

    const updatedQuery: any = { ...currentQuery };

    // Remove legacy “people/rooms/bathrooms” filters from the URL.
    delete updatedQuery.guestCount;
    delete updatedQuery.roomCount;
    delete updatedQuery.bathroomCount;

    if (mode === "location") {
      updatedQuery.country = location?.label;
      updatedQuery.region = location?.region;
      updatedQuery.municipality = municipality || undefined;
      updatedQuery.wilayaCode = wilayaCode || undefined;
    }

    if (mode === "date" && hasPickedDates) {
      if (dateRange?.startDate) {
        updatedQuery.startDate = formatISO(dateRange.startDate);
      }

      if (dateRange?.endDate) {
        updatedQuery.endDate = formatISO(dateRange.endDate);
      }
    }

    const url = queryString.stringifyUrl(
      {
        url: "/offers",
        query: updatedQuery,
      },
      { skipNull: true },
    );

    onClose();
    router.push(url);
  };

  const canSubmit =
    mode === "location" ? Boolean(getValues("location")) : hasPickedDates;

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <div className="min-w-0">
          <h4 className="text-[15px] font-semibold text-neutral-800 truncate">
            {mode === "location" ? t("locationTitle") : t("dateTitle")}
          </h4>
          <p className="text-[12px] text-neutral-500 truncate">
            {mode === "location" ? t("locationSubtitle") : t("dateSubtitle")}
          </p>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-full hover:bg-neutral-100 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <IoMdClose size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-4">
          {mode === "date" ? (
            <div className="h-[348px] w-full">
              <Calendar
                onChange={(fieldName: string, value: any) => {
                  setHasPickedDates(true);
                  setCustomValue(fieldName, value);
                }}
                value={dateRange}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <AlgeriaLocationSelect
                wilayaCode={wilayaCode}
                municipality={municipality}
                onChange={setCustomValue}
                language={locale === "ar" ? "ar" : "fr"}
              />
            </div>
          )}
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center justify-end gap-2">
            <Button type="submit" disabled={!canSubmit}>
              {t("search")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
