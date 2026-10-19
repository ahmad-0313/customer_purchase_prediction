import { InboxIcon } from "lucide-react";

/**
 * EmptyState — shown when a list or table has no rows.
 *
 * Props:
 *   title    {string}  headline
 *   message  {string}  secondary text
 *   icon     {ReactNode} optional icon override
 */
export default function EmptyState({ title = "No data", message, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
      <div className="p-3 bg-slate-100 rounded-full">
        {icon ?? <InboxIcon className="text-slate-400" size={28} />}
      </div>
      <p className="text-base font-semibold text-slate-600">{title}</p>
      {message && <p className="text-sm text-slate-400 max-w-sm">{message}</p>}
    </div>
  );
}
