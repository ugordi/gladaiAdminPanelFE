import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import Stat from "../components/ui/Stat";
import { toast } from "../components/ui/Toast";

import {
  getSettings,
  getXpRules,
  replaceBattleRewards,
  updateAdminSettings,
  updateEnergySettings,
  updatePvpSettings,
} from "../api/settings";

function Modal({ open, title, subtitle, children, onClose, width = 1100 }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        padding: 14,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="glass"
        style={{
          width: "100%",
          maxWidth: width,
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,.14)",
          boxShadow: "var(--shadow)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 14,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,.10)",
            background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 950, letterSpacing: ".2px" }}>{title}</div>
            {subtitle ? (
              <div style={{ marginTop: 6, fontSize: 12.5, color: "var(--muted)" }}>
                {subtitle}
              </div>
            ) : null}
          </div>
          <div style={{ width: 130 }}>
            <Button variant="ghost" onClick={onClose}>
              Kapat
            </Button>
          </div>
        </div>

        <div style={{ padding: 14 }}>{children}</div>
      </div>
    </div>
  );
}

function Badge({ text, variant = "violet" }) {
  const map = {
    violet: { b: "rgba(124,58,237,.16)", br: "rgba(167,139,250,.32)" },
    cyan: { b: "rgba(34,211,238,.12)", br: "rgba(34,211,238,.28)" },
    pink: { b: "rgba(244,114,182,.12)", br: "rgba(244,114,182,.26)" },
    ok: { b: "rgba(52,211,153,.12)", br: "rgba(52,211,153,.26)" },
    warn: { b: "rgba(251,191,36,.12)", br: "rgba(251,191,36,.26)" },
    bad: { b: "rgba(251,113,133,.12)", br: "rgba(251,113,133,.28)" },
  };
  const s = map[variant] || map.violet;
  return (
    <span
      className="glass"
      style={{
        padding: "7px 10px",
        borderRadius: 999,
        border: `1px solid ${s.br}`,
        background: `linear-gradient(135deg, ${s.b}, rgba(255,255,255,.03))`,
        fontWeight: 950,
        fontSize: 12,
        letterSpacing: ".22px",
        color: "rgba(236,235,255,.90)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function safeInt(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
}

const EMPTY_REWARD = {
  id: null,
  mode: "pve", // pve | pvp
  lvl_min: 1,
  lvl_max: 1,

  win_xp_min: 0,
  win_xp_max: 0,
  lose_xp_min: 0,
  lose_xp_max: 0,

  win_gold_min: 0,
  win_gold_max: 0,
  lose_gold_min: 0,
  lose_gold_max: 0,

  drop_chance_pct: 0,
  drop_count_min: 0,
  drop_count_max: 0,
  drop_tier_min: 1,
  drop_tier_max: 1,
};

function validateReward(r) {
  if (!r.mode) return "mode zorunlu";
  if (safeInt(r.lvl_min, 1) < 1) return "lvl_min >= 1 olmalı";
  if (safeInt(r.lvl_max, 1) < safeInt(r.lvl_min, 1)) return "lvl_max >= lvl_min olmalı";

  const fields = [
    "win_xp_min","win_xp_max","lose_xp_min","lose_xp_max",
    "win_gold_min","win_gold_max","lose_gold_min","lose_gold_max",
    "drop_chance_pct","drop_count_min","drop_count_max","drop_tier_min","drop_tier_max",
  ];
  for (const f of fields) {
    if (safeInt(r[f], 0) < 0) return `${f} negatif olamaz`;
  }
  if (safeInt(r.win_xp_max, 0) < safeInt(r.win_xp_min, 0)) return "win_xp_max >= win_xp_min";
  if (safeInt(r.lose_xp_max, 0) < safeInt(r.lose_xp_min, 0)) return "lose_xp_max >= lose_xp_min";
  if (safeInt(r.win_gold_max, 0) < safeInt(r.win_gold_min, 0)) return "win_gold_max >= win_gold_min";
  if (safeInt(r.lose_gold_max, 0) < safeInt(r.lose_gold_min, 0)) return "lose_gold_max >= lose_gold_min";

  const dc = safeInt(r.drop_chance_pct, 0);
  if (dc < 0 || dc > 100) return "drop_chance_pct 0..100 olmalı";
  if (safeInt(r.drop_count_max, 0) < safeInt(r.drop_count_min, 0)) return "drop_count_max >= drop_count_min";
  if (safeInt(r.drop_tier_min, 1) < 1 || safeInt(r.drop_tier_max, 1) > 5) return "drop tier 1..5 olmalı";
  if (safeInt(r.drop_tier_max, 1) < safeInt(r.drop_tier_min, 1)) return "drop_tier_max >= drop_tier_min";
  return null;
}

function normalizeRewards(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr.map((r) => ({
    ...EMPTY_REWARD,
    ...r,
    id: r.id ?? r.reward_id ?? r.rewardId ?? null,
    mode: r.mode || "pve",
  }));
}

export default function Settings() {
  const [bootLoading, setBootLoading] = useState(false);
  const [bootErr, setBootErr] = useState("");

  // from getSettings()
  const [pointsPerLevel, setPointsPerLevel] = useState(5);
  const [battleCost, setBattleCost] = useState(10);
  const [stealMin, setStealMin] = useState(5);
  const [stealMax, setStealMax] = useState(10);

  // xp rules preview
  const [xpLoading, setXpLoading] = useState(false);
  const [xpRules, setXpRules] = useState({ formula: "fn_xp_needed", preview: [] });

  // rewards
  const [mode, setMode] = useState("pve");
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [rewardsErr, setRewardsErr] = useState("");
  const [rewards, setRewards] = useState([]); // full list
  const [dirtyRewards, setDirtyRewards] = useState(false);

  // modal row edit
  const [openEditReward, setOpenEditReward] = useState(false);
  const [rewardForm, setRewardForm] = useState({ ...EMPTY_REWARD });

  const filteredRewards = useMemo(() => rewards.filter((r) => (r.mode || "pve") === mode), [rewards, mode]);

  async function boot() {
    setBootErr("");
    setBootLoading(true);
    try {
      const out = await getSettings();
      // Beklenen: { admin_settings, energy_rules, pvp_settings, battle_rewards }
      const admin = out?.admin_settings || out?.admin || out?.settings?.admin_settings || out?.settings || out;
      const energy = out?.energy_rules || out?.energy || out?.settings?.energy_rules;
      const pvp = out?.admin_pvp_settings || out?.pvp || out?.settings?.admin_pvp_settings;
      const br = out?.admin_battle_rewards || out?.battle_rewards || out?.settings?.admin_battle_rewards || [];

      setPointsPerLevel(safeInt(admin?.points_per_level ?? 5, 5));
      setBattleCost(safeInt(energy?.battle_cost ?? 10, 10));
      setStealMin(safeInt(pvp?.steal_pct_min ?? 5, 5));
      setStealMax(safeInt(pvp?.steal_pct_max ?? 10, 10));

      setRewards(normalizeRewards(br));
      setDirtyRewards(false);

      // xp preview
      await loadXpRules();
    } catch (e) {
      setBootErr(e?.message || "Settings alınamadı.");
    } finally {
      setBootLoading(false);
    }
  }

  async function loadXpRules() {
    setXpLoading(true);
    try {
      const out = await getXpRules();
      // Beklenen: { preview: [{level, xp_needed_total}] } gibi
      setXpRules({
        formula: out?.formula || "fn_xp_needed",
        preview: out?.preview || out?.items || out?.rows || [],
      });
    } catch {
      // xp preview şart değil
      setXpRules({ formula: "fn_xp_needed", preview: [] });
    } finally {
      setXpLoading(false);
    }
  }

  useEffect(() => {
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveAdmin() {
    try {
      const v = safeInt(pointsPerLevel, 0);
      if (v < 0) throw new Error("points_per_level negatif olamaz.");
      await updateAdminSettings({ points_per_level: v });
      toast.success("Level puanı kaydedildi.");
    } catch (e) {
      toast.error(e?.message || "Kaydedilemedi.");
    }
  }

  async function saveEnergy() {
    try {
      const v = safeInt(battleCost, 0);
      if (v < 0) throw new Error("battle_cost negatif olamaz.");
      await updateEnergySettings({ battle_cost: v });
      toast.success("Enerji ayarı kaydedildi.");
    } catch (e) {
      toast.error(e?.message || "Kaydedilemedi.");
    }
  }

  async function savePvp() {
    try {
      const mn = safeInt(stealMin, 0);
      const mx = safeInt(stealMax, 0);
      if (mn < 0 || mx < 0) throw new Error("Yüzde negatif olamaz.");
      if (mn > mx) throw new Error("steal_pct_min > steal_pct_max olamaz.");
      await updatePvpSettings({ steal_pct_min: mn, steal_pct_max: mx });
      toast.success("PvP ayarları kaydedildi.");
    } catch (e) {
      toast.error(e?.message || "Kaydedilemedi.");
    }
  }

  function openCreateReward() {
    setRewardForm({ ...EMPTY_REWARD, mode });
    setOpenEditReward(true);
  }

  function openEditRewardRow(r) {
    setRewardForm({ ...EMPTY_REWARD, ...r, mode: r.mode || mode });
    setOpenEditReward(true);
  }

  function upsertLocalReward(updated) {
    const vErr = validateReward(updated);
    if (vErr) throw new Error(vErr);

    setRewards((prev) => {
      // id varsa update, yoksa yeni id üret (client-only)
      if (updated.id) {
        const next = prev.map((x) => (x.id === updated.id ? updated : x));
        return next;
      }
      const newId = `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      return [{ ...updated, id: newId }, ...prev];
    });
    setDirtyRewards(true);
  }

  function deleteLocalReward(r) {
    const ok = window.confirm("Bu reward satırı silinsin mi?");
    if (!ok) return;
    setRewards((prev) => prev.filter((x) => x.id !== r.id));
    setDirtyRewards(true);
  }

  async function saveAllRewards() {
    setRewardsErr("");
    setRewardsLoading(true);
    try {
      // replaceBattleRewards: backend komple replace eder.
      // tmp_ id’leri backend ignore edebilir; payload’da id istemiyorsa temizleyelim.
      const payload = rewards.map((r) => {
        const clean = { ...r };
        if (String(clean.id || "").startsWith("tmp_")) delete clean.id;
        return clean;
      });

      await replaceBattleRewards(payload);
      toast.success("Ödül tabloları kaydedildi.");
      setDirtyRewards(false);
      await boot(); // refresh
    } catch (e) {
      setRewardsErr(e?.message || "Kaydedilemedi.");
      toast.error(e?.message || "Kaydedilemedi.");
    } finally {
      setRewardsLoading(false);
    }
  }

  const rewardColumns = useMemo(
    () => [
      {
        key: "range",
        title: "Level Aralığı",
        render: (r) => (
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Badge text={(r.mode || mode).toUpperCase()} variant={r.mode === "pvp" ? "pink" : "cyan"} />
              <span style={{ fontWeight: 950 }}>
                {r.lvl_min} → {r.lvl_max}
              </span>
              {String(r.id || "").startsWith("tmp_") ? <Badge text="NEW" variant="violet" /> : null}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              id:{" "}
              <span style={{ color: "rgba(236,235,255,.70)", fontWeight: 900 }}>
                {r.id || "—"}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "xp",
        title: "XP",
        render: (r) => (
          <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.45 }}>
            win:{" "}
            <span style={{ color: "rgba(236,235,255,.82)", fontWeight: 900 }}>
              {r.win_xp_min}-{r.win_xp_max}
            </span>
            <br />
            lose:{" "}
            <span style={{ color: "rgba(236,235,255,.70)", fontWeight: 900 }}>
              {r.lose_xp_min}-{r.lose_xp_max}
            </span>
          </div>
        ),
      },
      {
        key: "gold",
        title: "Gold",
        render: (r) => (
          <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.45 }}>
            win:{" "}
            <span style={{ color: "rgba(236,235,255,.82)", fontWeight: 900 }}>
              {r.win_gold_min}-{r.win_gold_max}
            </span>
            <br />
            lose:{" "}
            <span style={{ color: "rgba(236,235,255,.70)", fontWeight: 900 }}>
              {r.lose_gold_min}-{r.lose_gold_max}
            </span>
          </div>
        ),
      },
      {
        key: "drop",
        title: "Drop",
        render: (r) => (
          <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.45 }}>
            chance:{" "}
            <span style={{ color: "rgba(236,235,255,.82)", fontWeight: 900 }}>
              {r.drop_chance_pct}%
            </span>
            <br />
            count:{" "}
            <span style={{ color: "rgba(236,235,255,.72)", fontWeight: 900 }}>
              {r.drop_count_min}-{r.drop_count_max}
            </span>
            <br />
            tier:{" "}
            <span style={{ color: "rgba(236,235,255,.72)", fontWeight: 900 }}>
              {r.drop_tier_min}-{r.drop_tier_max}
            </span>
          </div>
        ),
      },
      {
        key: "actions",
        title: "İşlem",
        render: (r) => (
          <div style={{ display: "flex", gap: 10, width: 260 }}>
            <div style={{ width: 120 }}>
              <Button size="sm" variant="ghost" onClick={() => openEditRewardRow(r)}>
                Düzenle
              </Button>
            </div>
            <div style={{ width: 120 }}>
              <Button size="sm" variant="danger" onClick={() => deleteLocalReward(r)}>
                Sil
              </Button>
            </div>
          </div>
        ),
      },
    ],
    // eslint: fonksiyonlar inline değil, dependency gerekmez
    // çünkü openEditRewardRow/deleteLocalReward scope içinde stabil değil diye uyarabilir,
    // ama burada useMemo yerine normal array da yazılabilir. useMemo kalacaksa dependency yok.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode]
  );

  const xpColumns = useMemo(
    () => [
      { key: "level", title: "Level", render: (r) => <span style={{ fontWeight: 950 }}>{r.level ?? r.lvl ?? "—"}</span> },
      { key: "xp", title: "Total XP Threshold", render: (r) => <span style={{ color: "rgba(236,235,255,.86)", fontWeight: 900 }}>{r.xp_needed_total ?? r.xpNeededTotal ?? r.need ?? "—"}</span> },
    ],
    []
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card
        title="Oyun Ayarları"
        subtitle="level • enerji • ödül tabloları • pvp • xp curve"
        right={
          <div style={{ display: "flex", gap: 10, width: 360 }}>
            <Button variant="outline" onClick={() => { toast.info("Yenileniyor..."); boot(); }}>
              Yenile
            </Button>
            <Button variant="primary" onClick={() => toast.success("Ayarlar hazır.")}>
              Elite Control
            </Button>
          </div>
        }
      >
        {bootErr ? (
          <div
            className="glass"
            style={{
              borderRadius: 16,
              padding: "10px 12px",
              border: "1px solid rgba(251,113,133,.30)",
              color: "rgba(251,113,133,.90)",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {bootErr}
          </div>
        ) : null}

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
            <Stat variant="violet" label="Boot" value={bootLoading ? "Loading…" : "Ready"} />
            <Stat variant="cyan" label="Points/Level" value={String(pointsPerLevel)} />
            <Stat variant="pink" label="Battle Cost" value={`${battleCost} YE`} />
          </div>

          {/* Admin + Energy */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Card title="Level Puan Ayarı" subtitle="admin_settings.points_per_level" glow={false}>
              <div style={{ display: "grid", gap: 10 }}>
                <Input
                  label="points_per_level"
                  type="number"
                  min={0}
                  value={pointsPerLevel}
                  onChange={(e) => setPointsPerLevel(e.target.value)}
                  hint="Level atlayınca unspent_points kaç artacak?"
                />
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <div style={{ width: 220 }}>
                    <Button variant="primary" onClick={saveAdmin}>
                      Kaydet
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Enerji Kuralları" subtitle="energy_rules.battle_cost" glow={false}>
              <div style={{ display: "grid", gap: 10 }}>
                <Input
                  label="battle_cost"
                  type="number"
                  min={0}
                  value={battleCost}
                  onChange={(e) => setBattleCost(e.target.value)}
                  hint="Savaş başına enerji tüketimi."
                />
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <div style={{ width: 220 }}>
                    <Button variant="primary" onClick={saveEnergy}>
                      Kaydet
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* PvP */}
          <Card title="PvP Ayarları" subtitle="admin_pvp_settings" glow={false}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 260px", gap: 12, alignItems: "end" }}>
              <Input
                label="steal_pct_min"
                type="number"
                min={0}
                max={100}
                value={stealMin}
                onChange={(e) => setStealMin(e.target.value)}
                hint="Çalınacak gold yüzdesi min"
              />
              <Input
                label="steal_pct_max"
                type="number"
                min={0}
                max={100}
                value={stealMax}
                onChange={(e) => setStealMax(e.target.value)}
                hint="Çalınacak gold yüzdesi max"
              />
              <Button variant="primary" onClick={savePvp}>
                Kaydet
              </Button>
            </div>
          </Card>

          {/* XP Curve Preview */}
          <Card
            title="XP Curve Preview"
            subtitle={`Kaynak: ${xpRules.formula}${xpLoading ? " • loading..." : ""}`}
            glow={false}
            right={
              <div style={{ width: 180 }}>
                <Button variant="outline" onClick={() => loadXpRules()} loading={xpLoading}>
                  Yenile
                </Button>
              </div>
            }
          >
            <Table
              columns={xpColumns}
              rows={xpRules.preview}
              loading={xpLoading}
              emptyText="XP kuralı preview yok (getXpRules boş döndü)."
            />
          </Card>

          {/* Rewards */}
          <Card
            title="Battle Rewards"
            subtitle="admin_battle_rewards • mod seç • satır ekle/düzenle • sonra 'Tümünü Kaydet'"
            right={
              <div style={{ display: "flex", gap: 10, width: 520 }}>
                <div style={{ display: "grid", gap: 8, width: 210 }}>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Mode</div>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,.06)",
                      color: "rgba(236,235,255,.92)",
                      border: "1px solid rgba(255,255,255,.12)",
                      borderRadius: 14,
                      padding: "12px 12px",
                      fontWeight: 900,
                      outline: "none",
                      boxShadow: "0 12px 26px rgba(0,0,0,.25)",
                    }}
                  >
                    <option value="pve">PvE</option>
                    <option value="pvp">PvP</option>
                  </select>
                </div>

                <div style={{ width: 160, alignSelf: "end" }}>
                  <Button variant="primary" onClick={openCreateReward}>
                    + Reward
                  </Button>
                </div>

                <div style={{ width: 220, alignSelf: "end" }}>
                  <Button
                    variant={dirtyRewards ? "primary" : "outline"}
                    onClick={saveAllRewards}
                    loading={rewardsLoading}
                  >
                    {dirtyRewards ? "Tümünü Kaydet *" : "Tümünü Kaydet"}
                  </Button>
                </div>
              </div>
            }
          >
            {rewardsErr ? (
              <div
                className="glass"
                style={{
                  borderRadius: 16,
                  padding: "10px 12px",
                  border: "1px solid rgba(251,113,133,.30)",
                  color: "rgba(251,113,133,.90)",
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                {rewardsErr}
              </div>
            ) : null}

            <Table
              columns={rewardColumns}
              rows={filteredRewards}
              loading={rewardsLoading}
              emptyText="Bu mode için reward yok."
            />
          </Card>
        </div>
      </Card>

      {/* Reward modal */}
      <Modal
        open={openEditReward}
        onClose={() => setOpenEditReward(false)}
        title={rewardForm.id ? "Reward Düzenle" : "Yeni Reward"}
        subtitle="Local edit → sonra 'Tümünü Kaydet' (replaceBattleRewards)"
      >
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 1fr", gap: 12, alignItems: "end" }}>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Mode</div>
              <select
                value={rewardForm.mode}
                onChange={(e) => setRewardForm((p) => ({ ...p, mode: e.target.value }))}
                style={{
                  background: "rgba(255,255,255,.06)",
                  color: "rgba(236,235,255,.92)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 14,
                  padding: "12px 12px",
                  fontWeight: 900,
                  outline: "none",
                  boxShadow: "0 12px 26px rgba(0,0,0,.25)",
                }}
              >
                <option value="pve">PvE</option>
                <option value="pvp">PvP</option>
              </select>
            </div>

            <Input
              label="lvl_min"
              type="number"
              min={1}
              value={rewardForm.lvl_min}
              onChange={(e) => setRewardForm((p) => ({ ...p, lvl_min: e.target.value }))}
            />
            <Input
              label="lvl_max"
              type="number"
              min={1}
              value={rewardForm.lvl_max}
              onChange={(e) => setRewardForm((p) => ({ ...p, lvl_max: e.target.value }))}
            />
          </div>

          <Card title="XP" subtitle="win/lose" glow={false}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10 }}>
              <Input label="win_xp_min" type="number" min={0} value={rewardForm.win_xp_min} onChange={(e) => setRewardForm((p) => ({ ...p, win_xp_min: e.target.value }))} />
              <Input label="win_xp_max" type="number" min={0} value={rewardForm.win_xp_max} onChange={(e) => setRewardForm((p) => ({ ...p, win_xp_max: e.target.value }))} />
              <Input label="lose_xp_min" type="number" min={0} value={rewardForm.lose_xp_min} onChange={(e) => setRewardForm((p) => ({ ...p, lose_xp_min: e.target.value }))} />
              <Input label="lose_xp_max" type="number" min={0} value={rewardForm.lose_xp_max} onChange={(e) => setRewardForm((p) => ({ ...p, lose_xp_max: e.target.value }))} />
            </div>
          </Card>

          <Card title="Gold" subtitle="win/lose" glow={false}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10 }}>
              <Input label="win_gold_min" type="number" min={0} value={rewardForm.win_gold_min} onChange={(e) => setRewardForm((p) => ({ ...p, win_gold_min: e.target.value }))} />
              <Input label="win_gold_max" type="number" min={0} value={rewardForm.win_gold_max} onChange={(e) => setRewardForm((p) => ({ ...p, win_gold_max: e.target.value }))} />
              <Input label="lose_gold_min" type="number" min={0} value={rewardForm.lose_gold_min} onChange={(e) => setRewardForm((p) => ({ ...p, lose_gold_min: e.target.value }))} />
              <Input label="lose_gold_max" type="number" min={0} value={rewardForm.lose_gold_max} onChange={(e) => setRewardForm((p) => ({ ...p, lose_gold_max: e.target.value }))} />
            </div>
          </Card>

          <Card title="Drop" subtitle="chance + count + tier" glow={false}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 10 }}>
              <Input label="drop_chance_pct" type="number" min={0} max={100} value={rewardForm.drop_chance_pct} onChange={(e) => setRewardForm((p) => ({ ...p, drop_chance_pct: e.target.value }))} />
              <Input label="drop_count_min" type="number" min={0} value={rewardForm.drop_count_min} onChange={(e) => setRewardForm((p) => ({ ...p, drop_count_min: e.target.value }))} />
              <Input label="drop_count_max" type="number" min={0} value={rewardForm.drop_count_max} onChange={(e) => setRewardForm((p) => ({ ...p, drop_count_max: e.target.value }))} />
              <Input label="drop_tier_min" type="number" min={1} max={5} value={rewardForm.drop_tier_min} onChange={(e) => setRewardForm((p) => ({ ...p, drop_tier_min: e.target.value }))} />
              <Input label="drop_tier_max" type="number" min={1} max={5} value={rewardForm.drop_tier_max} onChange={(e) => setRewardForm((p) => ({ ...p, drop_tier_max: e.target.value }))} />
            </div>
            <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 12 }}>
              Kural: yüzde 0..100, tier 1..5, max bÜYÜKKK min.
            </div>
          </Card>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <div style={{ width: 160 }}>
              <Button variant="ghost" onClick={() => setOpenEditReward(false)}>
                İptal
              </Button>
            </div>
            <div style={{ width: 240 }}>
              <Button
                variant="primary"
                onClick={() => {
                  try {
                    upsertLocalReward(rewardForm);
                    toast.success("Satır güncellendi. (Kaydetmek için 'Tümünü Kaydet')");
                    setOpenEditReward(false);
                  } catch (e) {
                    toast.error(e?.message || "Geçersiz değer.");
                  }
                }}
              >
                Satırı Uygula
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
