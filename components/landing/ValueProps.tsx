import React from "react";
import { FiShield, FiHeadphones, FiCheckCircle } from "react-icons/fi";

interface ValuePropsProps {
  items: Array<{ title: string; description: string }>;
}

const icons = [FiShield, FiCheckCircle, FiHeadphones];

const ValueProps = ({ items }: ValuePropsProps) => {
  return (
    <section className="bg-white">
      <div className="main-container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {items.slice(0, 3).map((item, index) => {
            const Icon = icons[index] ?? FiCheckCircle;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-neutral-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
