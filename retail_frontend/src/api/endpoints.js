import {
  mockGetSummary,
  mockGetAtRisk,
  mockPredictCustomer,
  mockPredictManual,
  mockGetHistory,
} from "./mock.js";

import { request } from "./client";
// ---------------------------------------------------------------------------
// endpoints.js
//
// This is the ONLY file that pages and components should import from.
// Right now every function delegates to mock.js.
//
// When you are ready to connect the real Django backend, work through the
// TODO comments one function at a time. The API contract is documented above
// each function.  The UI relies only on ApiError, so it won't need to change.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// getSummary
// ---------------------------------------------------------------------------
/*
 * TODO (connect backend): replace the mock call with a real fetch.
 *
 * Real request:
 *   GET  <API_BASE_URL>/dashboard/summary/
 *   Headers: { "Content-Type": "application/json" }
 *   Body: none
 *
 * Success (200):
 *   {
 *     "total_customers": 5878,
 *     "likely_to_return": 2070,
 *     "likely_to_leave": 3808,
 *     "avg_probability": 0.4036,
 *     "risk_groups": { "high_chance": 1134, "medium_chance": 1499, "low_chance": 3245 },
 *     "predictions_saved": 4,
 *     "threshold": 0.5
 *   }
 *
 * Errors:
 *   404 → { "detail": "No customers loaded. ..." }   (show "no data loaded yet" UI)
 *
 * Notes:
 *   - A 404 here means the backend has no customer data loaded, not a missing route.
 *   - Throw ApiError(404, body) so the Dashboard can show the friendly empty state.
 */
export async function getSummary() {
  return request("/dashboard/summary/");
}

// ---------------------------------------------------------------------------
// getAtRisk
// ---------------------------------------------------------------------------
/*
 * TODO (connect backend): replace the mock call with a real fetch.
 *
 * Real request:
 *   GET  <API_BASE_URL>/dashboard/at-risk/?limit=<limit>
 *   Headers: { "Content-Type": "application/json" }
 *   Body: none
 *
 * Success (200):
 *   [
 *     { "customer_id": 12346, "recency": 325.0, "frequency": 12,
 *       "monetary": 77556.46, "probability": 0.2276 },
 *     ...
 *   ]
 *   Customers below the 0.5 threshold, sorted by monetary descending.
 *
 * Errors:
 *   400 → { "limit": ["Must be a whole number."] }
 *
 * Notes:
 *   - The limit query param is optional (default 20, max 100).
 *   - Build the URL as: `${API_BASE_URL}/dashboard/at-risk/?limit=${limit}`
 */
export function getAtRisk(limit = 20) {
  return request(`/dashboard/at-risk/?limit=${limit}`);
}

// ---------------------------------------------------------------------------
// predictCustomer
// ---------------------------------------------------------------------------
/*
 * TODO (connect backend): replace the mock call with a real fetch.
 *
 * Real request:
 *   POST  <API_BASE_URL>/customers/<customerId>/predict/
 *   Headers: { "Content-Type": "application/json" }
 *   Body: none  (no request body — the backend looks up the customer by URL param)
 *
 * Success (201):
 *   {
 *     "id": 1, "customer_id": 12347, "recency": 2.0, "frequency": 8.0,
 *     "monetary": 4921.53, "probability": 0.765, "will_return": true,
 *     "created_at": "2026-10-17T16:05:40.990150Z"
 *   }
 *
 * Errors:
 *   404 → { "detail": "No Customer matches the given query." }
 *
 * Notes:
 *   - Use method: "POST" even though there is no body.
 *   - Expect status 201 (Created), not 200.
 */
export function predictCustomer(customerId) {
  return request(`/customers/${encodeURIComponent(customerId)}/predict/`, {
    method: "POST",
  });
}

// ---------------------------------------------------------------------------
// predictManual
// ---------------------------------------------------------------------------
/*
 * TODO (connect backend): replace the mock call with a real fetch.
 *
 * Real request:
 *   POST  <API_BASE_URL>/predict/
 *   Headers: { "Content-Type": "application/json" }
 *   Body:  { "recency": 10, "frequency": 12, "monetary": 900 }
 *
 * Success (201):
 *   Same shape as predictCustomer, with "customer_id": null.
 *
 * Errors:
 *   400 → field-level object, e.g.:
 *     { "frequency": ["Ensure this value is greater than or equal to 1."] }
 *   Possible messages per field:
 *     missing            → "This field is required."
 *     not a number       → "A valid number is required."
 *     frequency not int  → "A valid integer is required."
 *     below minimum      → "Ensure this value is greater than or equal to 0." (or 1 for frequency)
 *
 * Notes:
 *   - Body must be JSON: JSON.stringify({ recency, frequency, monetary })
 *   - Expect status 201.
 *   - The UI reads error.body[fieldName][0] to show inline field errors.
 */
export function predictManual({ recency, frequency, monetary }) {
  return request("/predict/", {
    method: "POST",
    body: JSON.stringify({ recency, frequency, monetary }),
  });
}

// ---------------------------------------------------------------------------
// getHistory
// ---------------------------------------------------------------------------
/*
 * TODO (connect backend): replace the mock call with a real fetch.
 *
 * Real request:
 *   GET  <API_BASE_URL>/predictions/
 *   Headers: { "Content-Type": "application/json" }
 *   Body: none
 *
 * Success (200):
 *   List of up to 50 prediction objects (same shape as predictCustomer/predictManual),
 *   newest first. customer_id is null for manual predictions.
 *
 * Notes:
 *   - No query params needed; the backend always returns the latest 50.
 *   - Display created_at in the user's local timezone (use formatDate from utils/format.js).
 */
export function getHistory() {
  return request("/predictions/");
}
