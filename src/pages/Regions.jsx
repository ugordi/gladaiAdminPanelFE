import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import Stat from "../components/ui/Stat";
import { toast } from "../components/ui/Toast";
import { uploadMedia } from "../api/media";
import { resolveMediaUrl } from "../api/mediaUrl";

import {
  listRegions,
  createRegion,
  updateRegion,
  deleteRegion,
  listRegionEnemies,
  addEnemyToRegion,
  removeEnemyFromRegion,
} from "../api/regions";

import { listEnemies } from "../api/enemies";

function Modal({ open, title, subtitle, children, onClose, width = 980 }) {
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

export default function Regions() {
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(0);
  const offset = page * limit;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [data, setData] = useState({ items: [], total: 0 });

  // create/edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState("create"); // create | edit
  const [editId, setEditId] = useState(null);

  const [iconFile, setIconFile] = useState(null);
  const [iconName, setIconName] = useState("");
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [iconPreviewUrl, setIconPreviewUrl] = useState("");

  const [form, setForm] = useState({
    name: "",
    min_level: 1,
    short_description: "",
     icon_asset_id: null,   // ✅
    // story / icon_asset_id gibi alanlar backend eklenince buraya da eklenir
  });

  // detail modal (region enemies)
  const [openDetail, setOpenDetail] = useState(false);
  const [detailRegion, setDetailRegion] = useState(null);

  const [defsLoading, setDefsLoading] = useState(false);
  const [regionDefs, setRegionDefs] = useState([]); // listRegionEnemies
  const [allEnemies, setAllEnemies] = useState([]);
  const [enemyPick, setEnemyPick] = useState({
    enemy_type_id: "",
  });

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const out = await listRegions({ q, limit, offset });
      setData({
        items: out?.items || [],
        total: out?.total ?? (out?.items?.length || 0),
      });
    } catch (e) {
      setErr(e?.message || "Bölgeler alınamadı.");
      setData({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, page]);

  const totalPages = useMemo(() => {
    const t = Number(data.total || 0);
    return Math.max(1, Math.ceil(t / limit));
  }, [data.total, limit]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        title: "Bölge",
        render: (r) => (
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontWeight: 950 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {r.short_description || "—"}
            </div>
          </div>
        ),
      },
      {
        key: "min_level",
        title: "Min Lv",
        render: (r) => (
          <span className="glass" style={{
            padding: "7px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.04)", fontWeight: 900, fontSize: 12
          }}>
            {r.min_level}
          </span>
        ),
      },
      {
        key: "created_at",
        title: "Oluşturma",
        render: (r) => <span style={{ color: "var(--muted)", fontSize: 12 }}>{fmtDate(r.created_at)}</span>,
      },
      {
        key: "actions",
        title: "İşlem",
        render: (r) => (
          <div style={{ display: "flex", gap: 10, width: 340 }}>
            <div style={{ width: 110 }}>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  openRegionDetail(r);
                }}
              >
                Detay
              </Button>
            </div>
            <div style={{ width: 110 }}>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal("edit", r);
                }}
              >
                Düzenle
              </Button>
            </div>
            <div style={{ width: 110 }}>
              <Button
                size="sm"
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  doDelete(r);
                }}
              >
                Sil
              </Button>
            </div>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.items]
  );

  function openEditModal(mode, region) {
    setEditMode(mode);
    setOpenEdit(true);
    setIconFile(null);
    setIconName("");
    setUploadingIcon(false);
    setIconPreviewUrl("");

    if (mode === "create") {
      setEditId(null);
      setForm({ name: "", min_level: 1, short_description: "", icon_asset_id: null });
      return;
    }

    setEditId(region.id);
    setForm({
      name: region.name || "",
      min_level: Number(region.min_level || 1),
      short_description: region.short_description || "",
      icon_asset_id: region.icon_asset_id || null, // ✅
    });
  }

  async function saveRegion() {
    const payload = {
      name: form.name.trim(),
      min_level: Number(form.min_level || 1),
      short_description: form.short_description || "",
      icon_asset_id: form.icon_asset_id || null,
    };

    if (!payload.name) {
      toast.error("Bölge adı boş olamaz.");
      return;
    }

    setSaving(true);
    try {
      if (editMode === "create") {
        await createRegion(payload);
        toast.success("Bölge oluşturuldu.");
      } else {
        await updateRegion(editId, payload);
        toast.success("Bölge güncellendi.");
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

  async function doDelete(region) {
    const ok = window.confirm(`Silinsin mi?\n\n${region.name}`);
    if (!ok) return;
    try {
      await deleteRegion(region.id);
      toast.success("Bölge silindi.");
      setPage(0);
      await load();
    } catch (e) {
      toast.error(e?.message || "Silinemedi.");
    }
  }

  async function openRegionDetail(region) {
    setDetailRegion(region);
    setOpenDetail(true);
    setRegionDefs([]);
    setAllEnemies([]);
    setEnemyPick({ enemy_type_id: "" });


    setDefsLoading(true);
    try {
      // region defs
      const defs = await listRegionEnemies(region.id);
      const items = defs?.items || defs || [];
      setRegionDefs(Array.isArray(items) ? items : []);

      // enemy select list
      try {
        const all = await listEnemies({ limit: 200, offset: 0 });
        setAllEnemies(all?.items || []);
      } catch {
        setAllEnemies([]);
      }
    } catch (e) {
      toast.error(e?.message || "Bölge detayları alınamadı.");
    } finally {
      setDefsLoading(false);
    }
  }

  async function addDef() {
    if (!detailRegion?.id) return;
    if (!enemyPick.enemy_type_id) {
      toast.error("Düşman seç.");
      return;
    }
    const payload = {
      enemy_type_id: enemyPick.enemy_type_id,
    };

    try {
      await addEnemyToRegion(detailRegion.id, payload);
      toast.success("Düşman bölgeye eklendi.");
      const defs = await listRegionEnemies(detailRegion.id);
      const items = defs?.items || defs || [];
      setRegionDefs(Array.isArray(items) ? items : []);
    } catch (e) {
      toast.error(e?.message || "Eklenemedi.");
    }
  }


  async function removeDef(defId) {
    const ok = window.confirm("Bu düşmanı bölgeden kaldırmak istiyor musun?");
    if (!ok) return;
    try {
      await removeEnemyFromRegion(defId);
      toast.success("Kaldırıldı.");
      const defs = await listRegionEnemies(detailRegion.id);
      const items = defs?.items || defs || [];
      setRegionDefs(Array.isArray(items) ? items : []);
    } catch (e) {
      toast.error(e?.message || "Silinemedi.");
    }
  }

  function applySearch() {
    setPage(0);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card
        title="Bölgeler"
        subtitle="Bölge adı • min level • açıklama • bölgedeki düşmanlar"
        right={
          <div style={{ display: "flex", gap: 10, width: 330 }}>
            <Button variant="outline" onClick={() => { toast.info("Yenileniyor..."); load(); }}>
              Yenile
            </Button>
            <Button variant="primary" onClick={() => openEditModal("create")}>
              + Bölge Ekle
            </Button>
          </div>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
            <Stat variant="violet" label="Toplam Bölge" value={loading ? "…" : String(data.total ?? 0)} />
            <Stat variant="cyan" label="Sayfa" value={`${page + 1} / ${totalPages}`} />
            <Stat variant="pink" label="Limit" value={`${limit}`} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 12, alignItems: "end" }}>
            <Input
              label="Ara"
              placeholder="bölge adı"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
            />
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: ".3px" }}>
                Limit
              </div>
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
            emptyText="Bölge bulunamadı."
            onRowClick={(r) => openRegionDetail(r)}
            footer={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>
                  Toplam: <span style={{ color: "rgba(236,235,255,.85)", fontWeight: 900 }}>{data.total ?? 0}</span>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 120 }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={page <= 0 || loading}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
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
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={page >= totalPages - 1 || loading}
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    >
                      Sonraki
                    </Button>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </Card>

      {/* Create/Edit modal */}
      <Modal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        title={editMode === "create" ? "Yeni Bölge" : "Bölge Düzenle"}
        subtitle={editMode === "create" ? "regions tablosuna yeni kayıt" : `ID: ${editId}`}
        width={820}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <Input
            label="Bölge Adı"
            placeholder="Trakya Ormanları"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Minimum Level"
            type="number"
            min={1}
            value={form.min_level}
            onChange={(e) => setForm((p) => ({ ...p, min_level: e.target.value }))}
          />
          <Input
            label="Kısa Açıklama / Hikaye"
            placeholder="Bölgenin atmosferi, hikayesi, özet..."
            textarea
            value={form.short_description}
            onChange={(e) => setForm((p) => ({ ...p, short_description: e.target.value }))}
          />
        
        <Card title="Bölge İkonu" subtitle="Foto seç + isim ver, otomatik upload" glow={false}>
          <div style={{ display: "grid", gap: 10 }}>
            <Input
              label="Dosya adı (filename)"
              placeholder="trakya_ormanlari"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setIconFile(f);
                if (f) setIconPreviewUrl(URL.createObjectURL(f));
              }}
            />

            {iconPreviewUrl ? (
              <div className="glass" style={{ padding: 10, borderRadius: 16 }}>
                <img
                  src={iconPreviewUrl}
                  alt="preview"
                  style={{ maxWidth: 180, borderRadius: 14, display: "block" }}
                />
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 220 }}>
                <Button
                  variant="primary"
                  loading={uploadingIcon}
                  onClick={async () => {
                    if (!iconFile) return toast.error("Önce foto seç.");
                    if (!iconName.trim()) return toast.error("Dosya adı yaz.");

                    setUploadingIcon(true);
                    try {
                      const asset = await uploadMedia(iconFile, { filename: iconName.trim() });

                      // ✅ asset.id'yi region formuna yaz
                      setForm((p) => ({ ...p, icon_asset_id: asset.id }));

                      // istersen preview'ı artık server url’den göster:
                      if (asset.url) setIconPreviewUrl(resolveMediaUrl(asset.url));

                      toast.success("İkon yüklendi ve seçildi.");
                    } catch (e) {
                      toast.error(e?.message || "Upload başarısız.");
                    } finally {
                      setUploadingIcon(false);
                    }
                  }}
                >
                  Upload + Seç
                </Button>
              </div>

              <div style={{ color: "var(--muted)", fontSize: 12 }}>
                Seçilen icon_asset_id:{" "}
                <span style={{ color: "rgba(236,235,255,.9)", fontWeight: 900 }}>
                  {form.icon_asset_id || "—"}
                </span>
              </div>
            </div>
          </div>
        </Card>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <div style={{ width: 140 }}>
              <Button variant="ghost" onClick={() => setOpenEdit(false)}>
                İptal
              </Button>
            </div>
            <div style={{ width: 220 }}>
              <Button variant="primary" onClick={saveRegion} loading={saving}>
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        title={detailRegion ? `Bölge: ${detailRegion.name}` : "Bölge Detayı"}
        subtitle={detailRegion ? `ID: ${detailRegion.id}` : "—"}
        width={1080}
      >
        {!detailRegion ? (
          <div style={{ color: "var(--muted)" }}>Seçilmedi.</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
              <Stat variant="violet" label="Min Level" value={detailRegion.min_level} />
              <Stat variant="cyan" label="Oluşturma" value={fmtDate(detailRegion.created_at)} />
              <Stat variant="pink" label="Güncelleme" value={fmtDate(detailRegion.updated_at)} />
            </div>

            <Card title="Açıklama" subtitle="short_description" glow={false}>
              <div style={{ color: "rgba(236,235,255,.82)", lineHeight: 1.5, fontSize: 13 }}>
                {detailRegion.short_description || "—"}
              </div>
            </Card>

            <Card
              title="Bölgedeki Düşmanlar"
              subtitle="region_enemy_defs (min/max level, weight)"
              right={
                <div style={{ width: 220 }}>
                  <Button variant="outline" onClick={() => openRegionDetail(detailRegion)}>
                    Yenile
                  </Button>
                </div>
              }
              glow={false}
            >
              {defsLoading ? (
                <div style={{ color: "var(--muted)" }}>Yükleniyor...</div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {/* add enemy */}
                  <div
                    className="glass"
                    style={{
                      borderRadius: 18,
                      padding: 12,
                      border: "1px solid rgba(255,255,255,.10)",
                      background: "rgba(255,255,255,.03)",
                    }}
                  >
                    <div style={{ fontWeight: 950, marginBottom: 10, letterSpacing: ".2px" }}>
                      Düşman Ekle
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 220px",
                        gap: 10,
                        alignItems: "end",
                      }}
                    >
                      <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>Düşman</div>
                        <select
                          value={enemyPick.enemy_type_id}
                          onChange={(e) => setEnemyPick((p) => ({ ...p, enemy_type_id: e.target.value }))}
                          style={{
                            background: "rgba(255,255,255,.06)",
                            color: "rgba(236,235,255,.92)",
                            border: "1px solid rgba(255,255,255,.12)",
                            borderRadius: 14,
                            padding: "12px 12px",
                            fontWeight: 900,
                            outline: "none",
                          }}
                        >
                          <option value="">Seç…</option>
                          {allEnemies.map((en) => (
                            <option key={en.id} value={en.id}>
                              {en.name} ({en.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button variant="primary" onClick={addDef}>
                        Ekle
                      </Button>
                    </div>
                  </div>

                  {/* defs table */}
                  <Table
                    columns={[
                      {
                        key: "enemy",
                        title: "Düşman",
                        render: (r) => (
                          <div style={{ display: "grid", gap: 4 }}>
                            <div style={{ fontWeight: 950 }}>
                              {r.enemy_name || r.enemy?.name || r.pve_enemy?.name || "—"}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--muted)" }}>
                              {r.enemy_code || r.enemy?.code || r.pve_enemy?.code || r.enemy_type_id}
                            </div>
                          </div>
                        ),
                      },
                      {
                        key: "act",
                        title: "İşlem",
                        render: (r) => (
                          <div style={{ display: "flex", gap: 10, width: 120 }}>
                            <div style={{ width: 110 }}>
                              <Button size="sm" variant="danger" onClick={() => removeDef(r.id)}>
                                Sil
                              </Button>
                            </div>
                          </div>
                        ),
                      }
                    ]}
                    rows={regionDefs}
                    emptyText="Bu bölgede düşman tanımı yok."
                  />

                  <div style={{ color: "var(--muted)", fontSize: 12 }}>
                    Not: Eğer backend `listRegionEnemies` response’unda enemy name/code join’li dönmüyorsa,
                    tabloda sadece `enemy_type_id` görünebilir. İstersen backend’de join ile zenginleştiririz.
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
