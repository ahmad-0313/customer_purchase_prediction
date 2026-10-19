/**
 * Utility formatting functions used throughout the app.
 * Import these instead of doing inline formatting in components.
 */

/**
 * Format a 0-1 probability as a percentage string, e.g. 0.765 → "76.5%"
 * @param {number} value  0 to 1
 * @param {number} decimals  decimal places (default 1)
 */
export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number as GBP currency, e.g. 4921.53 → "£4,921.53"
 * @param {number} value
 */
export function formatCurrency(value) {
  if (value == null || isNaN(value)) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format an ISO 8601 UTC timestamp into a human-readable local date/time.
 * e.g. "2026-10-17T16:05:40.990150Z" → "17 Oct 2026, 21:05"
 * @param {string} isoString  UTC ISO string from the API
 */
export function formatDate(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Return a Tailwind color class string based on a 0–1 probability value.
 * Thresholds:  >= 0.7 → green,  0.4–0.7 → amber,  < 0.4 → red
 *
 * @param {number} probability  0 to 1
 * @param {"text"|"bg"|"border"} type  which Tailwind color variant to return
 * @returns {string}  Tailwind class
 */
export function probabilityColor(probability, type = "text") {
  if (probability >= 0.7) {
    return type === "text"
      ? "text-emerald-600"
      : type === "bg"
      ? "bg-emerald-500"
      : "border-emerald-500";
  }
  if (probability >= 0.4) {
    return type === "text"
      ? "text-amber-600"
      : type === "bg"
      ? "bg-amber-400"
      : "border-amber-400";
  }
  return type === "text"
    ? "text-red-600"
    : type === "bg"
    ? "bg-red-500"
    : "border-red-500";
}

/**
 * Return the hex colour matching probabilityColor thresholds (for Recharts).
 * @param {number} probability
 */
export function probabilityHex(probability) {
  if (probability >= 0.7) return "#10b981"; // emerald-500
  if (probability >= 0.4) return "#f59e0b"; // amber-400
  return "#ef4444";                          // red-500
}
