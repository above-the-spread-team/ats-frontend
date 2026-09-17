import type { ReactElement } from "react";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

// Long-lived: the URL carries a version param whenever the underlying article changes.
const CACHE_CONTROL =
  "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";

export const OG_COLORS = {
  navy: "#162545",
  navyDeep: "#0a1226",
  blue: "#3d7bff",
  amber: "#f59e0b",
  muted: "#a9b6d3",
};

export function ogResponse(element: ReactElement): ImageResponse {
  return new ImageResponse(element, {
    ...OG_SIZE,
    headers: { "Cache-Control": CACHE_CONTROL },
  });
}

/**
 * Remote image → data URL. ImageResponse throws on any image it cannot load, so logos are
 * fetched up front and simply left out when the CDN fails.
 */
export async function loadImageDataUrl(
  url: string | null | undefined,
): Promise<string | null> {
  if (!url) return null;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 },
    });
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "image/png";
    if (!type.startsWith("image/") || type.includes("svg")) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Shared frame: brand gradient, site name bottom-left, optional label top-left. */
export function OgFrame({
  label,
  labelColor = OG_COLORS.blue,
  logo,
  children,
}: {
  label?: string;
  labelColor?: string;
  logo?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 64px",
        color: "#ffffff",
        backgroundImage: `linear-gradient(135deg, ${OG_COLORS.navy} 0%, ${OG_COLORS.navyDeep} 100%)`,
      }}
    >
      <div style={{ display: "flex", height: 44 }}>
        {label ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 22px",
              borderRadius: 22,
              fontSize: 22,
              letterSpacing: 3,
              backgroundColor: labelColor,
            }}
          >
            {label}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {children}
      </div>

      <div style={{ display: "flex", alignItems: "center", fontSize: 26, color: OG_COLORS.muted }}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img src={logo} width={40} height={40} style={{ marginRight: 14, borderRadius: 8 }} />
        ) : null}
        Above The Spread · abovethespread.com
      </div>
    </div>
  );
}
