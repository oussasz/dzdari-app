import { NextFetchEvent, NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";

import { defaultLocale, locales } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  // Keep URLs unchanged; locale is detected and persisted via cookie.
  localePrefix: "never",
  localeDetection: true,
});

const authMiddleware = withAuth({
  pages: {
    signIn: "/",
  },
});

const protectedRoutes = [
  "/favorites",
  "/properties",
  "/reservations",
  "/trips",
];

function isProtectedPath(pathname: string) {
  return protectedRoutes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const intlResponse = intlMiddleware(request);

  // If next-intl needs to redirect (e.g., for detection), do that first.
  const location = intlResponse.headers.get("location");
  if (location) return intlResponse;

  if (isProtectedPath(request.nextUrl.pathname)) {
    const authResponse = await authMiddleware(request as any, event);
    if (authResponse) {
      const authLocation = authResponse.headers.get("location");
      if (authLocation) return authResponse;
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
