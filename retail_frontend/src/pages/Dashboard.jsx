import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Users, UserCheck, UserX, TrendingUp, RefreshCw } from "lucide-react";

import PageShell from "../components/PageShell.jsx";
import StatCard from "../components/StatCard.jsx";
import DataTable from "../components/DataTable.jsx";
import ProbabilityBar from "../components/ProbabilityBar.jsx";
import ErrorState from "../components/ErrorState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { Skeleton, LoadingOverlay } from "../components/Skeleton.jsx";

import { getSummary, getAtRisk } from "../api/endpoints.js";
import { ApiError } from "../api/errors.js";
import { formatPercent, formatCurrency } from "../utils/format.js";

// Colours for the three risk groups in the donut chart
const RISK_COLORS = {
  high_chance:   "#10b981", // emerald
  medium_chance: "#f59e0b", // amber
  low_chance:    "#ef4444", // red
};

const RISK_LABELS = {
  high_chance:   "High chance (≥70%)",
  medium_chance: "Medium chance (40–70%)",
  low_chance:    "Low chance (<40%)",
};

// Columns for the at-risk table
const AT_RISK_COLUMNS = [
  { key: "customer_id", header: "Customer ID",              align: "left" },
  { key: "monetary",    header: "Total Spent",              align: "right",
    render: (v) => formatCurrency(v) },
  { key: "frequency",   header: "Orders",                   align: "right" },
  { key: "recency",     header: "Days Since Last Purchase", align: "right" },
  {
    key: "probability",
    header: "Chance of Returning",
    align: "left",
    render: (v) => <ProbabilityBar value={v} />,
  },
];

const LIMIT_OPTIONS = [10, 20, 50];

export default function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary]     = useState(null);
  const [atRisk, setAtRisk]       = useState([]);
  const [limit, setLimit]         = useState(20);
  const [loading, setLoading]     = useState(true);
  const [atRiskLoading, setAtRiskLoading] = useState(false);
  const [error, setError]         = useState(null); // { status, message }
  const [noData, setNoData]       = useState(false);

  // ── Fetch summary ──────────────────────────────────────────────
  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoData(false);
    try {
      const data = await getSummary();
      setSummary(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setNoData(true);      // backend has no data loaded yet
        } else {
          setError({ status: err.status, message: err.body?.detail });
        }
      } else {
        setError({ status: 0 });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch at-risk list ─────────────────────────────────────────
  const loadAtRisk = useCallback(async (lim) => {
    setAtRiskLoading(true);
    try {
      const data = await getAtRisk(lim);
      setAtRisk(data);
    } catch (err) {
      // Non-critical; don't replace the whole page with an error
      console.error("At-risk load failed", err);
    } finally {
      setAtRiskLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (summary) loadAtRisk(limit);
  }, [summary, limit, loadAtRisk]);

  // ── Derived data for donut chart ───────────────────────────────
  const donutData = summary
    ? Object.entries(summary.risk_groups).map(([key, value]) => ({
        name: RISK_LABELS[key],
        value,
        color: RISK_COLORS[key],
      }))
    : [];

  // ── Render states ──────────────────────────────────────────────
  if (loading) {
    return (
      <PageShell title="Dashboard">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl mb-8" />
        <Skeleton className="h-48 rounded-xl" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Dashboard">
        <ErrorState
          status={error.status}
          message={error.message}
          onRetry={loadSummary}
        />
      </PageShell>
    );
  }

  if (noData) {
    return (
      <PageShell title="Dashboard">
        <EmptyState
          title="No customer data loaded yet"
          message="The backend hasn't had any customer data uploaded. Once data is loaded, refresh this page."
        />
      </PageShell>
    );
  }

  const returnPct = summary.total_customers > 0
    ? formatPercent(summary.likely_to_return / summary.total_customers)
    : "—";

  return (
    <PageShell title="Dashboard">

      {/* ── KPI cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Customers"
          value={summary.total_customers.toLocaleString()}
          subtitle="in the dataset"
          icon={<Users size={20} />}
          accent="text-slate-700"
        />
        <StatCard
          title="Likely to Return"
          value={summary.likely_to_return.toLocaleString()}
          subtitle={`${returnPct} of total`}
          icon={<UserCheck size={20} />}
          accent="text-emerald-600"
        />
        <StatCard
          title="Unlikely to Return"
          value={summary.likely_to_leave.toLocaleString()}
          subtitle={`${formatPercent(summary.likely_to_leave / summary.total_customers)} of total`}
          icon={<UserX size={20} />}
          accent="text-red-500"
        />
        <StatCard
          title="Avg. Chance of Returning"
          value={formatPercent(summary.avg_probability)}
          subtitle={`threshold: ${formatPercent(summary.threshold)}`}
          icon={<TrendingUp size={20} />}
          accent="text-indigo-600"
        />
      </div>

      {/* ── Risk-group donut chart ─────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          Customers by Risk Group
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                dataKey="value"
                paddingAngle={3}
              >
                {donutData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value.toLocaleString(), name]}
                contentStyle={{ fontSize: "13px", borderRadius: "8px" }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-slate-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── At-risk table ─────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              At-risk Valuable Customers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Biggest spenders who are unlikely to come back — contact them first.
            </p>
          </div>

          {/* Limit selector */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <label htmlFor="limit-select" className="text-xs font-medium">Show</label>
            <select
              id="limit-select"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border border-slate-200 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LIMIT_OPTIONS.map((n) => (
                <option key={n} value={n}>{n} rows</option>
              ))}
            </select>
          </div>
        </div>

        {atRiskLoading ? (
          <LoadingOverlay message="Loading at-risk customers…" />
        ) : atRisk.length === 0 ? (
          <EmptyState
            title="No at-risk customers"
            message="Everyone is above the return threshold — great news!"
          />
        ) : (
          <DataTable
            columns={AT_RISK_COLUMNS}
            rows={atRisk}
            keyField="customer_id"
            onRowClick={(row) => navigate(`/customer/${row.customer_id}`)}
          />
        )}
      </section>
    </PageShell>
  );
}
