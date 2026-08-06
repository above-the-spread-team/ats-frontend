import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/edge-config";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  let secret: string | undefined;
  try {
    secret = await get<string>("maintenanceBypassSecret");
  } catch {
    return NextResponse.json(
      { error: "Edge Config unavailable" },
      { status: 503 },
    );
  }

  if (!token || !secret || token !== secret) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const res = NextResponse.redirect(new URL("/", req.url));
  const cookieOpts = { secure: true, sameSite: "strict" as const, maxAge: 60 * 60 * 24 * 30, path: "/" };
  res.cookies.set("__ats_dev", token, { ...cookieOpts, httpOnly: true });
  // Non-HttpOnly so client-side fetch can read it and forward as X-Maintenance-Bypass header
  res.cookies.set("__ats_dev_pub", token, cookieOpts);
  return res;
}
