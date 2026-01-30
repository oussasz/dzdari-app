"use client";
import React from "react";
import { IconType } from "react-icons";
import { cn } from "@/utils/helper";

interface FeatureSelectProps {
  label: string;
  displayLabel?: string;
  icon: IconType;
  selected: boolean;
  onClick: (label: string) => void;
}

const FeatureSelect: React.FC<FeatureSelectProps> = ({
  label,
  displayLabel,
  icon: Icon,
  selected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className={cn(
        "flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition hover:border-rose-500",
        selected ? "border-rose-500 bg-rose-50" : "border-neutral-200",
      )}
    >
      <div
        className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition",
          selected
            ? "bg-rose-500 border-rose-500"
            : "border-neutral-400 bg-white",
        )}
      >
        {selected && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <Icon
        size={20}
        className={selected ? "text-rose-500" : "text-neutral-500"}
      />
      <span
        className={cn(
          "text-sm font-medium",
          selected ? "text-rose-500" : "text-neutral-600",
        )}
      >
        {displayLabel ?? label}
      </span>
    </button>
  );
};

export default FeatureSelect;
