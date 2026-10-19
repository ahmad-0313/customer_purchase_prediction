/**
 * DataTable — a scrollable, responsive table with configurable columns.
 *
 * Props:
 *   columns  {Array}   [{ key, header, render?, align? }]
 *     key     {string}   property name on each row object
 *     header  {string}   column heading text
 *     render  {fn}       optional custom renderer: (value, row) => ReactNode
 *     align   {"left"|"right"}  default "left"
 *   rows     {Array}   array of row objects
 *   onRowClick {fn}    optional: (row) => void, makes rows hoverable
 *   keyField  {string}  which property to use as React key (default "id")
 */
export default function DataTable({ columns, rows, onRowClick, keyField = "id" }) {
  if (!rows || rows.length === 0) return null; // caller handles empty state

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap
                  ${col.align === "right" ? "text-right" : "text-left"}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr
              key={row[keyField] ?? JSON.stringify(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`transition-colors ${
                onRowClick
                  ? "cursor-pointer hover:bg-indigo-50 focus-within:bg-indigo-50"
                  : ""
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 whitespace-nowrap text-slate-700 tabular-nums
                    ${col.align === "right" ? "text-right" : "text-left"}`}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : row[col.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
