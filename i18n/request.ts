import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "./routing";

import en from "../messages/en.json";
import fr from "../messages/fr.json";
import ar from "../messages/ar.json";

const messagesMap: Record<Locale, typeof en> = { en, fr, ar };

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Locale | undefined;

  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: messagesMap[locale],
  };
});
