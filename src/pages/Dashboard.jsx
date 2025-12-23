import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Stat from "../components/ui/Stat";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { toast } from "../components/ui/Toast";
import { getSettings } from "../api/settings";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const s = await getSettings();
      setSettings(s);
    } catch (e) {
      setErr(e?.message || "Ayarlar alınamadı.");
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overview = useMemo(() => {
    const pointsPerLevel = settings?.admin_settings?.points_per_level;
    const battleCost = settings?.energy_rules?.battle_cost;
    const pvpMin = settings?.pvp_settings?.steal_pct_min;
    const pvpMax = settings?.pvp_settings?.steal_pct_max;

    return {
      pointsPerLevel: typeof pointsPerLevel === "number" ? pointsPerLevel : null,
      battleCost: typeof battleCost === "number" ? battleCost : null,
      pvpSteal: pvpMin != null && pvpMax != null ? `${pvpMin}% – ${pvpMax}%` : null,
      rewardRows: Array.isArray(settings?.battle_rewards) ? settings.battle_rewards.slice(0, 6) : [],
    };
  }, [settings]);

  const rewardColumns = useMemo(
    () => [
      { key: "mode", title: "Mod", render: (r) => (r.mode || "").toUpperCase() },
      { key: "lvl", title: "Level", render: (r) => `${r.lvl_min} - ${r.lvl_max}` },
      { key: "xp", title: "Win XP", render: (r) => `${r.win_xp_min} - ${r.win_xp_max}` },
      { key: "gold", title: "Win Gold", render: (r) => `${r.win_gold_min} - ${r.win_gold_max}` },
      {
        key: "drop",
        title: "Drop",
        render: (r) =>
          r.drop_chance_pct != null
            ? `${r.drop_chance_pct}% • ${r.drop_count_min}-${r.drop_count_max} • T${r.drop_tier_min}-T${r.drop_tier_max}`
            : "—",
      },
    ],
    []
  );

  const heroStyle = {
    border: "1px solid rgba(255,255,255,.10)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02))," +
      "radial-gradient(120% 140% at 12% 0%, rgba(76,29,149,.22), transparent 62%)",
    boxShadow: "0 28px 92px rgba(0,0,0,.62)",
  };

  const chip = {
    fontSize: 12,
    color: "rgba(245,243,255,.60)", // açık / okunur
    letterSpacing: ".15px",
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card
        title="Dashboard"
        subtitle="Oyun dengelerini ve içerikleri buradan yönet."
        right={
          <div style={{ display: "flex", gap: 10, width: 220 }}>
            <Button
              variant="outline"
              onClick={() => {
                toast.info("Yenileniyor...");
                load();
              }}
              style={{
                background: "rgba(0,0,0,.14)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "rgba(245,243,255,.92)",
              }}
            >
              Yenile
            </Button>
          </div>
        }
        style={heroStyle}
        glow={false}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <Stat
            variant="violet"
            label="Level Başına Puan"
            value={overview.pointsPerLevel != null ? overview.pointsPerLevel : loading ? "…" : "—"}
            right={<span style={chip}>admin_settings</span>}
            style={{
              border: "1px solid rgba(255,255,255,.10)",
              background:
                "linear-gradient(135deg, rgba(124,58,237,.16), rgba(0,0,0,.12))",
              boxShadow: "0 18px 48px rgba(0,0,0,.48)",
            }}
          />
          <Stat
            variant="cyan"
            label="Savaş Enerji Maliyeti"
            value={overview.battleCost != null ? overview.battleCost : loading ? "…" : "—"}
            right={<span style={chip}>energy_rules</span>}
            style={{
              border: "1px solid rgba(255,255,255,.10)",
              background:
                "linear-gradient(135deg, rgba(6,182,212,.10), rgba(0,0,0,.12))",
              boxShadow: "0 18px 48px rgba(0,0,0,.48)",
            }}
          />
          <Stat
            variant="pink"
            label="PvP Altın Çalma"
            value={overview.pvpSteal != null ? overview.pvpSteal : loading ? "…" : "—"}
            right={<span style={chip}>pvp_settings</span>}
            style={{
              border: "1px solid rgba(255,255,255,.10)",
              background:
                "linear-gradient(135deg, rgba(219,39,119,.10), rgba(0,0,0,.12))",
              boxShadow: "0 18px 48px rgba(0,0,0,.48)",
            }}
          />
        </div>

        {err ? (
          <div
            style={{
              marginTop: 12,
              borderRadius: 16,
              padding: 12,
              border: "1px solid rgba(245,158,11,.22)",
              background:
                "linear-gradient(180deg, rgba(245,158,11,.08), rgba(0,0,0,.12))",
              color: "rgba(245,243,255,.86)",
              fontSize: 13,
              lineHeight: 1.35,
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 6, color: "rgba(245,158,11,.95)" }}>
              Bilgi
            </div>
            <div style={{ color: "rgba(245,243,255,.72)" }}>
              Ayarlar endpoint’i hazır değilse dashboard fallback ile çalışır. ({err})
            </div>
          </div>
        ) : null}
      </Card>

      <Card
        title="Ödül & Drop Kuralları"
        subtitle="İlk 6 satır önizleme."
        right={
          <div style={{ width: 220 }}>
            <Button
              variant="ghost"
              onClick={() => toast.info("Ayarlar sayfasını sıradaki adımda bağlıyoruz.")}
              style={{
                background: "rgba(0,0,0,.12)",
                border: "1px solid rgba(255,255,255,.10)",
                color: "rgba(245,243,255,.92)",

              }}
            >
              Ayarlara Git
            </Button>
          </div>
        }
        glow={false}
        style={{
          border: "1px solid rgba(255,255,255,.10)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))," +
            "radial-gradient(120% 140% at 10% 0%, rgba(76,29,149,.18), transparent 62%)",
          boxShadow: "0 24px 84px rgba(0,0,0,.60)",
        }}
      >
        <Table
          columns={rewardColumns}
          rows={overview.rewardRows}
          loading={loading}
          emptyText="Henüz kural yok."
          style={{
            border: "1px solid rgba(255,255,255,.10)",
            background:
              "linear-gradient(180deg, rgba(0,0,0,.18), rgba(255,255,255,.02))",
          }}
        />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
        <Card
          title="Hızlı İşlemler"
          subtitle="Sık kullanılan aksiyonlar."
          glow={false}
          style={{
            border: "1px solid rgba(255,255,255,.10)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))",
            boxShadow: "0 22px 76px rgba(0,0,0,.58)",
          }}
        >
          <div style={{ display: "grid", gap: 10 }}>
            <Button
              variant="primary"
              onClick={() => toast.info("Users sayfası sıradaki adım.")}
              style={{
                background:
                  "linear-gradient(135deg, rgba(124,58,237,.95), rgba(76,29,149,.72) 60%, rgba(0,0,0,.10))",
                border: "1px solid rgba(124,58,237,.28)",
                boxShadow: "0 18px 54px rgba(124,58,237,.16)",
              }}
            >
              Kullanıcı Yönetimi
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.info("Bölgeler ekranı sonra geliyor.")}
              style={{
                background: "rgba(0,0,0,.12)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "rgba(245,243,255,.92)",

              }}
            >
              Bölge Düzenle
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.info("Düşmanlar ekranı sonra geliyor.")}
              style={{
                background: "rgba(0,0,0,.12)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "rgba(245,243,255,.92)",

              }}
            >
              Düşman Düzenle
            </Button>
          </div>
        </Card>

        <Card
          title="Sistem"
          subtitle="Arayüz hazır. Endpointler geldikçe modüller aktif."
          glow={false}
          style={{
            border: "1px solid rgba(255,255,255,.10)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))," +
              "radial-gradient(120% 140% at 90% 10%, rgba(6,182,212,.08), transparent 62%)",
            boxShadow: "0 22px 76px rgba(0,0,0,.58)",
          }}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                borderRadius: 16,
                padding: 12,
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(0,0,0,.14)",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Tema</div>
              <div style={{ color: "rgba(245,243,255,.70)", fontSize: 13, lineHeight: 1.35 }}>
                Night Violet • Dark glass • Low glow
              </div>
            </div>

            <div
              style={{
                borderRadius: 16,
                padding: 12,
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(0,0,0,.14)",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Backend</div>
              <div style={{ color: "rgba(245,243,255,.70)", fontSize: 13, lineHeight: 1.35 }}>
                Ayarlar yoksa fallback çalışır. Endpointleri sırayla bağlayacağız.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
