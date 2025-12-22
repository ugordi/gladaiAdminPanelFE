import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Stat from "../components/ui/Stat";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { toast } from "../components/ui/Toast";
import { getSettings } from "../api/settings";

/**
 * Dashboard: şimdilik backend bağımlılığı minimum.
 * - /admin/settings varsa gösterir
 * - yoksa sadece güzel bir overview
 */
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
      // settings endpoint'i daha hazır değilse dashboard yine çalışsın
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
      { key: "lvl", title: "Level Aralığı", render: (r) => `${r.lvl_min} - ${r.lvl_max}` },
      { key: "xp", title: "Win XP", render: (r) => `${r.win_xp_min} - ${r.win_xp_max}` },
      { key: "gold", title: "Win Gold", render: (r) => `${r.win_gold_min} - ${r.win_gold_max}` },
      {
        key: "drop",
        title: "Drop",
        render: (r) =>
          r.drop_chance_pct != null
            ? `${r.drop_chance_pct}% • ${r.drop_count_min}-${r.drop_count_max} • T${r.drop_tier_min}-T${r.drop_tier_max}`
            : "-",
      },
    ],
    []
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Hero / header */}
      <Card
        title="Dashboard"
        subtitle="Dünya, düşman, eşya ve oyun dengelerini buradan yönetirsin."
        right={
          <div style={{ display: "flex", gap: 10, width: 220 }}>
            <Button
              variant="outline"
              onClick={() => {
                toast.info("Yenileniyor...");
                load();
              }}
            >
              Yenile
            </Button>
          </div>
        }
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
            value={overview.pointsPerLevel != null ? overview.pointsPerLevel : (loading ? "…" : "—")}
            right={
              <span style={{ color: "rgba(236,235,255,.55)", fontSize: 12 }}>
                admin_settings
              </span>
            }
          />
          <Stat
            variant="cyan"
            label="Savaş Enerji Maliyeti"
            value={overview.battleCost != null ? overview.battleCost : (loading ? "…" : "—")}
            right={
              <span style={{ color: "rgba(236,235,255,.55)", fontSize: 12 }}>
                energy_rules
              </span>
            }
          />
          <Stat
            variant="pink"
            label="PvP Altın Çalma"
            value={overview.pvpSteal != null ? overview.pvpSteal : (loading ? "…" : "—")}
            right={
              <span style={{ color: "rgba(236,235,255,.55)", fontSize: 12 }}>
                pvp_settings
              </span>
            }
          />
        </div>

        {err ? (
          <div
            className="glass"
            style={{
              marginTop: 12,
              borderRadius: 16,
              padding: 12,
              border: "1px solid rgba(251,191,36,.28)",
              background:
                "linear-gradient(135deg, rgba(251,191,36,.08), rgba(255,255,255,.03))",
              color: "rgba(236,235,255,.82)",
              fontSize: 13,
              lineHeight: 1.35,
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 6, color: "rgba(251,191,36,.95)" }}>
              Bilgi
            </div>
            <div>
              Ayarlar endpoint’i henüz hazır değilse sorun değil. Dashboard yine çalışır. <br />
              (Hata: <span style={{ color: "rgba(236,235,255,.70)" }}>{err}</span>)
            </div>
          </div>
        ) : null}
      </Card>

      {/* Rewards preview */}
      <Card
        title="Ödül & Drop Kuralları"
        subtitle="İlk 6 satır önizleme. Tam yönetim: Ayarlar sayfasında."
        right={
          <div style={{ width: 220 }}>
            <Button
              variant="ghost"
              onClick={() => toast.info("Ayarlar sayfasını birazdan yapacağız.")}
            >
              Ayarlara Git
            </Button>
          </div>
        }
      >
        <Table
          columns={rewardColumns}
          rows={overview.rewardRows}
          loading={loading}
          emptyText="Henüz kural yok. /admin/battle-rewards ile eklenecek."
        />
      </Card>

      {/* Quick actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <Card
          title="Hızlı İşlemler"
          subtitle="En sık kullanılan yönetim aksiyonları."
        >
          <div style={{ display: "grid", gap: 10 }}>
            <Button
              variant="primary"
              onClick={() => toast.info("Users sayfasını sıradaki adımda tamamlıyoruz.")}
            >
              Kullanıcı Yönetimi (Ban/Unban)
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info("Bölgeler ekranı: isim/görsel/hikaye. Sonra geliyor.")}
            >
              Bölge Düzenle
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info("Düşmanlar ekranı: stat + loot + xp/gold. Sonra geliyor.")}
            >
              Düşman Düzenle
            </Button>
          </div>
        </Card>

        <Card
          title="Sistem Durumu"
          subtitle="Panel arayüzü elit tema ile hazır. Backend bağlandıkça modüller aktif."
        >
          <div style={{ display: "grid", gap: 12 }}>
            <div
              className="glass"
              style={{
                borderRadius: 18,
                padding: 12,
                border: "1px solid rgba(255,255,255,.10)",
                color: "rgba(236,235,255,.80)",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Tema</div>
              <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.35 }}>
                Elite Purple Night • Glass UI • Neon glow • Soft grid
              </div>
            </div>

            <div
              className="glass"
              style={{
                borderRadius: 18,
                padding: 12,
                border: "1px solid rgba(255,255,255,.10)",
                color: "rgba(236,235,255,.80)",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Backend</div>
              <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.35 }}>
                Ayarlar endpoint’i yoksa dashboard fallback ile çalışır. Endpointleri sırayla bağlayacağız.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
