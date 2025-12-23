// Stat.jsx

import React from "react";

/**
 * Small stat pill/card
 * variants: violet | cyan | pink | ok | warn | bad
 */
const VAR = {
  violet: {
    grad: "linear-gradient(135deg, rgba(91,33,182,.20), rgba(10,6,18,.35))",
    dot: "linear-gradient(135deg, rgba(124,58,237,.95), rgba(91,33,182,.55))",
  },
  cyan: {
    grad: "linear-gradient(135deg, rgba(8,145,178,.14), rgba(10,6,18,.35))",
    dot: "linear-gradient(135deg, rgba(34,211,238,.60), rgba(91,33,182,.35))",
  },
  pink: {
    grad: "linear-gradient(135deg, rgba(190,24,93,.14), rgba(10,6,18,.35))",
    dot: "linear-gradient(135deg, rgba(244,114,182,.70), rgba(91,33,182,.35))",
  },
  ok: {
    grad: "linear-gradient(135deg, rgba(52,211,153,.14), rgba(255,255,255,.05))",
    dot: "linear-gradient(135deg, rgba(52,211,153,.95), rgba(34,211,238,.35))",
  },
  warn: {
    grad: "linear-gradient(135deg, rgba(251,191,36,.14), rgba(255,255,255,.05))",
    dot: "linear-gradient(135deg, rgba(251,191,36,.95), rgba(244,114,182,.25))",
  },
  bad: {
    grad: "linear-gradient(135deg, rgba(251,113,133,.18), rgba(255,255,255,.05))",
    dot: "linear-gradient(135deg, rgba(251,113,133,.95), rgba(124,58,237,.25))",
  },
};

export default function Stat({
  label,
  value,
  variant = "violet",
  right,
  style,
}) {
  const v = VAR[variant] || VAR.violet;

  return (
    <div
      className="glass"
      style={{
        borderRadius: 18,
        padding: 14,
        background: v.grad,
        border: "1px solid rgba(255,255,255,.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        ...style,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: v.dot,
            boxShadow: "0 0 18px rgba(167,139,250,.28)",
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: ".2px" }}>
            {label}
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 4, lineHeight: 1.1 }}>
            {value}
          </div>
        </div>
      </div>

      {right ? <div style={{ flexShrink: 0 }}>{right}</div> : null}
    </div>
  );
}
