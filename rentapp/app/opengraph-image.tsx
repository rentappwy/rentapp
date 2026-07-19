import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RentApp — Apply for your next home";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F7F8FA",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              backgroundColor: "#4F46E5",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "34px",
              fontWeight: 700,
            }}
          >
            R
          </div>
          <div style={{ marginLeft: "18px", fontSize: "30px", fontWeight: 600, color: "#13161D" }}>
            RentApp
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "76px", fontWeight: 700, color: "#13161D", letterSpacing: "-2px" }}>
            Apply for your next home.
          </div>
          <div style={{ fontSize: "30px", color: "#3B414E", marginTop: "22px" }}>
            A quick, secure application — one-time $39.99 fee.
          </div>
        </div>
        <div style={{ fontSize: "24px", color: "#737884" }}>rentapp.homes</div>
      </div>
    ),
    size,
  );
}
