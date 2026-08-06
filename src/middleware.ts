import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/edge-config";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/|favicon.ico|maintenance|api/maintenance-bypass).*)",
  ],
};

export async function middleware(req: NextRequest) {
  try {
    const isInMaintenance = await get<boolean>("isInMaintenance");

    if (isInMaintenance) {
      const bypassSecret = await get<string>("maintenanceBypassSecret");
      const devCookie = req.cookies.get("__ats_dev")?.value;
      if (bypassSecret && devCookie === bypassSecret) {
        return intlMiddleware(req);
      }

      if (req.nextUrl.pathname === "/maintenance") {
        return NextResponse.next();
      }

      return NextResponse.rewrite(new URL("/maintenance", req.url));
    }

    return intlMiddleware(req);
  } catch {
    return intlMiddleware(req);
  }
}
