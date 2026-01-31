"use client";
import React, { useMemo, useState } from "react";
import { differenceInDays } from "date-fns";
import { useSearchParams } from "next/navigation";
import { FaRegCalendarAlt, FaSearch } from "react-icons/fa";
import { useTranslations } from "next-intl";
import Link from "next/link";
import queryString from "query-string";

import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useKeyPress } from "@/hooks/useKeyPress";
import SearchPanel from "@/components/search/SearchPanel";

const Search = () => {
  const t = useTranslations("Search");
  const searchParams = useSearchParams();

  const [openPanel, setOpenPanel] = useState<"location" | "date" | null>(null);
  const isOpen = openPanel !== null;

  const { ref } = useOutsideClick({
    action: () => setOpenPanel(null),
    enable: isOpen,
  });

  useKeyPress({
    key: "Escape",
    action: () => setOpenPanel(null),
    enable: isOpen,
  });

  const country = searchParams?.get("country");
  const region = searchParams?.get("region");
  const municipality = searchParams?.get("municipality");

  const startDate = searchParams?.get("startDate");
  const endDate = searchParams?.get("endDate");

  const durationLabel = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      let diff = differenceInDays(end, start);

      if (diff === 0) {
        diff = 1;
      }

      return t("days", { count: diff });
    }

    return t("anyWeek");
  }, [endDate, startDate, t]);

  const offersUrl = useMemo(() => {
    const currentQuery = searchParams
      ? queryString.parse(searchParams.toString())
      : {};

    // Remove legacy “people/rooms/bathrooms” filters.
    delete (currentQuery as any).guestCount;
    delete (currentQuery as any).roomCount;
    delete (currentQuery as any).bathroomCount;

    return queryString.stringifyUrl(
      {
        url: "/offers",
        query: currentQuery,
      },
      { skipNull: true },
    );
  }, [searchParams]);

  return (
    <div ref={ref} className="relative">
      <div className="border-[1px] w-full md:w-auto py-2 rounded-full shadow-sm hover:shadow-md transition duration-300 bg-white">
        <div className="flex flex-row items-center w-full">
          <button
            type="button"
            className="flex-1 min-w-0 text-left px-4 sm:px-6 cursor-pointer"
            onClick={() =>
              setOpenPanel((prev) => (prev === "location" ? null : "location"))
            }
            aria-expanded={openPanel === "location"}
          >
            <small className="block text-sm font-bold text-[#585858] truncate">
              {municipality || region || country || t("searchByLocation")}
            </small>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 px-3 sm:px-6 border-l-[1px] border-neutral-200 cursor-pointer"
            onClick={() =>
              setOpenPanel((prev) => (prev === "date" ? null : "date"))
            }
            aria-expanded={openPanel === "date"}
          >
            <FaRegCalendarAlt className="text-[14px] text-[#585858] sm:hidden" />
            <small className="hidden sm:block text-sm font-bold text-[#585858] whitespace-nowrap">
              {durationLabel}
            </small>
          </button>

          <div className="pl-3 pr-2">
            <Link
              href={offersUrl}
              className="p-2 bg-rose-500 rounded-full text-white inline-flex"
              aria-label={t("goToOffers")}
              onClick={() => setOpenPanel(null)}
            >
              <FaSearch className="text-[12px]" />
            </Link>
          </div>
        </div>
      </div>

      {openPanel ? (
        <div className="absolute left-0 right-0 top-full mt-3 z-50">
          <SearchPanel mode={openPanel} onClose={() => setOpenPanel(null)} />
        </div>
      ) : null}
    </div>
  );
};

export default Search;
