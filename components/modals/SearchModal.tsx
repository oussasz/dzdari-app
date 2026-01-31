"use client";
import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { formatISO } from "date-fns";
import { useLocale, useTranslations } from "next-intl";

import Modal from "./Modal";
import Button from "../Button";
import Heading from "../Heading";
import AlgeriaLocationSelect from "../inputs/AlgeriaLocationSelect";

const Calendar = dynamic(() => import("@/components/Calender"), { ssr: false });

type SearchMode = "location" | "date";

const SearchModal = ({
  onCloseModal,
  mode,
}: {
  onCloseModal?: () => void;
  mode: SearchMode;
}) => {
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

  const Map = useMemo(
    () =>
      dynamic(() => import("../Map"), {
        ssr: false,
      }),
    [],
  );

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
    onCloseModal?.();
    router.push(url);
  };

  const body = () => {
    if (mode === "date") {
      return (
        <div className="flex flex-col gap-3">
          <Heading title={t("dateTitle")} subtitle={t("dateSubtitle")} />
          <div className="h-[348px] w-full">
            <Calendar
              onChange={(fieldName: string, value: any) => {
                setHasPickedDates(true);
                setCustomValue(fieldName, value);
              }}
              value={dateRange}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <Heading title={t("locationTitle")} subtitle={t("locationSubtitle")} />
        <AlgeriaLocationSelect
          wilayaCode={wilayaCode}
          municipality={municipality}
          onChange={setCustomValue}
          language={locale === "ar" ? "ar" : "fr"}
        />
        <div className="h-[240px]">
          <Map center={location?.latlng} />
        </div>
      </div>
    );
  };

  const canSubmit =
    mode === "location" ? Boolean(getValues("location")) : hasPickedDates;

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <Modal.WindowHeader title={t("header")} />
      <form
        className="h-auto flex-1 border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none "
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="relative p-6">{body()}</div>
        <div className="flex flex-col gap-2 px-6 pb-6 pt-3">
          <div className="flex flex-row items-center gap-4 w-full">
            <Button
              type="submit"
              className="flex items-center gap-2 justify-center"
              disabled={!canSubmit}
            >
              {t("search")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchModal;
