/**
 * PageShell — layout wrapper that adds the page title, footer,
 * and consistent horizontal padding.
 *
 * Props:
 *   title    {string}   H1 for the page (also shown in the content area)
 *   children {ReactNode}
 */
export default function PageShell({ title, children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      </div>

      {/* Main content */}
      <main className="flex-1 px-6 pb-8">
        {children}
      </main>

      {/* Footer on every page — accuracy disclaimer */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-4">
        <p className="text-xs text-slate-400 max-w-3xl">
          Estimates come from a machine learning model (about 0.79 AUC on held-out data).
          Use them to prioritise who to contact, not as a guarantee.
        </p>
      </footer>
    </div>
  );
}
