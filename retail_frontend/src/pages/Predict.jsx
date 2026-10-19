import { useState } from "react";
import { Sparkles } from "lucide-react";

import PageShell from "../components/PageShell.jsx";
import ResultCard from "../components/ResultCard.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { Spinner } from "../components/Skeleton.jsx";

import { predictManual } from "../api/endpoints.js";
import { ApiError } from "../api/errors.js";

// Preset "Try an example" scenarios
const EXAMPLES = [
  { label: "Loyal customer",  values: { recency: 10,  frequency: 12, monetary: 900 } },
  { label: "Lapsed customer", values: { recency: 300, frequency: 1,  monetary: 40  } },
  { label: "Big spender",     values: { recency: 20,  frequency: 18, monetary: 15000 } },
];

// Helper: initial blank form state
const BLANK = { recency: "", frequency: "", monetary: "" };

export default function Predict() {
  const [form, setForm]           = useState(BLANK);
  const [fieldErrors, setFieldErrors] = useState({}); // backend 400 field errors
  const [clientErrors, setClientErrors] = useState({}); // client-side pre-validation
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [networkError, setNetworkError] = useState(null);

  // ── Client-side validation (mirrors the backend rules) ─────────
  function validate(values) {
    const errs = {};
    const { recency, frequency, monetary } = values;

    if (recency === "" || recency === null || recency === undefined) {
      errs.recency = "This field is required.";
    } else if (isNaN(Number(recency))) {
      errs.recency = "A valid number is required.";
    } else if (Number(recency) < 0) {
      errs.recency = "Ensure this value is greater than or equal to 0.";
    }

    if (frequency === "" || frequency === null || frequency === undefined) {
      errs.frequency = "This field is required.";
    } else if (isNaN(Number(frequency))) {
      errs.frequency = "A valid number is required.";
    } else if (!Number.isInteger(Number(frequency))) {
      errs.frequency = "A valid integer is required.";
    } else if (Number(frequency) < 1) {
      errs.frequency = "Ensure this value is greater than or equal to 1.";
    }

    if (monetary === "" || monetary === null || monetary === undefined) {
      errs.monetary = "This field is required.";
    } else if (isNaN(Number(monetary))) {
      errs.monetary = "A valid number is required.";
    } else if (Number(monetary) < 0) {
      errs.monetary = "Ensure this value is greater than or equal to 0.";
    }

    return errs;
  }

  // ── Form submission ────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setFieldErrors({});
    setNetworkError(null);
    setResult(null);

    // Run client-side validation first
    const cErrs = validate(form);
    if (Object.keys(cErrs).length > 0) {
      setClientErrors(cErrs);
      return;
    }
    setClientErrors({});

    setLoading(true);
    try {
      const data = await predictManual({
        recency:   Number(form.recency),
        frequency: Number(form.frequency),
        monetary:  Number(form.monetary),
      });
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        // Show backend field-level errors next to each field
        const normalized = {};
        for (const [key, msgs] of Object.entries(err.body)) {
          normalized[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        }
        setFieldErrors(normalized);
      } else if (err instanceof ApiError) {
        setNetworkError({ status: err.status });
      } else {
        setNetworkError({ status: 0 });
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Fill form with example values ─────────────────────────────
  function fillExample(values) {
    setForm({ recency: values.recency, frequency: values.frequency, monetary: values.monetary });
    setClientErrors({});
    setFieldErrors({});
    setResult(null);
    setNetworkError(null);
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as the user types
    setClientErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    setFieldErrors((prev)  => { const n = { ...prev }; delete n[field]; return n; });
  }

  // Merge errors: backend takes precedence (they're shown after submit)
  const errors = { ...clientErrors, ...fieldErrors };

  return (
    <PageShell title="What-if Prediction">
      <p className="text-sm text-slate-500 mb-6 max-w-lg">
        Enter any RFM values to estimate the chance of a customer returning. This does not
        require an existing customer ID.
      </p>

      {/* ── Example buttons ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            id={`example-${ex.label.toLowerCase().replace(/ /g, "-")}`}
            onClick={() => fillExample(ex.values)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <Sparkles size={12} />
            {ex.label}
          </button>
        ))}
      </div>

      {/* ── Input form ────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="What-if prediction form"
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-lg mb-8"
      >
        <div className="flex flex-col gap-5">
          <Field
            id="recency"
            label="Days since last purchase"
            helper="Enter 0 if they bought today."
            type="number"
            min="0"
            step="1"
            value={form.recency}
            onChange={(v) => handleChange("recency", v)}
            error={errors.recency}
          />
          <Field
            id="frequency"
            label="Number of orders"
            helper="Total number of orders the customer has made (whole number, at least 1)."
            type="number"
            min="1"
            step="1"
            value={form.frequency}
            onChange={(v) => handleChange("frequency", v)}
            error={errors.frequency}
          />
          <Field
            id="monetary"
            label="Total spent (£)"
            helper="Cumulative spend in GBP. Enter 0 if unknown."
            type="number"
            min="0"
            step="0.01"
            value={form.monetary}
            onChange={(v) => handleChange("monetary", v)}
            error={errors.monetary}
          />
        </div>

        <button
          id="predict-submit-btn"
          type="submit"
          disabled={loading}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {loading ? <Spinner size="h-4 w-4" className="border-2" /> : null}
          {loading ? "Predicting…" : "Predict"}
        </button>
      </form>

      {/* ── States ───────────────────────────────────────────────── */}
      {networkError && (
        <ErrorState
          status={networkError.status}
          onRetry={handleSubmit}
        />
      )}

      {result && !loading && (
        <ResultCard result={result} />
      )}
    </PageShell>
  );
}

// ── Field sub-component ─────────────────────────────────────────────────────
function Field({ id, label, helper, error, onChange, value, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors
          ${error ? "border-red-400 bg-red-50" : "border-slate-200"}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : `${id}-help`}
      />
      {/* Helper text or error — always occupies space to prevent layout shift */}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">{error}</p>
      ) : (
        <p id={`${id}-help`} className="mt-1 text-xs text-slate-400">{helper}</p>
      )}
    </div>
  );
}
