// src/components/ui/Table.jsx
import React from "react";

/**
 * Dark Elite Table (no external deps)
 *
 * props:
 *  - columns: [{ key, title, width, render?(row) }]
 *  - rows: array
 *  - rowKey: (row,i)=>string
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
  className = "",
  style,
}) {
  const clickable = !!onRowClick;

  return (
    <div className={["ui-table", className].join(" ")} style={style}>
      <div className="ui-table__scroll">
        <table className="ui-table__table">
          <thead className="ui-table__thead">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="ui-table__th"
                  style={{ width: c.width }}
                >
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="ui-table__tbody">
            {loading ? (
              <tr>
                <td colSpan={columns.length || 1} className="ui-table__empty">
                  Yükleniyor...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} className="ui-table__empty">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={rowKey(row, idx)}
                  className={[
                    "ui-table__tr",
                    idx % 2 === 0 ? "is-even" : "is-odd",
                    clickable ? "is-clickable" : "",
                  ].join(" ")}
                  onClick={() => clickable && onRowClick(row)}
                >
                  {columns.map((c) => (
                    <td key={c.key} className="ui-table__td">
                      {c.render ? c.render(row) : row?.[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {footer ? <div className="ui-table__footer">{footer}</div> : null}
    </div>
  );
}
