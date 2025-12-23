// src/components/ui/Button.jsx
import React from "react";

/**
 * Dark Elite Button
 * variants: primary | ghost | outline | danger | success
 * sizes: sm | md | lg
 */

const SIZES = {
  sm: "ui-btn--sm",
  md: "ui-btn--md",
  lg: "ui-btn--lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        "ui-btn",
        `ui-btn--${variant}`,
        SIZES[size] || SIZES.md,
        isDisabled ? "ui-btn--disabled" : "",
        className,
      ].join(" ")}
    >
      {leftIcon && <span className="ui-btn__icon">{leftIcon}</span>}

      <span className="ui-btn__content">
        {loading && <span className="ui-btn__spinner" />}
        {children}
      </span>

      {rightIcon && <span className="ui-btn__icon">{rightIcon}</span>}
    </button>
  );
}
