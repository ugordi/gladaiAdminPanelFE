import React from "react";

/**
 * Elite Table (no external deps)
 *
 * props:
 *  - columns: [{ key, title, width, render?(row) }]
 *  - rows: array
 *  - rowKey: (row)=>string
 *  - loading: bool
 *  - emptyText: string
 *  - onRowClick: (row)=>void
 *  - footer: node
 */
export default function Table({
  columns = [],
  rows = [],
  rowKey = (r, i) => r?.id || String(i),
  loading = false,
  emptyText = "Kayıt bulunamadı.",
  onRowClick,
  footer,
  style,
}) {
  return (
    <div
      className="glass"
      style={{
        borderRadius: "var(--r22)",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,.12)",
        ...style,
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{
                    textAlign: "left",
                    fontSize: 12,
                    color: "rgba(236,235,255,.70)",
                    fontWeight: 900,
                    letterSpacing: ".35px",
                    padding: "12px 14px",
                    borderBottom: "1px solid rgba(255,255,255,.10)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    width: c.width,
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  style={{ padding: 18, color: "var(--muted)" }}
                >
                  Yükleniyor...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  style={{ padding: 18, color: "var(--muted)" }}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const clickable = !!onRowClick;
                return (
                  <tr
                    key={rowKey(row, idx)}
                    onClick={() => clickable && onRowClick(row)}
                    style={{
                      cursor: clickable ? "pointer" : "default",
                      background:
                        idx % 2 === 0
                          ? "rgba(255,255,255,.025)"
                          : "rgba(255,255,255,.012)",
                      transition: "filter .12s ease, background .12s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!clickable) return;
                      e.currentTarget.style.filter = "brightness(1.06)";
                      e.currentTarget.style.background = "rgba(167,139,250,.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = "brightness(1)";
                      e.currentTarget.style.background =
                        idx % 2 === 0
                          ? "rgba(255,255,255,.025)"
                          : "rgba(255,255,255,.012)";
                    }}
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        style={{
                          padding: "12px 14px",
                          borderBottom: "1px solid rgba(255,255,255,.06)",
                          color: "rgba(236,235,255,.88)",
                          fontSize: 13,
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.render ? c.render(row) : row?.[c.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {footer ? (
        <div
          style={{
            padding: 12,
            borderTop: "1px solid rgba(255,255,255,.10)",
            background: "rgba(255,255,255,.03)",
          }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}
