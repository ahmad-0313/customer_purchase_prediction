import ProbabilityGauge from "./ProbabilityGauge.jsx";
import Badge from "./Badge.jsx";
import { formatCurrency, formatPercent } from "../utils/format.js";

/**
 * ResultCard — displays the result of a customer or manual prediction.
 *
 * Props:
 *   result  {object}  A prediction object from the API:
 *     { customer_id, recency, frequency, monetary, probability, will_return }
 */
export default function ResultCard({ result }) {
  const {
    customer_id,
    recency,
    frequency,
    monetary,
    probability,
    will_return,
  } = result;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      {/* Circular gauge */}
      <div className="shrink-0">
        <ProbabilityGauge value={probability} size={150} />
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col gap-4 w-full">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">
            {customer_id != null ? `Customer #${customer_id}` : "Manual prediction"}
          </h2>
          <Badge variant={will_return ? "green" : "red"}>
            {will_return ? "Likely to return" : "Unlikely to return"}
          </Badge>
        </div>

        {/* Three RFM stats */}
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat label="Days since last purchase" value={recency ?? "—"} />
          <Stat label="Number of orders"         value={frequency ?? "—"} />
          <Stat label="Total spent"              value={formatCurrency(monetary)} />
        </dl>

        {/* Probability text (accessibility: never rely only on colour) */}
        <p className="text-sm text-slate-500">
          Predicted chance of returning within 90 days:{" "}
          <span className="font-semibold text-slate-700">{formatPercent(probability)}</span>
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <dt className="text-xs text-slate-500 mb-1">{label}</dt>
      <dd className="text-base font-semibold text-slate-800 tabular-nums">{value}</dd>
    </div>
  );
}
