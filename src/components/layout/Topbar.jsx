import Button from "../ui/Button";
import { clearToken } from "../../auth/token";
import { useNavigate } from "react-router-dom";

export default function Topbar(){
  const nav = useNavigate();

  const logout = () => {
    clearToken();
    nav("/login", { replace: true });
  };

  return (
    <div className="glass" style={{
      borderRadius: 22,
      padding: 14,
      display:"flex",
      alignItems:"center",
      justifyContent:"space-between",
      gap: 12
    }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: 14 }}>Yönetim</div>
        <div style={{ fontSize: 12, color:"rgba(236,235,255,.62)", marginTop: 4 }}>
          Dünya • Düşman • Eşya • Ayarlar
        </div>
      </div>

      <div style={{ display:"flex", gap: 10, width: 220 }}>
        <Button variant="ghost" type="button" onClick={logout}>Çıkış</Button>
      </div>
    </div>
  );
}
