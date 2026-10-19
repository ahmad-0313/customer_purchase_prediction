import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import PageShell from "../components/PageShell.jsx";
import ResultCard from "../components/ResultCard.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { LoadingOverlay } from "../components/Skeleton.jsx";

import { predictCustomer } from "../api/endpoints.js";
import { ApiError } from "../api/errors.js";

export default function Customer() {
  const { id: urlId } = useParams();           // may be undefined at /customer
  const navigate = useNavigate();

  const [inputId, setInputId]   = useState(urlId ?? "");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null); // { status, message }

  // ── Run lookup automatically when the URL contains an ID ──────
  useEffect(() => {
    if (urlId) {
      setInputId(urlId);
      runLookup(urlId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId]);

  // ── Core lookup function ───────────────────────────────────────
  const runLookup = useCallback(async (id) => {
    const trimmed = String(id).trim();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await predictCustomer(trimmed);
      setResult(data);
      // Update the URL to reflect the looked-up ID (without forcing a re-fetch)
      navigate(`/customer/${trimmed}`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError({ status: 404, message: "Customer not found. Check the ID and try again." });
        } else if (err.status === 0) {
          setError({ status: 0 });
        } else {
          setError({ status: err.status, message: err.body?.detail ?? "Unexpected error." });
        }
      } else {
        setError({ status: 0 });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ── Form submit ────────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();
    runLookup(inputId);
  }

  return (
    <PageShell title="Customer Lookup">
      <p className="text-sm text-slate-500 mb-6">
        Enter a customer ID to see their predicted chance of returning within 90 days.
      </p>

      {/* ── Search form ─────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-3 mb-8 max-w-sm"
        aria-label="Customer ID lookup form"
      >
        <div className="flex-1">
          <label htmlFor="customer-id-input" className="sr-only">
            Customer ID
          </label>
          <input
            id="customer-id-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 12347"
            value={inputId}
            onChange={(e) => setInputId(e.target.value.replace(/\D/g, ""))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
            aria-label="Customer ID"
          />
        </div>
        <button
          id="check-customer-btn"
          type="submit"
          disabled={loading || !inputId}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Search size={16} />
          Check
        </button>
      </form>

      {/* ── States ────────────────────────────────────────────────── */}
      {loading && <LoadingOverlay message="Looking up customer…" />}

      {error && !loading && (
        <ErrorState
          status={error.status}
          message={error.message}
          onRetry={() => runLookup(inputId)}
        />
      )}

      {result && !loading && !error && (
        <ResultCard result={result} />
      )}

      {/* Hint when nothing has been searched yet */}
      {!result && !loading && !error && !urlId && (
        <p className="text-sm text-slate-400">
          Try IDs: <span className="font-mono">12346</span>, <span className="font-mono">12347</span>, <span className="font-mono">12348</span>
          {" "}— or <span className="font-mono">99999</span> for a 404.
        </p>
      )}
    </PageShell>
  );
}
