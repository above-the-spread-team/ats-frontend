import { OG_COLORS, OgFrame, loadImageDataUrl, ogResponse } from "@/lib/og-image";

export const revalidate = 86400;

/** Site-wide 1200×630 social card (public/images/og.jpeg is 3:2 and gets cropped). */
export async function GET(request: Request) {
  const logo = await loadImageDataUrl(
    new URL("/images/logo.png", request.url).toString(),
  );
  return ogResponse(
    <OgFrame logo={logo}>
      <div style={{ display: "flex", fontSize: 84, letterSpacing: -1 }}>
        Above The Spread
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 20,
          fontSize: 34,
          color: OG_COLORS.muted,
          textAlign: "center",
        }}
      >
        Football predictions, match previews, live scores and stats
      </div>
    </OgFrame>,
  );
}
