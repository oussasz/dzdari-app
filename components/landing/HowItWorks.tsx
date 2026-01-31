import React from "react";
import { FiMapPin, FiCalendar, FiHome } from "react-icons/fi";

interface HowItWorksProps {
  title: string;
  subtitle: string;
  steps: Array<{ title: string; description: string }>;
}

const stepIcons = [FiMapPin, FiCalendar, FiHome];

const HowItWorks = ({ title, subtitle, steps }: HowItWorksProps) => {
  return (
    <section className="bg-neutral-50">
      <div className="main-container py-10 md:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-neutral-600 md:text-base">
            {subtitle}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3">
          {steps.slice(0, 3).map((step, index) => {
            const Icon = stepIcons[index] ?? FiHome;
            return (
              <div
                key={step.title}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-neutral-900 ring-1 ring-black/5">
                    <Icon size={18} />
                  </div>
                  <div className="text-sm font-semibold text-neutral-900">
                    {step.title}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
