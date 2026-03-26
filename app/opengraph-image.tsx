import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/constants";

export const runtime = "edge";
export const alt = "מארקו — עורך מארקדאון בעברית";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontData = await fetch(
    new URL(
      "https://fonts.gstatic.com/s/varelaround/v21/w8gdH283Tvk__Lua32TysjIfp8uPLdshZhVB.woff2"
    )
  ).then((res) => res.arrayBuffer());

  const domain = new URL(SITE_URL).hostname;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #065f46, #059669, #10B981)",
          fontFamily: "Varela Round",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            display: "flex",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "rgba(255,255,255,0.15)",
            marginBottom: 24,
            fontSize: 44,
          }}
        >
          ✦
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 400,
            color: "#ecfdf5",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          מארקו
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "#a7f3d0",
            marginBottom: 32,
          }}
        >
          עורך מארקדאון בעברית
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["RTL מלא", "ייצוא PDF", "ערכות עיצוב", "כלי AI"].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 20px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.15)",
                color: "#ecfdf5",
                fontSize: 20,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#6ee7b7",
            fontSize: 18,
          }}
        >
          {domain} — חינמי ובלי הרשמה
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Varela Round",
          data: fontData,
          style: "normal" as const,
          weight: 400 as const,
        },
      ],
    }
  );
}
