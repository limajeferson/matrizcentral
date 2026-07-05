"use client";

import { useEffect, useRef } from "react";

const BLOBS = [
  { size: 320, top: "10%", left: "15%", color: "rgba(124, 92, 255, 0.35)", duration: 22, depth: 18 },
  { size: 260, top: "60%", left: "70%", color: "rgba(91, 61, 245, 0.3)", duration: 26, depth: 26 },
  { size: 200, top: "75%", left: "20%", color: "rgba(124, 92, 255, 0.25)", duration: 30, depth: 12 },
  { size: 240, top: "20%", left: "75%", color: "rgba(91, 61, 245, 0.28)", duration: 24, depth: 22 },
];

export default function NeuralBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const handleMouseMove = (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const xRatio = event.clientX / window.innerWidth - 0.5;
      const yRatio = event.clientY / window.innerHeight - 0.5;

      container.querySelectorAll<HTMLDivElement>(".mc-neural-blob-wrap").forEach((wrap, index) => {
        const depth = BLOBS[index]?.depth ?? 15;
        wrap.style.transform = `translate(${xRatio * depth}px, ${yRatio * depth}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} aria-hidden="true">
      {BLOBS.map((blob, index) => (
        <div
          key={index}
          className="mc-neural-blob-wrap"
          style={{
            top: blob.top,
            left: blob.left,
            transition: "transform 0.3s ease-out",
          }}
        >
          <div
            className="mc-neural-blob"
            style={{
              width: blob.size,
              height: blob.size,
              background: blob.color,
              animation: `mc-blob-drift-${index % 2} ${blob.duration}s ease-in-out infinite`,
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes mc-blob-drift-0 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 20px); }
        }
        @keyframes mc-blob-drift-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, -25px); }
        }
      `}</style>
    </div>
  );
}
