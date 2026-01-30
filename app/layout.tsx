import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import Navbar from "@/components/navbar";
import Providers from "@/components/Provider";
import { rtlLocales, type Locale } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("App");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className="font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Navbar />
            <main className="pb-16 md:pt-28 pt-24">{children}</main>
          </Providers>
        </NextIntlClientProvider>
      </body>
      {process.env.NODE_ENV === "production" &&
      process.env.GA_MEASUREMENT_ID ? (
        <GoogleAnalytics gaId={process.env.GA_MEASUREMENT_ID} />
      ) : null}
    </html>
  );
}
