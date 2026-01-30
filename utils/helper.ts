import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const formatPrice = (price: number, locale: string = "en"): string => {
  return new Intl.NumberFormat(locale).format(price);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
