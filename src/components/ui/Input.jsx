import React from "react";

/**
 * Elite Input / Textarea
 * props:
 *  - label
 *  - hint
 *  - error
 *  - right (suffix node)
 *  - textarea (boolean)
 */
export default function Input({
  label,
  hint,
  error,
  right,
  textarea = false,
  style,
  inputStyle,
  ...props
}) {
  const borderColor = error
    ? "rgba(251,113,133,.65)"
    : "rgba(255,255,255,.14)";

  const baseField = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: `1px solid ${borderColor}`,
    background: "rgba(255,255,255,.06)",
    color: "rgba(236,235,255,.95)",
    boxShadow: "0 12px 26px rgba(0,0,0,.25)",
    outline: "none",
    transition: "border-color .12s ease, box-shadow .12s ease, filter .12s ease",
  };

  const Field = textarea ? "textarea" : "input";

  return (
    <div style={{ display: "grid", gap: 8, ...style }}>
      {(label || right) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {label ? (
            <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: ".3px" }}>
              {label}
            </div>
          ) : <span />}
          {right ? <div>{right}</div> : null}
        </div>
      )}

      <Field
        {...props}
        style={{
          ...baseField,
          minHeight: textarea ? 110 : undefined,
          resize: textarea ? "vertical" : undefined,
          ...inputStyle,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(167,139,250,.55)";
          e.currentTarget.style.boxShadow = "0 14px 34px rgba(124,58,237,.18)";
          props.onFocus && props.onFocus(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = borderColor;
          e.currentTarget.style.boxShadow = "0 12px 26px rgba(0,0,0,.25)";
          props.onBlur && props.onBlur(e);
        }}
      />

      {error ? (
        <div style={{ color: "rgba(251,113,133,.92)", fontSize: 12 }}>
          {error}
        </div>
      ) : hint ? (
        <div style={{ color: "rgba(236,235,255,.55)", fontSize: 12 }}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}
