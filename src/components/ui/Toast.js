import React from "react";
import ReactDOM from "react-dom/client";

let root = null;
let hostEl = null;

const state = {
  items: [],
  max: 4,
};

function ensureHost() {
  if (hostEl) return;

  hostEl = document.createElement("div");
  hostEl.id = "elite-toast-host";
  document.body.appendChild(hostEl);

  root = ReactDOM.createRoot(hostEl);
  render();
}

function render() {
  if (!root) return;
  root.render(<ToastViewport items={state.items} />);
}

function push(type, message, opts = {}) {
  ensureHost();
  const id = cryptoRandomId();
  const item = {
    id,
    type,
    message,
    createdAt: Date.now(),
    ttl: opts.ttl ?? 2600,
  };

  state.items = [item, ...state.items].slice(0, state.max);
  render();

  window.setTimeout(() => {
    state.items = state.items.filter((x) => x.id !== id);
    render();
  }, item.ttl);

  return id;
}

function cryptoRandomId() {
  // CRA'da crypto.randomUUID genelde var, yoksa fallback
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return "t_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export const toast = {
  success: (msg, opts) => push("success", msg, opts),
  error: (msg, opts) => push("error", msg, opts),
  info: (msg, opts) => push("info", msg, opts),
  warn: (msg, opts) => push("warn", msg, opts),
};

export function ToastViewport({ items = [] }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 14,
        right: 14,
        zIndex: 9999,
        display: "grid",
        gap: 10,
        width: 360,
        maxWidth: "calc(100vw - 28px)",
        pointerEvents: "none",
      }}
    >
      {items.map((t) => (
        <ToastItem key={t.id} item={t} />
      ))}
    </div>
  );
}

function ToastItem({ item }) {
  const accent = accentByType(item.type);

  return (
    <div
      className="glass"
      style={{
        borderRadius: 18,
        padding: 12,
        border: `1px solid ${accent.border}`,
        background:
          "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))",
        boxShadow: "var(--shadowSoft)",
        pointerEvents: "auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -80,
          background: accent.glow,
          filter: "blur(14px)",
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            marginTop: 6,
            background: accent.dot,
            boxShadow: accent.dotShadow,
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 12.5, letterSpacing: ".25px" }}>
            {accent.title}
          </div>
          <div style={{ color: "rgba(236,235,255,.86)", fontSize: 13, marginTop: 4, lineHeight: 1.3 }}>
            {item.message}
          </div>
        </div>
      </div>
    </div>
  );
}

function accentByType(type) {
  switch (type) {
    case "success":
      return {
        title: "Başarılı",
        border: "rgba(52,211,153,.35)",
        dot: "linear-gradient(135deg, rgba(52,211,153,.95), rgba(34,211,238,.25))",
        dotShadow: "0 0 18px rgba(52,211,153,.25)",
        glow:
          "radial-gradient(circle at 30% 20%, rgba(52,211,153,.22), transparent 60%)," +
          "radial-gradient(circle at 70% 40%, rgba(34,211,238,.14), transparent 65%)",
      };
    case "error":
      return {
        title: "Hata",
        border: "rgba(251,113,133,.38)",
        dot: "linear-gradient(135deg, rgba(251,113,133,.95), rgba(124,58,237,.25))",
        dotShadow: "0 0 18px rgba(251,113,133,.22)",
        glow:
          "radial-gradient(circle at 30% 20%, rgba(251,113,133,.20), transparent 60%)," +
          "radial-gradient(circle at 70% 40%, rgba(124,58,237,.14), transparent 65%)",
      };
    case "warn":
      return {
        title: "Uyarı",
        border: "rgba(251,191,36,.35)",
        dot: "linear-gradient(135deg, rgba(251,191,36,.95), rgba(244,114,182,.15))",
        dotShadow: "0 0 18px rgba(251,191,36,.18)",
        glow:
          "radial-gradient(circle at 30% 20%, rgba(251,191,36,.18), transparent 60%)," +
          "radial-gradient(circle at 70% 40%, rgba(244,114,182,.12), transparent 65%)",
      };
    default:
      return {
        title: "Bilgi",
        border: "rgba(167,139,250,.35)",
        dot: "linear-gradient(135deg, rgba(167,139,250,.95), rgba(34,211,238,.20))",
        dotShadow: "0 0 18px rgba(167,139,250,.20)",
        glow:
          "radial-gradient(circle at 30% 20%, rgba(167,139,250,.18), transparent 60%)," +
          "radial-gradient(circle at 70% 40%, rgba(34,211,238,.12), transparent 65%)",
      };
  }
}
