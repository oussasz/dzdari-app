import { NextResponse } from "next/server";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";

export async function POST(request: Request) {
  let nextLocale: Locale = defaultLocale;

  try {
    const body = (await request.json()) as { locale?: string };
    const requested = body?.locale as Locale | undefined;
    if (requested && locales.includes(requested)) {
      nextLocale = requested;
    }
  } catch {
    // Ignore invalid JSON
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("NEXT_LOCALE", nextLocale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
