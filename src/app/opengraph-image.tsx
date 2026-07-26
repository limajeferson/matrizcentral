import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Matriz Central — IA local, do diagnóstico ao domínio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #0a0a0f 0%, #17122b 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 14, marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, background: "#7c5cff", borderRadius: 6 }} />
          <div style={{ width: 44, height: 44, background: "#5b3ee8", borderRadius: 6 }} />
          <div style={{ width: 44, height: 44, background: "#3b229e", borderRadius: 6 }} />
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2 }}>
          Matriz Central
        </div>
        <div style={{ fontSize: 34, marginTop: 24, color: "#c9c4e0", lineHeight: 1.3 }}>
          IA local, do diagnóstico ao domínio
        </div>
      </div>
    ),
    size
  );
}
