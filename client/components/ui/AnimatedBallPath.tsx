import React from "react";

interface Props {
  className?: string;
  path?: string;
  duration?: number;
  emoji?: string;
  size?: number;
}

export default function AnimatedBallPath({
  className,
  path = "M 20 60 C 160 -40, 320 140, 520 60 S 860 140, 980 40",
  duration = 7,
  emoji = "⚽",
  size = 28,
}: Props) {
  const style: React.CSSProperties = {
    offsetPath: `path('${path}')`,
    WebkitOffsetPath: `path('${path}')`,
    offsetRotate: "auto 45deg",
    WebkitOffsetRotate: "auto 45deg" as any,
    animation: `path-progress ${duration}s ease-in-out infinite alternate`,
    WebkitAnimation: `path-progress ${duration}s ease-in-out infinite alternate`,
  };
  return (
    <div className={className} style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <div style={style}>
          <div
            style={{
              width: size,
              height: size,
              display: "grid",
              placeItems: "center",
              filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))",
            }}
          >
            <span style={{ fontSize: size * 0.9 }}>{emoji}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
