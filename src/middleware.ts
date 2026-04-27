import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/edge-config";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|maintenance|api/maintenance-bypass).*)",
  ],
};

export async function middleware(req: NextRequest) {
  try {
    const isInMaintenance = await get<boolean>("isInMaintenance");

    if (!isInMaintenance) return NextResponse.next();

    const bypassSecret = await get<string>("maintenanceBypassSecret");
    const devCookie = req.cookies.get("__ats_dev")?.value;
    if (bypassSecret && devCookie === bypassSecret) {
      return NextResponse.next();
    }

    if (req.nextUrl.pathname === "/maintenance") return NextResponse.next();

    return NextResponse.rewrite(new URL("/maintenance", req.url));
  } catch {
    // Edge Config not configured (local dev) — proceed normally
    return NextResponse.next();
  }
}
