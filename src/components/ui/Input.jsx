// src/components/ui/Input.jsx
import React from "react";

/**
 * Dark Elite Input / Textarea
 * props:
 *  - label
 *  - hint
 *  - error
 *  - right
 *  - textarea
 */

export default function Input({
  label,
  hint,
  error,
  right,
  textarea = false,
  className = "",
  ...props
}) {
  const Field = textarea ? "textarea" : "input";

  return (
    <div className={["ui-field", className].join(" ")}>
      {(label || right) && (
        <div className="ui-field__top">
          {label ? <div className="ui-field__label">{label}</div> : <span />}
          {right ? <div className="ui-field__right">{right}</div> : null}
        </div>
      )}

      <Field
        {...props}
        className={[
          "ui-input",
          textarea ? "ui-input--textarea" : "",
          error ? "ui-input--error" : "",
        ].join(" ")}
      />

      {error ? (
        <div className="ui-field__error">{error}</div>
      ) : hint ? (
        <div className="ui-field__hint">{hint}</div>
      ) : null}
    </div>
  );
}
