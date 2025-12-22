import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import Stat from "../components/ui/Stat";
import { toast } from "../components/ui/Toast";

import { listRankings } from "../api/rankings";

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

export default function Rankings() {
  const [scope, setScope] = useState("seasonal"); // seasonal | monthly | all
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(30);
  const [page, setPage] = useState(0);
  const offset = page * limit;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ items: [], total: 0, generated_at: null });

  async function load() {
    setErr("");
    setLoading(true);
    try {
      // listRankings beklenen query paramları sende farklı olabilir:
      // burada "scope,q,limit,offset" gönderiyoruz.
      const out = await listRankings({ scope, q, limit, offset });

      // out şekli: { items, total } veya { rows } gibi olabilir
      const items = out?.items || out?.rows || out || [];
      const total =
        out?.total ??
        (Array.isArray(items) ? items.length : 0);

      setData({
        items: Array.isArray(items) ? items : [],
        total,
        generated_at: out?.generated_at || out?.generatedAt || new Date().toISOString(),
      });
    } catch (e) {
      setErr(e?.message || "Sıralama alınamadı.");
      setData({ items: [], total: 0, generated_at: null });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, limit, page]);

  function applySearch() {
    setPage(0);
    load();
  }

  const totalPages = useMemo(() => {
    const t = Number(data.total || 0);
    return Math.max(1, Math.ceil(t / limit));
  }, [data.total, limit]);

  const scopeLabel = useMemo(() => {
    if (scope === "monthly") return "MONTHLY";
    if (scope === "all") return "ALL";
    return "SEASONAL";
  }, [scope]);

  const columns = useMemo(
    () => [
      {
        key: "rank",
        title: "#",
        render: (r, i) => {
          const rank = r.rank ?? (offset + i + 1);
          const v = Number(rank);
          const badge =
            v === 1 ? <Badge text="1" variant="pink" /> :
            v === 2 ? <Badge text="2" variant="violet" /> :
            v === 3 ? <Badge text="3" variant="cyan" /> : null;

          return (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {badge || (
                <span style={{ fontWeight: 950, color: "rgba(236,235,255,.82)" }}>
                  {rank}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "user",
        title: "Kullanıcı",
        render: (r) => (
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontWeight: 950 }}>
                {r.username || r.user_username || r.name || "—"}
              </span>
              {r.status === "banned" ? <Badge text="BANNED" variant="bad" /> : null}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              id:{" "}
              <span style={{ color: "rgba(236,235,255,.70)", fontWeight: 900 }}>
                {r.user_id || r.userId || "—"}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "points",
        title: "Puan",
        render: (r) => (
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontWeight: 950, color: "rgba(236,235,255,.88)" }}>
              {r.points ?? r.score ?? r.total_points ?? 0}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              win%: {r.win_rate ?? r.prediction_accuracy ?? "—"} • quiz: {r.quiz_correct ?? "—"}
            </div>
          </div>
        ),
      },
      {
        key: "meta",
        title: "Meta",
        render: (r) => (
          <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.45 }}>
            lvl:{" "}
            <span style={{ color: "rgba(236,235,255,.76)", fontWeight: 900 }}>
              {r.level ?? "—"}
            </span>
            <br />
            updated: {fmtDate(r.updated_at || r.updatedAt)}
          </div>
        ),
      },
    ],
    [offset]
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card
        title="Sıralama"
        subtitle="Global leaderboard • filtrele • tam liste"
        right={
          <div style={{ display: "flex", gap: 10, width: 360 }}>
            <Button
              variant="outline"
              onClick={() => {
                toast.info("Yenileniyor...");
                load();
              }}
            >
              Yenile
            </Button>
            <Button variant="primary" onClick={() => toast.success("Liste hazır.")}>
              Elite View
            </Button>
          </div>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
            <Stat variant="violet" label="Scope" value={scopeLabel} />
            <Stat variant="cyan" label="Toplam" value={loading ? "…" : String(data.total ?? 0)} />
            <Stat variant="pink" label="Generated" value={data.generated_at ? fmtDate(data.generated_at) : "—"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 220px", gap: 12, alignItems: "end" }}>
            <Input
              label="Ara"
              placeholder="username"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
            />

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Scope</div>
              <select
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  setPage(0);
                }}
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
                <option value="seasonal">Seasonal</option>
                <option value="monthly">Monthly</option>
                <option value="all">All-time</option>
              </select>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Limit</div>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(0);
                }}
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
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
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
            emptyText="Sıralama verisi yok."
            footer={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>
                  Toplam:{" "}
                  <span style={{ color: "rgba(236,235,255,.85)", fontWeight: 900 }}>
                    {data.total ?? 0}
                  </span>
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
    </div>
  );
}
