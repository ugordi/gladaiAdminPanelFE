import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import Stat from "../components/ui/Stat";
import { toast } from "../components/ui/Toast";

import {
  listEnemies,
  getEnemy,
  createEnemy,
  updateEnemy,
  deleteEnemy,
  updateEnemyRewards,
  updateEnemyLoot,
} from "../api/enemies";

function Modal({ open, title, subtitle, children, onClose, width = 1060 }) {
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
            background:
              "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))",
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

function fmtDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
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

const EMPTY_FORM = {
  code: "",
  name: "",
  base_level: 1,

  guc: 1,
  ceviklik: 1,
  dayaniklilik: 1,
  karizma: 1,
  zeka: 1,
  beceri: 0,

  description: "",
  icon_asset_id: "",
  battle_anim_url: "",
  is_boss: false,

  // rewards
  win_xp_min: 0,
  win_xp_max: 0,
  lose_xp_min: 0,
  lose_xp_max: 0,

  win_gold_min: 0,
  win_gold_max: 0,
  lose_gold_min: 0,
  lose_gold_max: 0,

  // loot
  loot_chance_total: 0,
  loot_t1: 0,
  loot_t2: 0,
  loot_t3: 0,
  loot_t4: 0,
  loot_t5: 0,

  // ai
  ai_profile: "{}",
};

function safeInt(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
}

function safeBool(v) {
  return !!v;
}

function validateLoot(form) {
  const total = safeInt(form.loot_chance_total, 0);
  const t1 = safeInt(form.loot_t1, 0);
  const t2 = safeInt(form.loot_t2, 0);
  const t3 = safeInt(form.loot_t3, 0);
  const t4 = safeInt(form.loot_t4, 0);
  const t5 = safeInt(form.loot_t5, 0);
  const sum = t1 + t2 + t3 + t4 + t5;

  if (total < 0 || total > 100) return "loot_chance_total 0..100 olmalı.";
  if (sum > 100) return "loot_t1..t5 toplamı 100'ü geçemez.";
  return null;
}

export default function Enemies() {
  const [q, setQ] = useState("");
  const [boss, setBoss] = useState("all"); // all|1|0
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(0);
  const offset = page * limit;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ items: [], total: 0 });

  // edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editMode, setEditMode] = useState("create");
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // detail modal
  const [openDetail, setOpenDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const params = { q, limit, offset };
      if (boss !== "all") params.is_boss = boss === "1";

      const out = await listEnemies(params);
      setData({
        items: out?.items || [],
        total: out?.total ?? (out?.items?.length || 0),
      });
    } catch (e) {
      setErr(e?.message || "Düşmanlar alınamadı.");
      setData({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, page, boss]);

  const totalPages = useMemo(() => {
    const t = Number(data.total || 0);
    return Math.max(1, Math.ceil(t / limit));
  }, [data.total, limit]);

  function applySearch() {
    setPage(0);
    load();
  }

  function openCreate() {
    setEditMode("create");
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setOpenEdit(true);
  }

  async function openEditEnemy(id) {
    setEditMode("edit");
    setEditId(id);
    setOpenEdit(true);
    setSaving(false);

    try {
      const res = await getEnemy(id);
      const e = res?.enemy || res;
      setForm({
        ...EMPTY_FORM,
        ...e,
        // ai_profile jsonb -> stringify
        ai_profile: typeof e?.ai_profile === "string" ? e.ai_profile : JSON.stringify(e?.ai_profile ?? {}, null, 2),
        icon_asset_id: e?.icon_asset_id || "",
        battle_anim_url: e?.battle_anim_url || "",
      });
    } catch (ex) {
      toast.error(ex?.message || "Düşman alınamadı.");
      setOpenEdit(false);
    }
  }

  async function openDetailEnemy(id) {
    setOpenDetail(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await getEnemy(id);
      setDetail(res?.enemy || res);
    } catch (e) {
      toast.error(e?.message || "Detay alınamadı.");
      setOpenDetail(false);
    } finally {
      setDetailLoading(false);
    }
  }

  function buildPayload(formState) {
    const lootErr = validateLoot(formState);
    if (lootErr) throw new Error(lootErr);

    let aiObj = {};
    try {
      const str = (formState.ai_profile || "{}").trim() || "{}";
      aiObj = JSON.parse(str);
    } catch {
      throw new Error("ai_profile geçerli JSON olmalı.");
    }

    const payload = {
      code: (formState.code || "").trim(),
      name: (formState.name || "").trim(),
      base_level: safeInt(formState.base_level, 1),

      guc: safeInt(formState.guc, 1),
      ceviklik: safeInt(formState.ceviklik, 1),
      dayaniklilik: safeInt(formState.dayaniklilik, 1),
      karizma: safeInt(formState.karizma, 1),
      zeka: safeInt(formState.zeka, 1),
      beceri: safeInt(formState.beceri, 0),

      description: formState.description || "",
      icon_asset_id: (formState.icon_asset_id || "").trim() || null,
      battle_anim_url: (formState.battle_anim_url || "").trim() || null,
      is_boss: safeBool(formState.is_boss),

      win_xp_min: safeInt(formState.win_xp_min, 0),
      win_xp_max: safeInt(formState.win_xp_max, 0),
      lose_xp_min: safeInt(formState.lose_xp_min, 0),
      lose_xp_max: safeInt(formState.lose_xp_max, 0),

      win_gold_min: safeInt(formState.win_gold_min, 0),
      win_gold_max: safeInt(formState.win_gold_max, 0),
      lose_gold_min: safeInt(formState.lose_gold_min, 0),
      lose_gold_max: safeInt(formState.lose_gold_max, 0),

      loot_chance_total: safeInt(formState.loot_chance_total, 0),
      loot_t1: safeInt(formState.loot_t1, 0),
      loot_t2: safeInt(formState.loot_t2, 0),
      loot_t3: safeInt(formState.loot_t3, 0),
      loot_t4: safeInt(formState.loot_t4, 0),
      loot_t5: safeInt(formState.loot_t5, 0),

      ai_profile: aiObj,
    };

    if (!payload.code) throw new Error("code zorunlu.");
    if (!payload.name) throw new Error("name zorunlu.");
    return payload;
  }

  async function saveEnemy() {
    setSaving(true);
    try {
      const payload = buildPayload(form);

      if (editMode === "create") {
        await createEnemy(payload);
        toast.success("Düşman oluşturuldu.");
      } else {
        await updateEnemy(editId, payload);
        toast.success("Düşman güncellendi.");
      }

      setOpenEdit(false);
      setPage(0);
      await load();
    } catch (e) {
      toast.error(e?.message || "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function quickSaveRewardsLoot() {
    // (Opsiyonel) backend split endpoint destekliyorsa:
    // /rewards ve /loot. Yoksa updateEnemy ile zaten kaydedebilirsin.
    if (!editId) return;

    try {
      const lootErr = validateLoot(form);
      if (lootErr) throw new Error(lootErr);

      await Promise.allSettled([
        updateEnemyRewards(editId, {
          win_xp_min: safeInt(form.win_xp_min, 0),
          win_xp_max: safeInt(form.win_xp_max, 0),
          lose_xp_min: safeInt(form.lose_xp_min, 0),
          lose_xp_max: safeInt(form.lose_xp_max, 0),
          win_gold_min: safeInt(form.win_gold_min, 0),
          win_gold_max: safeInt(form.win_gold_max, 0),
          lose_gold_min: safeInt(form.lose_gold_min, 0),
          lose_gold_max: safeInt(form.lose_gold_max, 0),
        }),
        updateEnemyLoot(editId, {
          loot_chance_total: safeInt(form.loot_chance_total, 0),
          loot_t1: safeInt(form.loot_t1, 0),
          loot_t2: safeInt(form.loot_t2, 0),
          loot_t3: safeInt(form.loot_t3, 0),
          loot_t4: safeInt(form.loot_t4, 0),
          loot_t5: safeInt(form.loot_t5, 0),
        }),
      ]);

      toast.success("Rewards/Loot güncellendi.");
      await load();
    } catch (e) {
      toast.error(e?.message || "Güncellenemedi.");
    }
  }

  async function doDeleteEnemy(row) {
    const ok = window.confirm(`Silinsin mi?\n\n${row.name} (${row.code})`);
    if (!ok) return;
    try {
      await deleteEnemy(row.id);
      toast.success("Silindi.");
      setPage(0);
      await load();
    } catch (e) {
      toast.error(e?.message || "Silinemedi.");
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "name",
        title: "Düşman",
        render: (r) => (
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontWeight: 950 }}>{r.name}</div>
              {r.is_boss ? <Badge text="BOSS" variant="bad" /> : <Badge text="NORMAL" variant="cyan" />}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              <span style={{ color: "rgba(236,235,255,.70)", fontWeight: 900 }}>{r.code}</span>
              {" • "}
              base_lv: {r.base_level}
            </div>
          </div>
        ),
      },
      {
        key: "stats",
        title: "Stat",
        render: (r) => (
          <span style={{ color: "rgba(236,235,255,.80)", fontSize: 12, whiteSpace: "nowrap" }}>
            G:{r.guc} Ç:{r.ceviklik} D:{r.dayaniklilik} Z:{r.zeka} K:{r.karizma} B:{r.beceri}
          </span>
        ),
      },
      {
        key: "reward",
        title: "Win Ödül",
        render: (r) => (
          <span style={{ color: "var(--muted)", fontSize: 12, whiteSpace: "nowrap" }}>
            XP {r.win_xp_min}-{r.win_xp_max} • GOLD {r.win_gold_min}-{r.win_gold_max}
          </span>
        ),
      },
      {
        key: "updated_at",
        title: "Güncelleme",
        render: (r) => <span style={{ color: "var(--muted)", fontSize: 12 }}>{fmtDate(r.updated_at)}</span>,
      },
      {
        key: "actions",
        title: "İşlem",
        render: (r) => (
          <div style={{ display: "flex", gap: 10, width: 390 }}>
            <div style={{ width: 100 }}>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openDetailEnemy(r.id); }}>
                Detay
              </Button>
            </div>
            <div style={{ width: 110 }}>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEditEnemy(r.id); }}>
                Düzenle
              </Button>
            </div>
            <div style={{ width: 150 }}>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openEditEnemy(r.id); }}>
                Rewards/Loot
              </Button>
            </div>
            <div style={{ width: 100 }}>
              <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); doDeleteEnemy(r); }}>
                Sil
              </Button>
            </div>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card
        title="Düşmanlar"
        subtitle="pve_enemy_types • statlar • reward/loot • AI profile"
        right={
          <div style={{ display: "flex", gap: 10, width: 360 }}>
            <Button variant="outline" onClick={() => { toast.info("Yenileniyor..."); load(); }}>
              Yenile
            </Button>
            <Button variant="primary" onClick={openCreate}>
              + Düşman Ekle
            </Button>
          </div>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
            <Stat variant="violet" label="Toplam" value={loading ? "…" : String(data.total ?? 0)} />
            <Stat variant="cyan" label="Sayfa" value={`${page + 1} / ${Math.max(1, Math.ceil((data.total || 0) / limit))}`} />
            <Stat variant="pink" label="Boss Filtresi" value={boss === "all" ? "ALL" : boss === "1" ? "BOSS" : "NORMAL"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 220px", gap: 12, alignItems: "end" }}>
            <Input
              label="Ara"
              placeholder="name / code"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
            />

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Boss</div>
              <select
                value={boss}
                onChange={(e) => { setBoss(e.target.value); setPage(0); }}
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
                <option value="all">All</option>
                <option value="1">Boss</option>
                <option value="0">Normal</option>
              </select>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Limit</div>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(0); }}
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
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 220 }}>
              <Button variant="primary" onClick={applySearch} loading={loading}>
                Ara / Uygula
              </Button>
            </div>

            {err ? (
              <div
                className="glass"
                style={{
                  marginLeft: "auto",
                  borderRadius: 16,
                  padding: "10px 12px",
                  border: "1px solid rgba(251,113,133,.30)",
                  color: "rgba(251,113,133,.90)",
                  fontSize: 13,
                }}
              >
                {err}
              </div>
            ) : null}
          </div>

          <Table
            columns={columns}
            rows={data.items}
            loading={loading}
            emptyText="Düşman bulunamadı."
            onRowClick={(r) => openDetailEnemy(r.id)}
            footer={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>
                  Toplam: <span style={{ color: "rgba(236,235,255,.85)", fontWeight: 900 }}>{data.total ?? 0}</span>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 120 }}>
                    <Button size="sm" variant="ghost" disabled={page <= 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                      Önceki
                    </Button>
                  </div>

                  <div
                    className="glass"
                    style={{
                      borderRadius: 14,
                      padding: "8px 10px",
                      border: "1px solid rgba(255,255,255,.10)",
                      color: "rgba(236,235,255,.78)",
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: ".2px",
                      minWidth: 120,
                      textAlign: "center",
                    }}
                  >
                    {page + 1} / {totalPages}
                  </div>

                  <div style={{ width: 120 }}>
                    <Button size="sm" variant="ghost" disabled={page >= totalPages - 1 || loading} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
                      Sonraki
                    </Button>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </Card>

      {/* EDIT / CREATE */}
      <Modal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        title={editMode === "create" ? "Yeni Düşman" : "Düşman Düzenle"}
        subtitle={editMode === "create" ? "pve_enemy_types" : `ID: ${editId}`}
        width={1120}
      >
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
            <Input
              label="Code"
              placeholder="wolf_basic"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
            />
            <Input
              label="Name"
              placeholder="Kurt"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="Base Level"
              type="number"
              min={1}
              value={form.base_level}
              onChange={(e) => setForm((p) => ({ ...p, base_level: e.target.value }))}
            />
          </div>

          <Card title="Statlar" subtitle="base stats" glow={false}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0,1fr))", gap: 10 }}>
              <Input label="guc" type="number" min={0} value={form.guc} onChange={(e) => setForm((p) => ({ ...p, guc: e.target.value }))} />
              <Input label="ceviklik" type="number" min={0} value={form.ceviklik} onChange={(e) => setForm((p) => ({ ...p, ceviklik: e.target.value }))} />
              <Input label="dayaniklilik" type="number" min={0} value={form.dayaniklilik} onChange={(e) => setForm((p) => ({ ...p, dayaniklilik: e.target.value }))} />
              <Input label="karizma" type="number" min={0} value={form.karizma} onChange={(e) => setForm((p) => ({ ...p, karizma: e.target.value }))} />
              <Input label="zeka" type="number" min={0} value={form.zeka} onChange={(e) => setForm((p) => ({ ...p, zeka: e.target.value }))} />
              <Input label="beceri" type="number" min={0} value={form.beceri} onChange={(e) => setForm((p) => ({ ...p, beceri: e.target.value }))} />
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Card title="Görsel / Anim" subtitle="media_assets" glow={false}>
              <div style={{ display: "grid", gap: 10 }}>
                <Input
                  label="icon_asset_id (uuid)"
                  placeholder="media_assets.id"
                  value={form.icon_asset_id}
                  onChange={(e) => setForm((p) => ({ ...p, icon_asset_id: e.target.value }))}
                  hint="Medya seçici ekleriz; şimdilik id gir."
                />
                <Input
                  label="battle_anim_url"
                  placeholder="https://..."
                  value={form.battle_anim_url}
                  onChange={(e) => setForm((p) => ({ ...p, battle_anim_url: e.target.value }))}
                />
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <label
                    className="glass"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,.10)",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!form.is_boss}
                      onChange={(e) => setForm((p) => ({ ...p, is_boss: e.target.checked }))}
                    />
                    <span style={{ fontWeight: 950 }}>Boss</span>
                  </label>
                  {form.is_boss ? <Badge text="BOSS" variant="bad" /> : <Badge text="NORMAL" variant="cyan" />}
                </div>
              </div>
            </Card>

            <Card title="Açıklama" subtitle="description" glow={false}>
              <Input
                textarea
                label="description"
                placeholder="Düşmanın hikayesi / davranışı..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Card title="Rewards" subtitle="win/lose xp & gold" glow={false}
              right={editMode === "edit" ? (
                <div style={{ width: 240 }}>
                  <Button variant="outline" onClick={quickSaveRewardsLoot}>
                    Rewards/Loot Hızlı Kaydet
                  </Button>
                </div>
              ) : null}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10 }}>
                <Input label="win_xp_min" type="number" min={0} value={form.win_xp_min} onChange={(e) => setForm((p) => ({ ...p, win_xp_min: e.target.value }))} />
                <Input label="win_xp_max" type="number" min={0} value={form.win_xp_max} onChange={(e) => setForm((p) => ({ ...p, win_xp_max: e.target.value }))} />
                <Input label="lose_xp_min" type="number" min={0} value={form.lose_xp_min} onChange={(e) => setForm((p) => ({ ...p, lose_xp_min: e.target.value }))} />
                <Input label="lose_xp_max" type="number" min={0} value={form.lose_xp_max} onChange={(e) => setForm((p) => ({ ...p, lose_xp_max: e.target.value }))} />

                <Input label="win_gold_min" type="number" min={0} value={form.win_gold_min} onChange={(e) => setForm((p) => ({ ...p, win_gold_min: e.target.value }))} />
                <Input label="win_gold_max" type="number" min={0} value={form.win_gold_max} onChange={(e) => setForm((p) => ({ ...p, win_gold_max: e.target.value }))} />
                <Input label="lose_gold_min" type="number" min={0} value={form.lose_gold_min} onChange={(e) => setForm((p) => ({ ...p, lose_gold_min: e.target.value }))} />
                <Input label="lose_gold_max" type="number" min={0} value={form.lose_gold_max} onChange={(e) => setForm((p) => ({ ...p, lose_gold_max: e.target.value }))} />
              </div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 8 }}>
                Not: min/max dengesi backend tarafında da doğrulanmalı.
              </div>
            </Card>

            <Card title="Loot" subtitle="chance + tier weights (0..100)" glow={false}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0,1fr))", gap: 10 }}>
                <Input label="total%" type="number" min={0} max={100} value={form.loot_chance_total} onChange={(e) => setForm((p) => ({ ...p, loot_chance_total: e.target.value }))} />
                <Input label="T1" type="number" min={0} max={100} value={form.loot_t1} onChange={(e) => setForm((p) => ({ ...p, loot_t1: e.target.value }))} />
                <Input label="T2" type="number" min={0} max={100} value={form.loot_t2} onChange={(e) => setForm((p) => ({ ...p, loot_t2: e.target.value }))} />
                <Input label="T3" type="number" min={0} max={100} value={form.loot_t3} onChange={(e) => setForm((p) => ({ ...p, loot_t3: e.target.value }))} />
                <Input label="T4" type="number" min={0} max={100} value={form.loot_t4} onChange={(e) => setForm((p) => ({ ...p, loot_t4: e.target.value }))} />
                <Input label="T5" type="number" min={0} max={100} value={form.loot_t5} onChange={(e) => setForm((p) => ({ ...p, loot_t5: e.target.value }))} />
              </div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 8 }}>
                Kural: total 0..100, T1..T5 toplamı 100'ü geçmesin.
              </div>
            </Card>
          </div>

          <Card title="AI Profile" subtitle="jsonb" glow={false}>
            <Input
              textarea
              label="ai_profile (JSON)"
              value={form.ai_profile}
              onChange={(e) => setForm((p) => ({ ...p, ai_profile: e.target.value }))}
              hint='Örn: {"aggressive":true,"skill":"bite","priority":"low_hp"}'
            />
          </Card>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <div style={{ width: 140 }}>
              <Button variant="ghost" onClick={() => setOpenEdit(false)}>
                İptal
              </Button>
            </div>
            <div style={{ width: 240 }}>
              <Button variant="primary" onClick={saveEnemy} loading={saving}>
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* DETAIL */}
      <Modal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        title={detail ? `Düşman: ${detail.name}` : "Düşman Detayı"}
        subtitle={detail ? `code: ${detail.code} • updated: ${fmtDate(detail.updated_at)}` : "—"}
        width={980}
      >
        {detailLoading ? (
          <div style={{ color: "var(--muted)" }}>Yükleniyor...</div>
        ) : !detail ? (
          <div style={{ color: "var(--muted)" }}>Detay yok.</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
              <Stat variant="violet" label="Base Lv" value={detail.base_level} />
              <Stat variant={detail.is_boss ? "bad" : "cyan"} label="Type" value={detail.is_boss ? "BOSS" : "NORMAL"} />
              <Stat variant="pink" label="Updated" value={fmtDate(detail.updated_at)} />
            </div>

            <Card title="Statlar" subtitle="snapshot" glow={false}>
              <div style={{ color: "rgba(236,235,255,.85)", fontSize: 13, lineHeight: 1.5 }}>
                G:{detail.guc} • Ç:{detail.ceviklik} • D:{detail.dayaniklilik} • K:{detail.karizma} • Z:{detail.zeka} • B:{detail.beceri}
              </div>
            </Card>

            <Card title="Rewards / Loot" subtitle="özet" glow={false}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="glass" style={{ borderRadius: 18, padding: 12, border: "1px solid rgba(255,255,255,.10)" }}>
                  <div style={{ fontWeight: 950 }}>Win</div>
                  <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13, lineHeight: 1.45 }}>
                    XP: {detail.win_xp_min}-{detail.win_xp_max}<br />
                    GOLD: {detail.win_gold_min}-{detail.win_gold_max}
                  </div>
                </div>
                <div className="glass" style={{ borderRadius: 18, padding: 12, border: "1px solid rgba(255,255,255,.10)" }}>
                  <div style={{ fontWeight: 950 }}>Loot</div>
                  <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13, lineHeight: 1.45 }}>
                    total: {detail.loot_chance_total}%<br />
                    T1:{detail.loot_t1} T2:{detail.loot_t2} T3:{detail.loot_t3} T4:{detail.loot_t4} T5:{detail.loot_t5}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Açıklama" subtitle="description" glow={false}>
              <div style={{ color: "rgba(236,235,255,.85)", lineHeight: 1.55, fontSize: 13 }}>
                {detail.description || "—"}
              </div>
            </Card>

            <Card title="AI Profile" subtitle="jsonb" glow={false}>
              <pre
                className="glass"
                style={{
                  padding: 12,
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,.10)",
                  overflowX: "auto",
                  color: "rgba(236,235,255,.84)",
                  background: "rgba(0,0,0,.18)",
                  margin: 0,
                  fontSize: 12.5,
                  lineHeight: 1.35,
                }}
              >
{JSON.stringify(detail.ai_profile ?? {}, null, 2)}
              </pre>
            </Card>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 240 }}>
                <Button variant="outline" onClick={() => { setOpenDetail(false); openEditEnemy(detail.id); }}>
                  Düzenle
                </Button>
              </div>
              <div style={{ width: 240 }}>
                <Button variant="danger" onClick={() => doDeleteEnemy(detail)}>
                  Sil
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
