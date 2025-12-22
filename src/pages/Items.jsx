import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import Stat from "../components/ui/Stat";
import { toast } from "../components/ui/Toast";

import {
  listItemTemplates,
  getItemTemplate,
  createItemTemplate,
  updateItemTemplate,
  deleteItemTemplate,
  listEquipmentSlots,
} from "../api/items";

function Modal({ open, title, subtitle, children, onClose, width = 1120 }) {
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

function safeInt(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
}
function safeNum(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const EMPTY_ITEM = {
  code: "",
  name: "",
  category: "misc",
  rarity: "common",
  req_level: 1,

  stackable: false,
  max_stack: 1,

  buy_price: 0,
  sell_price: 0,

  // flat
  guc_flat: 0,
  ceviklik_flat: 0,
  dayaniklilik_flat: 0,
  karizma_flat: 0,
  zeka_flat: 0,
  yetenek_flat: 0,

  // pct
  guc_pct: 0,
  ceviklik_pct: 0,
  dayaniklilik_pct: 0,
  karizma_pct: 0,
  zeka_pct: 0,
  yetenek_pct: 0,

  icon_asset_id: "",
  default_asset_id: "",

  tier: 1,
};

const CATEGORIES = ["misc", "weapon", "armor", "helm", "ring", "amulet", "boots", "chest"];
const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"];

export default function Items() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [rarity, setRarity] = useState("all");
  const [tier, setTier] = useState("all");

  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(0);
  const offset = page * limit;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ items: [], total: 0 });

  // slots (opsiyonel gösterim için)
  const [slots, setSlots] = useState([]);

  // edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editMode, setEditMode] = useState("create");
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_ITEM });

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const params = { q, limit, offset };
      if (category !== "all") params.category = category;
      if (rarity !== "all") params.rarity = rarity;
      if (tier !== "all") params.tier = Number(tier);

      const out = await listItemTemplates(params);
      setData({
        items: out?.items || [],
        total: out?.total ?? (out?.items?.length || 0),
      });
    } catch (e) {
      setErr(e?.message || "Eşyalar alınamadı.");
      setData({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, page, category, rarity, tier]);

  useEffect(() => {
    // equipment slots opsiyonel; yoksa sessiz geç
    (async () => {
      try {
        const s = await listEquipmentSlots();
        setSlots(Array.isArray(s?.items) ? s.items : Array.isArray(s) ? s : []);
      } catch {
        setSlots([]);
      }
    })();
  }, []);

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
    setForm({ ...EMPTY_ITEM });
    setOpenEdit(true);
  }

  async function openEditItem(id) {
    setEditMode("edit");
    setEditId(id);
    setOpenEdit(true);
    setSaving(false);

    try {
      const res = await getItemTemplate(id);
      const it = res?.item || res;
      setForm({
        ...EMPTY_ITEM,
        ...it,
        icon_asset_id: it?.icon_asset_id || "",
        default_asset_id: it?.default_asset_id || "",
      });
    } catch (e) {
      toast.error(e?.message || "Item alınamadı.");
      setOpenEdit(false);
    }
  }

  function buildPayload(f) {
    const payload = {
      code: (f.code || "").trim(),
      name: (f.name || "").trim(),
      category: (f.category || "misc").trim(),
      rarity: (f.rarity || "common").trim(),
      req_level: safeInt(f.req_level, 1),

      stackable: !!f.stackable,
      max_stack: safeInt(f.max_stack, 1),

      buy_price: safeInt(f.buy_price, 0),
      sell_price: safeInt(f.sell_price, 0),

      guc_flat: safeInt(f.guc_flat, 0),
      ceviklik_flat: safeInt(f.ceviklik_flat, 0),
      dayaniklilik_flat: safeInt(f.dayaniklilik_flat, 0),
      karizma_flat: safeInt(f.karizma_flat, 0),
      zeka_flat: safeInt(f.zeka_flat, 0),
      yetenek_flat: safeInt(f.yetenek_flat, 0),

      // pct numeric(6,4) - burada float alıyoruz
      guc_pct: safeNum(f.guc_pct, 0),
      ceviklik_pct: safeNum(f.ceviklik_pct, 0),
      dayaniklilik_pct: safeNum(f.dayaniklilik_pct, 0),
      karizma_pct: safeNum(f.karizma_pct, 0),
      zeka_pct: safeNum(f.zeka_pct, 0),
      yetenek_pct: safeNum(f.yetenek_pct, 0),

      icon_asset_id: (f.icon_asset_id || "").trim() || null,
      default_asset_id: (f.default_asset_id || "").trim() || null,

      tier: safeInt(f.tier, 1),
    };

    if (!payload.code) throw new Error("code zorunlu.");
    if (!payload.name) throw new Error("name zorunlu.");
    if (payload.req_level < 1) throw new Error("req_level en az 1 olmalı.");
    if (payload.max_stack < 1) throw new Error("max_stack en az 1 olmalı.");
    if (!payload.stackable) payload.max_stack = 1;

    if (payload.tier < 1 || payload.tier > 5) throw new Error("tier 1..5 olmalı.");
    return payload;
  }

  async function saveItem() {
    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (editMode === "create") {
        await createItemTemplate(payload);
        toast.success("Eşya oluşturuldu.");
      } else {
        await updateItemTemplate(editId, payload);
        toast.success("Eşya güncellendi.");
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

  async function doDeleteItem(row) {
    const ok = window.confirm(`Silinsin mi?\n\n${row.name} (${row.code})`);
    if (!ok) return;
    try {
      await deleteItemTemplate(row.id);
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
        title: "Eşya",
        render: (r) => (
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 950 }}>{r.name}</div>
              <Badge text={(r.rarity || "—").toUpperCase()} variant={r.rarity === "legendary" ? "pink" : r.rarity === "epic" ? "violet" : "cyan"} />
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              <span style={{ fontWeight: 900, color: "rgba(236,235,255,.70)" }}>{r.code}</span>
              {" • "}
              {r.category} • req_lv:{r.req_level} • tier:{r.tier}
            </div>
          </div>
        ),
      },
      {
        key: "price",
        title: "Fiyat",
        render: (r) => (
          <span style={{ color: "var(--muted)", fontSize: 12, whiteSpace: "nowrap" }}>
            buy:{r.buy_price} • sell:{r.sell_price}
          </span>
        ),
      },
      {
        key: "mods",
        title: "Mod",
        render: (r) => {
          const has =
            (r.guc_flat || 0) +
              (r.ceviklik_flat || 0) +
              (r.dayaniklilik_flat || 0) +
              (r.karizma_flat || 0) +
              (r.zeka_flat || 0) +
              (r.yetenek_flat || 0) !==
              0 ||
            (Number(r.guc_pct || 0) +
              Number(r.ceviklik_pct || 0) +
              Number(r.dayaniklilik_pct || 0) +
              Number(r.karizma_pct || 0) +
              Number(r.zeka_pct || 0) +
              Number(r.yetenek_pct || 0)) !==
              0;

          return (
            <span style={{ color: has ? "rgba(236,235,255,.85)" : "var(--muted)", fontSize: 12 }}>
              {has ? "Var" : "Yok"}
            </span>
          );
        },
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
          <div style={{ display: "flex", gap: 10, width: 300 }}>
            <div style={{ width: 110 }}>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEditItem(r.id); }}>
                Düzenle
              </Button>
            </div>
            <div style={{ width: 110 }}>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openEditItem(r.id); }}>
                Detay
              </Button>
            </div>
            <div style={{ width: 80 }}>
              <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); doDeleteItem(r); }}>
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
        title="Eşyalar"
        subtitle="item_templates • stat modları • tier • fiyat • stack"
        right={
          <div style={{ display: "flex", gap: 10, width: 360 }}>
            <Button variant="outline" onClick={() => { toast.info("Yenileniyor..."); load(); }}>
              Yenile
            </Button>
            <Button variant="primary" onClick={openCreate}>
              + Eşya Ekle
            </Button>
          </div>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
            <Stat variant="violet" label="Toplam" value={loading ? "…" : String(data.total ?? 0)} />
            <Stat variant="cyan" label="Sayfa" value={`${page + 1} / ${totalPages}`} />
            <Stat variant="pink" label="Slots" value={slots.length ? String(slots.length) : "—"} right={<span style={{ color: "var(--muted)", fontSize: 12 }}>equipment_slots</span>} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 220px 220px", gap: 12, alignItems: "end" }}>
            <Input
              label="Ara"
              placeholder="name / code"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
            />

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Category</div>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(0); }}
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
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Rarity</div>
              <select
                value={rarity}
                onChange={(e) => { setRarity(e.target.value); setPage(0); }}
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
                {RARITIES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Tier</div>
              <select
                value={tier}
                onChange={(e) => { setTier(e.target.value); setPage(0); }}
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
                <option value="1">T1</option>
                <option value="2">T2</option>
                <option value="3">T3</option>
                <option value="4">T4</option>
                <option value="5">T5</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "220px 220px 1fr", gap: 12, alignItems: "center" }}>
            <Button variant="primary" onClick={applySearch} loading={loading}>
              Ara / Uygula
            </Button>

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

            {err ? (
              <div
                className="glass"
                style={{
                  borderRadius: 16,
                  padding: "10px 12px",
                  border: "1px solid rgba(251,113,133,.30)",
                  color: "rgba(251,113,133,.90)",
                  fontSize: 13,
                  justifySelf: "end",
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
            emptyText="Eşya bulunamadı."
            onRowClick={(r) => openEditItem(r.id)}
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
        title={editMode === "create" ? "Yeni Eşya" : "Eşya Düzenle"}
        subtitle={editMode === "create" ? "item_templates" : `ID: ${editId}`}
        width={1160}
      >
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
            <Input label="Code" placeholder="iron_sword_01" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
            <Input label="Name" placeholder="Demir Kılıç" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Category</div>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
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
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Rarity</div>
              <select
                value={form.rarity}
                onChange={(e) => setForm((p) => ({ ...p, rarity: e.target.value }))}
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
                {RARITIES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
            <Input label="Req Level" type="number" min={1} value={form.req_level} onChange={(e) => setForm((p) => ({ ...p, req_level: e.target.value }))} />
            <Input label="Tier (1..5)" type="number" min={1} max={5} value={form.tier} onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value }))} />
            <Input label="Buy Price" type="number" min={0} value={form.buy_price} onChange={(e) => setForm((p) => ({ ...p, buy_price: e.target.value }))} />
            <Input label="Sell Price" type="number" min={0} value={form.sell_price} onChange={(e) => setForm((p) => ({ ...p, sell_price: e.target.value }))} />
          </div>

          <Card title="Stack" subtitle="stackable / max_stack" glow={false}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
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
                  checked={!!form.stackable}
                  onChange={(e) => setForm((p) => ({ ...p, stackable: e.target.checked }))}
                />
                <span style={{ fontWeight: 950 }}>Stackable</span>
              </label>

              <div style={{ width: 220 }}>
                <Input
                  label="Max Stack"
                  type="number"
                  min={1}
                  value={form.max_stack}
                  onChange={(e) => setForm((p) => ({ ...p, max_stack: e.target.value }))}
                  hint={form.stackable ? "Stack açıkken > 1 olabilir" : "Stack kapalıysa otomatik 1 yapılır"}
                />
              </div>
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Card title="Flat Modlar" subtitle="guc_flat vs" glow={false}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
                <Input label="guc_flat" type="number" value={form.guc_flat} onChange={(e) => setForm((p) => ({ ...p, guc_flat: e.target.value }))} />
                <Input label="ceviklik_flat" type="number" value={form.ceviklik_flat} onChange={(e) => setForm((p) => ({ ...p, ceviklik_flat: e.target.value }))} />
                <Input label="dayaniklilik_flat" type="number" value={form.dayaniklilik_flat} onChange={(e) => setForm((p) => ({ ...p, dayaniklilik_flat: e.target.value }))} />
                <Input label="karizma_flat" type="number" value={form.karizma_flat} onChange={(e) => setForm((p) => ({ ...p, karizma_flat: e.target.value }))} />
                <Input label="zeka_flat" type="number" value={form.zeka_flat} onChange={(e) => setForm((p) => ({ ...p, zeka_flat: e.target.value }))} />
                <Input label="yetenek_flat" type="number" value={form.yetenek_flat} onChange={(e) => setForm((p) => ({ ...p, yetenek_flat: e.target.value }))} />
              </div>
            </Card>

            <Card title="Percent Modlar" subtitle="0.10 = %10" glow={false}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
                <Input label="guc_pct" type="number" step="0.0001" value={form.guc_pct} onChange={(e) => setForm((p) => ({ ...p, guc_pct: e.target.value }))} />
                <Input label="ceviklik_pct" type="number" step="0.0001" value={form.ceviklik_pct} onChange={(e) => setForm((p) => ({ ...p, ceviklik_pct: e.target.value }))} />
                <Input label="dayaniklilik_pct" type="number" step="0.0001" value={form.dayaniklilik_pct} onChange={(e) => setForm((p) => ({ ...p, dayaniklilik_pct: e.target.value }))} />
                <Input label="karizma_pct" type="number" step="0.0001" value={form.karizma_pct} onChange={(e) => setForm((p) => ({ ...p, karizma_pct: e.target.value }))} />
                <Input label="zeka_pct" type="number" step="0.0001" value={form.zeka_pct} onChange={(e) => setForm((p) => ({ ...p, zeka_pct: e.target.value }))} />
                <Input label="yetenek_pct" type="number" step="0.0001" value={form.yetenek_pct} onChange={(e) => setForm((p) => ({ ...p, yetenek_pct: e.target.value }))} />
              </div>
            </Card>
          </div>

          <Card title="Görseller" subtitle="media_assets refs" glow={false}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input
                label="icon_asset_id (uuid)"
                placeholder="media_assets.id"
                value={form.icon_asset_id}
                onChange={(e) => setForm((p) => ({ ...p, icon_asset_id: e.target.value }))}
              />
              <Input
                label="default_asset_id (uuid)"
                placeholder="media_assets.id"
                value={form.default_asset_id}
                onChange={(e) => setForm((p) => ({ ...p, default_asset_id: e.target.value }))}
              />
            </div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 8 }}>
              İstersen sonraki adımda “Medya seçici” (thumbnail grid) ekleriz.
            </div>
          </Card>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <div style={{ width: 140 }}>
              <Button variant="ghost" onClick={() => setOpenEdit(false)}>
                İptal
              </Button>
            </div>
            <div style={{ width: 240 }}>
              <Button variant="primary" onClick={saveItem} loading={saving}>
                Kaydet
              </Button>
            </div>
          </div>

          {editMode === "edit" ? (
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-start" }}>
              <div style={{ width: 220 }}>
                <Button
                  variant="danger"
                  onClick={async () => {
                    const ok = window.confirm("Bu item silinsin mi?");
                    if (!ok) return;
                    try {
                      await deleteItemTemplate(editId);
                      toast.success("Silindi.");
                      setOpenEdit(false);
                      setPage(0);
                      await load();
                    } catch (e) {
                      toast.error(e?.message || "Silinemedi.");
                    }
                  }}
                >
                  Sil
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
