/**
 * StatCard — a single KPI tile used in the Dashboard header row.
 *
 * Props:
 *   title    {string}   e.g. "Total Customers"
 *   value    {string}   formatted value to display prominently
 *   subtitle {string}   small line beneath the value
 *   icon     {ReactNode} optional icon element
 *   accent   {string}   Tailwind text-color class for the icon/value accent
 */
export default function StatCard({ title, value, subtitle, icon, accent = "text-indigo-600" }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        {icon && (
          <span className={`${accent} opacity-80`}>{icon}</span>
        )}
      </div>
      <p className={`text-3xl font-bold tabular-nums ${accent}`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
