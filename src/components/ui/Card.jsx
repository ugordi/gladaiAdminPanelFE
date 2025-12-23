// Card.jsx

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
              "radial-gradient(700px 380px at 20% 15%, rgba(91,33,182,.16), transparent 62%)," +
              "radial-gradient(640px 360px at 85% 20%, rgba(8,145,178,.08), transparent 64%)," +
              "radial-gradient(680px 420px at 55% 95%, rgba(190,24,93,.08), transparent 66%)",
            opacity: 0.9,
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
