import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import Stat from "../components/ui/Stat";
import { toast } from "../components/ui/Toast";

import {
  listUsers,
  getUser,
  updateUserStatus,
  updateUserRole,
  getUserMain,
  getUserWallet,
  getUserSessions,
} from "../api/users";

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass"
      style={{
        borderRadius: 999,
        padding: "9px 12px",
        border: `1px solid ${active ? "rgba(167,139,250,.55)" : "rgba(255,255,255,.12)"}`,
        background: active
          ? "linear-gradient(135deg, rgba(124,58,237,.22), rgba(255,255,255,.05))"
          : "rgba(255,255,255,.04)",
        color: active ? "rgba(236,235,255,.95)" : "rgba(236,235,255,.72)",
        fontWeight: 900,
        fontSize: 12,
        letterSpacing: ".25px",
        cursor: "pointer",
        boxShadow: active ? "0 18px 40px rgba(124,58,237,.14)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function Modal({ open, title, subtitle, children, onClose, width = 860 }) {
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
    const d = new Date(v);
    return d.toLocaleString();
  } catch {
    return String(v);
  }
}

function StatusBadge({ status }) {
  const map = {
    active: { label: "ACTIVE", c: "rgba(52,211,153,.95)", b: "rgba(52,211,153,.22)" },
    banned: { label: "BANNED", c: "rgba(251,113,133,.95)", b: "rgba(251,113,133,.18)" },
    deleted: { label: "DELETED", c: "rgba(251,191,36,.95)", b: "rgba(251,191,36,.16)" },
  };
  const s = map[status] || { label: String(status || "—"), c: "rgba(167,139,250,.95)", b: "rgba(167,139,250,.14)" };
  return (
    <span
      className="glass"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,.12)",
        background: `linear-gradient(135deg, ${s.b}, rgba(255,255,255,.03))`,
        color: "rgba(236,235,255,.92)",
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: ".25px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: s.c,
          boxShadow: `0 0 16px ${s.c.replace(")", ", .20)").replace("rgba", "rgba")}`,
        }}
      />
      {s.label}
    </span>
  );
}

