"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";

import { Category } from "@/types";

interface CategoryBoxProps extends Category {
  selected?: boolean;
  queryKey?: string;
  displayLabel?: string;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  icon: Icon,
  label,
  displayLabel,
  selected,
  queryKey = "category",
}) => {
  const router = useRouter();
  const params = useSearchParams();

  const handleClick = () => {
    let currentQuery = {};
    if (params) {
      currentQuery = queryString.parse(params.toString());
    }

    const raw = (currentQuery as any)[queryKey];
    const selectedValues = Array.isArray(raw)
      ? (raw as string[])
      : typeof raw === "string"
        ? [raw]
        : [];

    const nextValues = selectedValues.includes(label)
      ? selectedValues.filter((v) => v !== label)
      : [...selectedValues, label];

    const updatedQuery: any = {
      ...currentQuery,
      [queryKey]: nextValues.length ? nextValues : undefined,
    };

    if (!nextValues.length) {
      delete updatedQuery[queryKey];
    }

    const url = queryString.stringifyUrl(
      {
        url: "/",
        query: updatedQuery,
      },
      { skipNull: true },
    );
    router.push(url);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group flex flex-col max-w-fit items-center justify-center gap-2 p-2 border-b-2 transition-all duration-200 cursor-pointer text-[20px] md:text-[24px] hover:text-rose-500 ${
        selected
          ? "border-b-rose-500 text-rose-500"
          : "border-transparent text-neutral-500"
      }`}
    >
      <span className="transition-all duration-200 ease-out group-hover:scale-[1.4] group-hover:text-rose-500">
        <Icon />
      </span>
      <small className="font-medium md:text-[13.75px] text-[12.75px] select-none">
        {displayLabel ?? label}
      </small>
    </button>
  );
};

export default CategoryBox;
