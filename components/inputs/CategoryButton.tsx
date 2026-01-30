"use client";
import React, { useRef, useEffect } from "react";
import { FieldValues, UseFormWatch } from "react-hook-form";

import { cn } from "@/utils/helper";
import { Category } from "@/types";

interface CategoryButtonProps extends Category {
  onClick: (fieldName: string, value: string) => void;
  watch: UseFormWatch<FieldValues>;
  name?: string;
  displayLabel?: string;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({
  icon: Icon,
  label,
  displayLabel,
  onClick,
  watch,
  name = "category",
}) => {
  const isSelected = watch(name) === label;
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!buttonRef.current) return;
    const timer = setTimeout(() => {
      if (isSelected) {
        buttonRef.current?.focus();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isSelected]);

  const handleChange = () => {
    if (isSelected) return;
    onClick(name, label);
  };

  return (
    <div className="col-span-1">
      <button
        ref={buttonRef}
        type="submit"
        onClick={handleChange}
        className={cn(
          `rounded-xl  border-2 p-2 flex flex-col gap-3  hover:border-[#fd6d6c] cursor-pointer transition duration-200 w-full`,
          isSelected ? "border-[#fd6d6c]" : "border-neutral-200",
        )}
        onFocus={handleChange}
      >
        <Icon size={24} />
        <span className="font-semibold text-sm select-none text-start">
          {displayLabel ?? label}
        </span>
      </button>
    </div>
  );
};

export default CategoryButton;
