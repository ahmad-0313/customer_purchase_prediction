/**
 * Badge — a small pill label for categorical status.
 *
 * Props:
 *   variant  {"green"|"red"|"amber"|"slate"}  colour scheme
 *   children {ReactNode}
 */
export default function Badge({ variant = "slate", children }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    red:   "bg-red-50    text-red-700    border border-red-200",
    amber: "bg-amber-50  text-amber-700  border border-amber-200",
    slate: "bg-slate-50  text-slate-600  border border-slate-200",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant] ?? styles.slate}`}>
      {children}
    </span>
  );
}
