import { NavLink } from "react-router-dom";

const linkBase = {
  display:"flex",
  gap:10,
  alignItems:"center",
  padding:"11px 12px",
  borderRadius: 14,
  border:"1px solid rgba(255,255,255,.10)",
  background:"rgba(255,255,255,.04)",
  color:"rgba(236,235,255,.82)",
  fontWeight: 700,
  letterSpacing: ".2px",
};

export default function Sidebar(){
  const items = [
    { to:"/", label:"Dashboard" },
    { to:"/users", label:"Kullanıcılar" },
    { to:"/regions", label:"Bölgeler" },
    { to:"/enemies", label:"Düşmanlar" },
    { to:"/items", label:"Eşyalar" },
    { to:"/rankings", label:"Sıralama" },
    { to:"/settings", label:"Oyun Ayarları" },
  ];

  return (
    <div className="glass" style={{
      width: 270,
      borderRadius: 22,
      padding: 14,
      height: "calc(100vh - 28px)",
      position:"sticky",
      top: 14,
      overflow:"hidden"
    }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: ".4px" }}>
          GLADIALORE
        </div>
        <div style={{ color:"rgba(236,235,255,.62)", fontSize: 12, marginTop: 4 }}>
          Admin Panel • Night Violet
        </div>
      </div>

      <div style={{ display:"grid", gap: 10 }}>
        {items.map(it => (
          <NavLink
            key={it.to}
            to={it.to}
            style={({ isActive }) => ({
              ...linkBase,
              borderColor: isActive ? "rgba(167,139,250,.55)" : "rgba(255,255,255,.10)",
              background: isActive
                ? "linear-gradient(135deg, rgba(124,58,237,.28), rgba(255,255,255,.05))"
                : "rgba(255,255,255,.04)",
              boxShadow: isActive ? "0 14px 30px rgba(124,58,237,.18)" : "none",
            })}
          >
            <span style={{
              width:10, height:10, borderRadius: 999,
              background:"linear-gradient(135deg, rgba(167,139,250,.95), rgba(34,211,238,.5))",
              boxShadow:"0 0 18px rgba(167,139,250,.35)"
            }} />
            {it.label}
          </NavLink>
        ))}
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop:"1px solid rgba(255,255,255,.10)" }}>
        <div style={{ color:"rgba(236,235,255,.55)", fontSize: 12 }}>
          v1 • Elite UI
        </div>
      </div>
    </div>
  );
}
