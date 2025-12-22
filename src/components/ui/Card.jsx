import React from "react";

/**
 * Elite glass Card
 * - title/subtitle header
 * - optional right slot (actions)
 * - subtle glow overlay
 */
export default function Card({
  title,
  subtitle,
  right,
  children,
  style,
  glow = true,
  padding = 18,
  className = "",
}) {
  return (
    <div
      className={`glass ${className}`}
      style={{
        borderRadius: "var(--r22)",
        padding,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {glow && (
        <div
          style={{
            position: "absolute",
            inset: -120,
            pointerEvents: "none",
            background:
              "radial-gradient(700px 380px at 20% 15%, rgba(124,58,237,.18), transparent 60%)," +
              "radial-gradient(640px 360px at 85% 20%, rgba(34,211,238,.11), transparent 62%)," +
              "radial-gradient(680px 420px at 55% 95%, rgba(244,114,182,.10), transparent 65%)",
            filter: "blur(10px)",
            opacity: 1,
          }}
        />
      )}

      {(title || subtitle || right) && (
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && (
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  letterSpacing: ".2px",
                  lineHeight: 1.25,
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12.5,
                  color: "var(--muted)",
                  lineHeight: 1.35,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>

          {right && <div style={{ flexShrink: 0 }}>{right}</div>}
        </div>
      )}

      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}
