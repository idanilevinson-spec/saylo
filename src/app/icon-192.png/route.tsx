import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4f46e5, #f59e0b)",
          borderRadius: 40,
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 700, color: "#ffffff", fontFamily: "sans-serif" }}>S</div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
