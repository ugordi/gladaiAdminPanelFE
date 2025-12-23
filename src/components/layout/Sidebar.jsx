import React from "react";
import { NavLink } from "react-router-dom";

const baseWrap = {
  width: 270,
  borderRadius: 22,
  padding: 14,
  height: "calc(100vh - 28px)",
  position: "sticky",
  top: 14,
  overflow: "hidden",
};

const headerTitle = {
  fontWeight: 950,
  fontSize: 14,
  letterSpacing: ".55px",
  color: "rgba(245,243,255,.92)",
};

const headerSub = {
  color: "rgba(245,243,255,.55)",
  fontSize: 12,
  marginTop: 4,
};

const linkBase = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: "11px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.10)",
  background: "rgba(10,6,18,.42)",
  color: "rgba(245,243,255,.86)",
  fontWeight: 800,
  letterSpacing: ".2px",
  transition: "filter .12s ease, transform .12s ease, background .12s ease, border-color .12s ease",
  userSelect: "none",
};

function Dot({ active }) {
  return (
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: 999,
        flexShrink: 0,
        background: active
          ? "linear-gradient(135deg, rgba(124,58,237,.95), rgba(91,33,182,.60))"
          : "linear-gradient(135deg, rgba(124,58,237,.55), rgba(8,145,178,.22))",
        boxShadow: active
          ? "0 0 18px rgba(91,33,182,.30)"
          : "0 0 14px rgba(124,58,237,.14)",
      }}
    />
  );
}

export default function Sidebar() {
  const items = [
    { to: "/", label: "Dashboard" },
    { to: "/users", label: "Kullanıcılar" },
    { to: "/regions", label: "Bölgeler" },
    { to: "/enemies", label: "Düşmanlar" },
    { to: "/items", label: "Eşyalar" },
    { to: "/rankings", label: "Sıralama" },
    { to: "/settings", label: "Oyun Ayarları" },
  ];

  return (
    <div
      className="glass"
      style={{
        ...baseWrap,
        /* sidebar'ı biraz daha koyu yap */
        background:
          "linear-gradient(180deg, rgba(10,6,18,.72), rgba(10,6,18,.55))," +
          "radial-gradient(120% 140% at 14% 10%, rgba(91,33,182,.20), transparent 60%)," +
          "radial-gradient(120% 140% at 90% 0%, rgba(8,145,178,.08), transparent 60%)",
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: "0 18px 70px rgba(0,0,0,.62)",
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={headerTitle}>GLADIALORE</div>
        <div style={headerSub}>Admin Panel</div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            style={({ isActive }) => ({
              ...linkBase,
              borderColor: isActive ? "rgba(124,58,237,.34)" : "rgba(255,255,255,.10)",
              background: isActive
                ? "linear-gradient(135deg, rgba(91,33,182,.40), rgba(10,6,18,.55))"
                : "rgba(10,6,18,.40)",
              boxShadow: isActive ? "0 16px 38px rgba(91,33,182,.18)" : "none",
              color: isActive ? "rgba(245,243,255,.95)" : "rgba(245,243,255,.84)",
            })}
            onMouseEnter={(e) => {
              // hover: biraz parlaklık + hafif scale
              e.currentTarget.style.filter = "brightness(1.06)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
              e.currentTarget.style.transform = "translateY(0px)";
            }}
          >
            {/* dot */}
            <span style={{ display: "grid", placeItems: "center" }}>
              {/* isActive'i NavLink style callback'inde biliyoruz ama burada yok,
                  bu yüzden dot'u aktif renge yakın tutuyoruz. İstersen
                  NavLink children function ile %100 aktif yaparız. */}
              <Dot active={false} />
            </span>

            <span style={{ minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {it.label}
            </span>
          </NavLink>
        ))}
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ color: "rgba(245,243,255,.45)", fontSize: 12 }}>Made by UGO</div>
      </div>
    </div>
  );
}
