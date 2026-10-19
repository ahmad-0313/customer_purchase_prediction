import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  UserSearch,
  Calculator,
  History,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/",         label: "Dashboard",       icon: LayoutDashboard },
  { to: "/customer", label: "Customer Lookup",  icon: UserSearch },
  { to: "/predict",  label: "What-if Predict",  icon: Calculator },
  { to: "/history",  label: "History",          icon: History },
];

/**
 * Sidebar navigation for desktop; collapses to a hamburger top-bar on mobile.
 */
export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 px-4 py-6 gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="text-indigo-600" size={22} />
          <span className="font-semibold text-slate-800 text-sm leading-tight">
            Return<br />Predictor
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={navLinkClass}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer note */}
        <div className="mt-auto text-xs text-slate-400 leading-relaxed px-1">
          Powered by RFM + ML
        </div>
      </aside>

      {/* ── Mobile top-bar ──────────────────────────────────────── */}
      <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-indigo-600" size={20} />
          <span className="font-semibold text-slate-800 text-sm">Return Predictor</span>
        </div>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile dropdown overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-black/30" onClick={() => setMobileOpen(false)}>
          <nav
            className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 flex flex-col gap-1 px-4 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileOpen(false)}
                className={navLinkClass}
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
