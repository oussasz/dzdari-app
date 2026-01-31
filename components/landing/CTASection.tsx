import React from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

interface CTASectionProps {
  title: string;
  subtitle: string;
  primaryHref: string;
  primaryLabel: string;
}

const CTASection = ({
  title,
  subtitle,
  primaryHref,
  primaryLabel,
}: CTASectionProps) => {
  return (
    <section className="bg-white">
      <div className="main-container py-10 md:py-14">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-rose-50 via-white to-white p-6 md:p-10">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-200/40 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-neutral-200/50 blur-2xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold text-neutral-900 md:text-3xl">
                {title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600 md:text-base">
                {subtitle}
              </p>
            </div>

            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
            >
              <span>{primaryLabel}</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
