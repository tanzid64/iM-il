import NextAuth from "next-auth";
import { NextRequest } from "next/server";
import { authConfig } from "./server/auth.config";

const { auth } = NextAuth(authConfig);
const PUBLIC_ROUTES = [
  "/auth",
  "/api/auth/callback/google",
  "/api/auth/callback/github",
];
const PROTECTED_SUBROUTES: string[] = [];

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  const session = await auth();
  const isAuthenticated = !!session?.user;

  const isPublicRoute =
    (PUBLIC_ROUTES.find((route) => nextUrl.pathname.startsWith(route)) ||
      nextUrl.pathname === "/") &&
    !PROTECTED_SUBROUTES.find((route) => nextUrl.pathname.includes(route));


  if (!isAuthenticated && !isPublicRoute)
    return Response.redirect(new URL("/auth", nextUrl));
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
