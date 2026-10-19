import { ImageResponse } from "next/og";

// Social sharing card (1200×630), generated at build time so no binary asset
// has to ship with the deployment. Flat "drawing sheet" style: graphite
// ground, logo-red rule, company name and location.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#151A20",
          color: "#F6F5F1",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 56, height: 56, background: "#B8232B", display: "flex" }} />
          <div style={{ fontSize: 26, letterSpacing: 4, color: "#A9B0B7" }}>
            AL SAQR AL AHMAR · MUSAFFAH, ABU DHABI
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 980 }}>
            Precision Steelwork. Built Around Your Project.
          </div>
          <div style={{ fontSize: 30, color: "#C9CED3", maxWidth: 980 }}>
            Structural steel · Pipeline welding · CNC cutting · Storage containers · Stainless steel
          </div>
        </div>
        <div style={{ display: "flex", height: 8, width: "100%", background: "#B8232B" }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
