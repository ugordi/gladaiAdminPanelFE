import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { toast } from "../components/ui/Toast";
import { loginApi, logAdminLoginApi } from "../api/auth";
import { setToken } from "../auth/token";

// Backend response normalize:
// 1) { accessToken, refreshToken }
// 2) { ok:true, data:{ accessToken, refreshToken } }
function extractTokens(res) {
  if (!res) return { accessToken: null, refreshToken: null };

  const directAccess = res.accessToken;
  const directRefresh = res.refreshToken;

  const wrappedAccess = res?.data?.accessToken;
  const wrappedRefresh = res?.data?.refreshToken;

  return {
    accessToken: directAccess || wrappedAccess || null,
    refreshToken: directRefresh || wrappedRefresh || null,
  };
}

function pickErrorText(ex) {
  // axios normalize vs klasik
  const data = ex?.response?.data ?? ex?.data;

  // { ok:false, error:{message} } vb
  if (data && typeof data === "object") {
    const m =
      data.message ||
      data.error?.message ||
      data.error?.code ||
      data.code ||
      null;

    if (typeof m === "string") return m;
    try {
      return JSON.stringify(data);
    } catch {
      return "Giriş başarısız.";
    }
  }

  if (typeof data === "string") return data;
  if (typeof ex?.message === "string") return ex.message;

  return "Giriş başarısız.";
}

export default function Login() {
  const nav = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => {
    return username.trim().length >= 3 && password.trim().length >= 6 && !loading;
  }, [username, password, loading]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // IMPORTANT: backend body: { kullanici_adi, sifre }
      const res = await loginApi({
        username: username.trim(),
        password,
      });

      const { accessToken, refreshToken } = extractTokens(res);

      if (!accessToken) {
        // debug istersen:
        // console.log("loginApi raw:", res);
        throw new Error("Sunucudan accessToken gelmedi.");
      }

      setToken(accessToken);

      // refresh token sakla (backend logout/refresh için lazım)
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      } else {
        localStorage.removeItem("refreshToken");
      }

      // opsiyonel audit (token http interceptor ile otomatik gidecek)
      try {
        await logAdminLoginApi({
          ua: navigator.userAgent,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      } catch {}

      toast.success("Giriş başarılı.");
      nav("/", { replace: true });
    } catch (ex) {
      const msg = pickErrorText(ex);
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 18 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* minimal brand */}
        <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <span
            className="glass"
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(139,92,246,.22)",
              background: "linear-gradient(135deg, rgba(91,33,182,.18), rgba(255,255,255,.03))",
              boxShadow: "0 22px 55px rgba(91,33,182,.14)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "linear-gradient(135deg, rgba(139,92,246,.92), rgba(34,211,238,.18))",
                boxShadow: "0 0 16px rgba(139,92,246,.22)",
              }}
            />
          </span>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 950, letterSpacing: ".2px" }}>Gladialore</div>
            <div style={{ marginTop: 5, fontSize: 12.5, color: "var(--muted)" }}>Admin</div>
          </div>
        </div>

        <Card title="Giriş" subtitle="Admin kullanıcı bilgilerinle devam et." glow>
          <div style={{ height: 1, background: "rgba(255,255,255,.07)", margin: "0 0 14px 0" }} />

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            <Input
              label="Kullanıcı Adı"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />

            <Input
              label="Şifre"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {err ? (
              <div
                className="glass"
                style={{
                  borderRadius: 16,
                  padding: 12,
                  border: "1px solid rgba(251,113,133,.30)",
                  background: "linear-gradient(135deg, rgba(251,113,133,.08), rgba(255,255,255,.02))",
                  color: "rgba(251,113,133,.92)",
                  fontSize: 13,
                  lineHeight: 1.35,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {err}
              </div>
            ) : null}

            <div style={{ display: "grid", gap: 10, marginTop: 2 }}>
              <Button type="submit" disabled={!canSubmit} loading={loading}>
                Giriş Yap
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setUsername("admin");
                  setPassword("");
                  setErr("");
                  toast.info("Temizlendi.");
                }}
              >
                Temizle
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