export default function Users() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("active"); // active | banned | deleted | all
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(0); // offset = page*limit

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [data, setData] = useState({ items: [], total: 0 });

  // detail modal
  const [openDetail, setOpenDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailExtra, setDetailExtra] = useState({
    main: null,
    wallet: null,
    sessions: null,
  });

  const offset = page * limit;

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const params = {
        q,
        limit,
        offset,
      };
      if (status && status !== "all") params.status = status;

      const out = await listUsers(params);
      setData({
        items: out?.items || [],
        total: out?.total ?? (out?.items?.length || 0),
      });
    } catch (e) {
      setErr(e?.message || "Kullanıcılar alınamadı.");
      setData({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, limit, page]);

  const totalPages = useMemo(() => {
    const t = Number(data.total || 0);
    return Math.max(1, Math.ceil(t / limit));
  }, [data.total, limit]);

  const columns = useMemo(
    () => [
      {
        key: "username",
        title: "Kullanıcı",
        render: (r) => (
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontWeight: 950 }}>{r.username}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.email || "—"}</div>
          </div>
        ),
      },
      {
        key: "status",
        title: "Durum",
        render: (r) => <StatusBadge status={r.status} />,
      },
      {
        key: "role",
        title: "Rol",
        render: (r) => (
          <span style={{ color: "rgba(236,235,255,.88)", fontWeight: 800 }}>
            {r.role || "—"}
          </span>
        ),
      },
      {
        key: "created_at",
        title: "Kayıt",
        render: (r) => <span style={{ color: "var(--muted)", fontSize: 12 }}>{fmtDate(r.created_at)}</span>,
      },
      {
        key: "actions",
        title: "İşlem",
        render: (r) => (
          <div style={{ display: "flex", gap: 10, width: 230 }}>
            <div style={{ width: 110 }}>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  openUserDetail(r.id);
                }}
              >
                Detay
              </Button>
            </div>
            <div style={{ width: 110 }}>
              {r.status === "banned" ? (
                <Button
                  size="sm"
                  variant="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    doSetStatus(r.id, "active");
                  }}
                >
                  Unban
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    doSetStatus(r.id, "banned");
                  }}
                >
                  Ban
                </Button>
              )}
            </div>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.items]
  );

  async function doSetStatus(userId, newStatus) {
    try {
      await updateUserStatus(userId, { status: newStatus, reason: "admin_panel" });
      toast.success(`Durum güncellendi: ${newStatus}`);
      await load();
      if (detail?.id === userId) {
        const fresh = await getUser(userId);
        setDetail(fresh?.user || fresh);
      }
    } catch (e) {
      toast.error(e?.message || "Durum güncellenemedi.");
    }
  }

  async function doSetRole(userId, role) {
    try {
      await updateUserRole(userId, { role });
      toast.success(`Rol güncellendi: ${role}`);
      await load();
      if (detail?.id === userId) {
        const fresh = await getUser(userId);
        setDetail(fresh?.user || fresh);
      }
    } catch (e) {
      toast.error(e?.message || "Rol güncellenemedi.");
    }
  }

  async function openUserDetail(userId) {
    setOpenDetail(true);
    setDetail(null);
    setDetailExtra({ main: null, wallet: null, sessions: null });
    setDetailLoading(true);

    try {
      const u = await getUser(userId);
      const user = u?.user || u;
      setDetail(user);

      // Optional endpoints (backend yoksa hata alabilir, sessiz geçiyoruz)
      try {
        const main = await getUserMain(userId);
        setDetailExtra((p) => ({ ...p, main }));
      } catch {}
      try {
        const wallet = await getUserWallet(userId);
        setDetailExtra((p) => ({ ...p, wallet }));
      } catch {}
      try {
        const sessions = await getUserSessions(userId);
        setDetailExtra((p) => ({ ...p, sessions }));
      } catch {}
    } catch (e) {
      toast.error(e?.message || "Detay alınamadı.");
      setOpenDetail(false);
    } finally {
      setDetailLoading(false);
    }
  }

  function resetAndSearch() {
    setPage(0);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card
        title="Kullanıcılar"
        subtitle="Kullanıcı bilgileri • Ban/Unban • Rol yönetimi"
        right={
          <div style={{ display: "flex", gap: 10, width: 330 }}>
            <Button
              variant="outline"
              onClick={() => {
                toast.info("Yenileniyor...");
                load();
              }}
            >
              Yenile
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setQ("");
                setStatus("active");
                setLimit(20);
                setPage(0);
                toast.info("Filtreler sıfırlandı.");
                setTimeout(load, 0);
              }}
            >
              Sıfırla
            </Button>
          </div>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          {/* stats header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <Stat
              variant="violet"
              label="Toplam"
              value={loading ? "…" : String(data.total ?? 0)}
              right={<span style={{ color: "rgba(236,235,255,.55)", fontSize: 12 }}>users</span>}
            />
            <Stat
              variant="cyan"
              label="Sayfa"
              value={`${page + 1} / ${totalPages}`}
              right={<span style={{ color: "rgba(236,235,255,.55)", fontSize: 12 }}>{limit}/sayfa</span>}
            />
            <Stat
              variant="pink"
              label="Filtre"
              value={status === "all" ? "ALL" : status.toUpperCase()}
              right={<span style={{ color: "rgba(236,235,255,.55)", fontSize: 12 }}>status</span>}
            />
          </div>

          {/* filters */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 260px",
              gap: 12,
              alignItems: "end",
            }}
          >
            <Input
              label="Ara"
              placeholder="username / email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              right={
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: "rgba(236,235,255,.55)", fontSize: 12 }}>
                    Enter
                  </span>
                </div>
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") resetAndSearch();
              }}
            />

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: ".3px" }}>
                Durum
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Pill active={status === "active"} onClick={() => { setStatus("active"); setPage(0); }}>
                  Active
                </Pill>
                <Pill active={status === "banned"} onClick={() => { setStatus("banned"); setPage(0); }}>
                  Banned
                </Pill>
                <Pill active={status === "deleted"} onClick={() => { setStatus("deleted"); setPage(0); }}>
                  Deleted
                </Pill>
                <Pill active={status === "all"} onClick={() => { setStatus("all"); setPage(0); }}>
                  All
                </Pill>
              </div>
            </div>
          </div>

          {/* limit + search button */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="glass" style={{ padding: 10, borderRadius: 16, border: "1px solid rgba(255,255,255,.10)" }}>
              <span style={{ color: "var(--muted)", fontSize: 12, marginRight: 10 }}>Limit</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(0); }}
                style={{
                  background: "rgba(255,255,255,.06)",
                  color: "rgba(236,235,255,.92)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 12,
                  padding: "8px 10px",
                  fontWeight: 800,
                  outline: "none",
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div style={{ width: 220 }}>
              <Button variant="primary" onClick={resetAndSearch} loading={loading}>
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
            emptyText="Kullanıcı bulunamadı."
            onRowClick={(r) => openUserDetail(r.id)}
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

      <Modal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        title={detail ? `Kullanıcı: ${detail.username}` : "Kullanıcı Detayı"}
        subtitle={detail ? `ID: ${detail.id}` : "Detay yükleniyor..."}
        width={920}
      >
        {detailLoading ? (
          <div style={{ color: "var(--muted)" }}>Yükleniyor...</div>
        ) : !detail ? (
          <div style={{ color: "var(--muted)" }}>Detay bulunamadı.</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
              <Stat variant="violet" label="Durum" value={detail.status} />
              <Stat variant="cyan" label="Rol" value={detail.role || "—"} />
              <Stat variant="pink" label="Kayıt" value={fmtDate(detail.created_at)} />
            </div>

            <Card
              title="Temel Bilgiler"
              subtitle="users tablosu"
              glow={false}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
                <Input label="Username" value={detail.username || ""} readOnly />
                <Input label="Email" value={detail.email || ""} readOnly />
                <Input label="Email Verified" value={String(!!detail.email_verified)} readOnly />
                <Input label="Updated" value={fmtDate(detail.updated_at)} readOnly />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                <div style={{ width: 180 }}>
                  {detail.status === "banned" ? (
                    <Button variant="success" onClick={() => doSetStatus(detail.id, "active")}>
                      Unban
                    </Button>
                  ) : (
                    <Button variant="danger" onClick={() => doSetStatus(detail.id, "banned")}>
                      Ban
                    </Button>
                  )}
                </div>

                <div style={{ width: 180 }}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const next = detail.role === "admin" ? "player" : "admin";
                      doSetRole(detail.id, next);
                    }}
                  >
                    Rol Değiştir ({detail.role === "admin" ? "player" : "admin"})
                  </Button>
                </div>
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
              <Card title="Ana Karakter" subtitle="user_main (opsiyonel)" glow={false}>
                <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.45 }}>
                  {detailExtra.main ? (
                    <>
                      <div><b>Ad:</b> {detailExtra.main?.name ?? "—"}</div>
                      <div><b>Level:</b> {detailExtra.main?.level ?? "—"}</div>
                      <div><b>XP:</b> {detailExtra.main?.xp ?? "—"}</div>
                      <div><b>Unspent:</b> {detailExtra.main?.unspent_points ?? "—"}</div>
                    </>
                  ) : (
                    "Veri yok (endpoint eklenince görünür)."
                  )}
                </div>
              </Card>

              <Card title="Cüzdan" subtitle="wallets (opsiyonel)" glow={false}>
                <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.45 }}>
                  {detailExtra.wallet ? (
                    <>
                      <div><b>Gold:</b> {detailExtra.wallet?.gold ?? "—"}</div>
                      <div><b>Gems:</b> {detailExtra.wallet?.gems ?? "—"}</div>
                      <div><b>Updated:</b> {fmtDate(detailExtra.wallet?.updated_at)}</div>
                    </>
                  ) : (
                    "Veri yok (endpoint eklenince görünür)."
                  )}
                </div>
              </Card>

              <Card title="Oturumlar" subtitle="sessions (opsiyonel)" glow={false}>
                <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.45 }}>
                  {Array.isArray(detailExtra.sessions?.items) ? (
                    <>
                      <div><b>Count:</b> {detailExtra.sessions.items.length}</div>
                      <div style={{ marginTop: 8 }}>
                        {detailExtra.sessions.items.slice(0, 3).map((s) => (
                          <div key={s.id} style={{ marginBottom: 6 }}>
                            <div><b>expires:</b> {fmtDate(s.expires_at)}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    "Veri yok (endpoint eklenince görünür)."
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
