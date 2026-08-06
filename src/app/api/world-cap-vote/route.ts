/**
 * Next.js proxy route for World Cup prediction API.
 * Forwards requests to the FastAPI backend, passing auth headers from the client.
 *
 * Usage (client-side fetch to /api/world-cap-vote):
 *   GET    /api/world-cap-vote?path=groups
 *   GET    /api/world-cap-vote?path=deadline
 *   GET    /api/world-cap-vote?path=prediction/me
 *   POST   /api/world-cap-vote?path=prediction
 *   PUT    /api/world-cap-vote?path=prediction/me
 *   DELETE /api/world-cap-vote?path=prediction/me
 *
 * NOTE: The service layer (world-caup-vote.ts) calls the backend directly via
 * NEXT_PUBLIC_BACKEND_URL, so this proxy route is provided as an optional
 * server-side gateway (e.g. for SSR or cookie-only auth flows).
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const ALLOWED_PATHS = new Set([
  "groups",
  "deadline",
  "prediction",
  "prediction/me",
]);

async function proxy(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") ?? "";

  if (!ALLOWED_PATHS.has(path)) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  const targetUrl = `${BACKEND_URL}/api/v1/world-cup/${path}`;

  const forwardHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const authorization = req.headers.get("authorization");
  if (authorization) forwardHeaders["Authorization"] = authorization;

  const cookie = req.headers.get("cookie");
  if (cookie) forwardHeaders["Cookie"] = cookie;

  const body =
    req.method !== "GET" && req.method !== "DELETE"
      ? await req.text()
      : undefined;

  const backendRes = await fetch(targetUrl, {
    method: req.method,
    headers: forwardHeaders,
    body,
    credentials: "include",
  });

  const responseBody =
    backendRes.status === 204 ? null : await backendRes.text();

  return new NextResponse(responseBody, {
    status: backendRes.status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
