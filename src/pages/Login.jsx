import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { toast } from "../components/ui/Toast";
import { loginApi, logAdminLoginApi } from "../api/auth";
import { setToken } from "../auth/token";

/** 1) {accessToken, refreshToken}  2) {ok:true, data:{accessToken, refreshToken}} */
function extractTokens(res) {
  return {
    accessToken: res?.accessToken || res?.data?.accessToken || null,
    refreshToken: res?.refreshToken || res?.data?.refreshToken || null,
  };
}

function pickErrorText(ex) {
  const data = ex?.response?.data ?? ex?.data;
  if (data && typeof data === "object") {
    const m = data.message || data.error?.message || data.error?.code || data.code;
    if (typeof m === "string") return m;
    try {
      return JSON.stringify(data);
    } catch {}
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
      const res = await loginApi({ username: username.trim(), password });
      const { accessToken, refreshToken } = extractTokens(res);

      if (!accessToken) throw new Error("Sunucudan accessToken gelmedi.");

      setToken(accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      else localStorage.removeItem("refreshToken");

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
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 18,
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(900px 520px at 12% 10%, rgba(76,29,149,.28), transparent 62%)," +
          "radial-gradient(820px 440px at 92% 6%, rgba(6,182,212,.10), transparent 64%)," +
          "radial-gradient(900px 520px at 70% 92%, rgba(219,39,119,.10), transparent 66%)," +
          "linear-gradient(180deg, #02010a, #050313 55%, #02010a)",
      }}
    >
      {/* very subtle grid */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.06,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(560px 420px at 50% 30%, black, transparent 72%)",
        }}
      />

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        {/* Top brand (clean) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div
            className="glass"
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(255,255,255,.10)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02))," +
                "radial-gradient(120% 140% at 20% 10%, rgba(124,58,237,.28), transparent 60%)",
              boxShadow: "0 18px 60px rgba(0,0,0,.60)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "linear-gradient(135deg, rgba(124,58,237,.95), rgba(6,182,212,.20))",
                boxShadow: "0 0 18px rgba(124,58,237,.24)",
              }}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 950, letterSpacing: ".25px" }}>Gladialore</div>
            <div style={{ marginTop: 4, fontSize: 12, color: "rgba(242,240,255,.55)" }}>Admin</div>
          </div>
        </div>

        <Card
          title="Giriş"
          glow={false}
          style={{
            border: "1px solid rgba(255,255,255,.10)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02))," +
              "radial-gradient(120% 140% at 18% 10%, rgba(76,29,149,.20), transparent 62%)",
            boxShadow: "0 26px 90px rgba(0,0,0,.65)",
          }}
        >
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            <Input
              label="Kullanıcı Adı"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              inputStyle={{
                background: "rgba(0,0,0,.22)",
                border: "1px solid rgba(255,255,255,.12)",
                boxShadow: "0 12px 28px rgba(0,0,0,.45)",
              }}
            />

            <Input
              label="Şifre"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              inputStyle={{
                background: "rgba(0,0,0,.22)",
                border: "1px solid rgba(255,255,255,.12)",
                boxShadow: "0 12px 28px rgba(0,0,0,.45)",
              }}
            />

            {err ? (
              <div
                style={{
                  borderRadius: 14,
                  padding: 12,
                  border: "1px solid rgba(251,113,133,.28)",
                  background: "rgba(251,113,133,.07)",
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

            <div style={{ display: "grid", gap: 10, marginTop: 4 }}>
              <Button
                type="submit"
                disabled={!canSubmit}
                loading={loading}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,.95), rgba(76,29,149,.78) 58%, rgba(6,182,212,.18))",
                  border: "1px solid rgba(124,58,237,.30)",
                  boxShadow: "0 18px 52px rgba(124,58,237,.18)",
                }}
              >
                Giriş Yap
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setUsername("admin");
                  setPassword("");
                  setErr("");
                }}
                style={{
                  background: "rgba(0,0,0,.16)",
                  border: "1px solid rgba(255,255,255,.10)",
                  color: "rgba(242,240,255,.86)",
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
