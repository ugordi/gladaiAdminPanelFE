import React from "react";

/**
 * Elite Button
 * variants: primary | ghost | outline | danger | success
 * sizes: sm | md | lg
 */
const SIZES = {
  sm: { padding: "9px 12px", fontSize: 12.5, borderRadius: 12 },
  md: { padding: "11px 14px", fontSize: 13.5, borderRadius: 14 },
  lg: { padding: "13px 16px", fontSize: 14.5, borderRadius: 16 },
};

const VARIANTS = {
  primary: {
    background:
      "linear-gradient(135deg, rgba(124,58,237,.95), rgba(167,139,250,.82) 58%, rgba(34,211,238,.35))",
    border: "1px solid rgba(167,139,250,.35)",
    color: "white",
    shadow: "0 18px 40px rgba(124,58,237,.18)",
  },
  ghost: {
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    color: "rgba(236,235,255,.92)",
    shadow: "0 14px 28px rgba(0,0,0,.22)",
  },
  outline: {
    background: "transparent",
    border: "1px solid rgba(167,139,250,.35)",
    color: "rgba(236,235,255,.95)",
    shadow: "0 14px 28px rgba(0,0,0,.18)",
  },
  danger: {
    background:
      "linear-gradient(135deg, rgba(251,113,133,.92), rgba(124,58,237,.40))",
    border: "1px solid rgba(251,113,133,.35)",
    color: "white",
    shadow: "0 18px 40px rgba(251,113,133,.14)",
  },
  success: {
    background:
      "linear-gradient(135deg, rgba(52,211,153,.92), rgba(34,211,238,.25))",
    border: "1px solid rgba(52,211,153,.35)",
    color: "white",
    shadow: "0 18px 40px rgba(52,211,153,.14)",
  },
};

export default function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  style,
  children,
  ...props
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      style={{
        width: "100%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: s.padding,
        fontSize: s.fontSize,
        borderRadius: s.borderRadius,
        border: v.border,
        background: v.background,
        color: v.color,
        fontWeight: 800,
        letterSpacing: ".25px",
        cursor: isDisabled ? "not-allowed" : "pointer",
        boxShadow: v.shadow,
        opacity: isDisabled ? 0.65 : 1,
        transform: "translateZ(0)",
        transition:
          "transform .12s ease, filter .12s ease, box-shadow .12s ease, opacity .12s ease",
        ...style,
      }}
      onMouseDown={(e) => {
        if (isDisabled) return;
        e.currentTarget.style.transform = "scale(.985)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {leftIcon ? <span style={{ display: "grid", placeItems: "center" }}>{leftIcon}</span> : null}

      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        {loading ? (
          <span
            aria-label="loading"
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              border: "2px solid rgba(255,255,255,.45)",
              borderTopColor: "rgba(255,255,255,.92)",
              animation: "spin .75s linear infinite",
            }}
          />
        ) : null}
        {children}
      </span>

      {rightIcon ? <span style={{ display: "grid", placeItems: "center" }}>{rightIcon}</span> : null}

      {/* keyframes inline (CRA global) */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
}
