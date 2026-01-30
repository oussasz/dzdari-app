"use client";

import React from "react";
import Heading from "./Heading";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface EmptyProps {
  title?: string;
  subtitle?: string;
  showReset?: boolean;
}

const EmptyState: React.FC<EmptyProps> = ({ title, subtitle, showReset }) => {
  const t = useTranslations("Empty");

  const resolvedTitle = title ?? t("noExactMatches");
  const resolvedSubtitle = subtitle ?? t("tryChangeFilters");

  return (
    <div className=" h-[60vh] flex flex-col gap-2 justify-center items-center">
      <Heading center title={resolvedTitle} subtitle={resolvedSubtitle} />
      <div className="w-48 mt-4">
        {showReset && (
          <Link
            href="/"
            className="bg-white border-[1px] border-gray-500 text-[#4e4e4e] rounded hover:opacity-80 transition "
          >
            {t("removeAllFilters")}
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
