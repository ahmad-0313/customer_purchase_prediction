import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

import PageShell from "../components/PageShell.jsx";
import DataTable from "../components/DataTable.jsx";
import Badge from "../components/Badge.jsx";
import ErrorState from "../components/ErrorState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { LoadingOverlay } from "../components/Skeleton.jsx";

import { getHistory } from "../api/endpoints.js";
import { ApiError } from "../api/errors.js";
import { formatPercent, formatCurrency, formatDate, probabilityColor } from "../utils/format.js";

// ── Table columns definition ───────────────────────────────────────────────
const COLUMNS = [
  {
    key: "created_at",
    header: "Time",
    // Convert UTC ISO to local time for display
    render: (v) => <span className="text-slate-600">{formatDate(v)}</span>,
  },
  {
    key: "customer_id",
    header: "Customer",
    render: (v) =>
      v != null ? (
        <span className="font-mono text-slate-700">#{v}</span>
      ) : (
        <span className="text-slate-400 italic">Manual</span>
      ),
  },
  {
    key: "recency",
    header: "Days Since Last Purchase",
    align: "right",
    render: (v) => <span className="tabular-nums">{v}</span>,
  },
  {
    key: "frequency",
    header: "Orders",
    align: "right",
    render: (v) => <span className="tabular-nums">{v}</span>,
  },
  {
    key: "monetary",
    header: "Total Spent",
    align: "right",
    render: (v) => formatCurrency(v),
  },
  {
    key: "probability",
    header: "Chance of Returning",
    render: (v) => {
      const variant = v >= 0.7 ? "green" : v >= 0.4 ? "amber" : "red";
      return (
        <Badge variant={variant}>
          {formatPercent(v)}
        </Badge>
      );
    },
  },
];

export default function History() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory();
      setRows(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError({ status: err.status, message: err.body?.detail });
      } else {
        setError({ status: 0 });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <PageShell title="Prediction History">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">
          The 50 most recent predictions, newest first.
        </p>
        <button
          id="history-refresh-btn"
          onClick={loadHistory}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Refresh history"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading && <LoadingOverlay message="Loading history…" />}

      {error && !loading && (
        <ErrorState
          status={error.status}
          message={error.message}
          onRetry={loadHistory}
        />
      )}

      {!loading && !error && rows.length === 0 && (
        <EmptyState
          title="No predictions yet"
          message="Use the Customer Lookup or What-if Prediction pages to run your first prediction."
        />
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={COLUMNS} rows={rows} keyField="id" />
        </div>
      )}
    </PageShell>
  );
}
