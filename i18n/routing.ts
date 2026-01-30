export const locales = ["en", "fr", "ar"] as const;

export type Locale = (typeof locales)[number];

// Algeria-first default; middleware will still auto-detect on first visit.
export const defaultLocale: Locale = "fr";

export const rtlLocales: Locale[] = ["ar"];
