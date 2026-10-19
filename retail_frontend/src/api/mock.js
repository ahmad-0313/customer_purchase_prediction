import { ApiError } from "./errors.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Set to true to make every API call immediately throw a network-failure error
 * (ApiError with status 0). Useful for testing the "Cannot reach the server" UI.
 * Toggle this in the browser console or here in the source:
 *   import { SIMULATE_NETWORK_ERROR } from './api/mock.js'
 */
export let SIMULATE_NETWORK_ERROR = false;

// ---------------------------------------------------------------------------
// Simulated network latency helper
// ---------------------------------------------------------------------------

/** Returns a promise that resolves after a random delay between 400–800 ms */
function delay() {
  const ms = 400 + Math.random() * 400;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Mock customer data (≈ 30 customers)
// IDs 12346, 12347, 12348 match the exact values in the API contract.
// ---------------------------------------------------------------------------

const MOCK_CUSTOMERS_RAW = [
  // [customer_id, recency, frequency, monetary]
  [12346, 325, 12, 77556.46],  // high monetary, very lapsed
  [12347, 2,   8,  4921.53],   // very recent
  [12348, 75,  5,  2019.40],   // mid-range
  [12349, 14,  22, 15320.00],
  [12350, 180, 3,  980.00],
  [12351, 5,   15, 8800.50],
  [12352, 365, 1,  120.00],
  [12353, 30,  10, 4500.00],
  [12354, 200, 6,  3100.25],
  [12355, 45,  18, 12750.80],
  [12356, 90,  7,  2240.60],
  [12357, 7,   25, 21000.00],
  [12358, 400, 2,  650.00],
  [12359, 60,  9,  3890.00],
  [12360, 15,  14, 7600.00],
  [12361, 270, 4,  1400.00],
  [12362, 3,   30, 35000.00],
  [12363, 120, 6,  2500.00],
  [12364, 50,  11, 5100.00],
  [12365, 8,   19, 14200.00],
  [12366, 310, 2,  430.00],
  [12367, 22,  13, 6750.00],
  [12368, 160, 5,  2200.00],
  [12369, 40,  8,  3300.00],
  [12370, 500, 1,  80.00],
  [12371, 12,  20, 17500.00],
  [12372, 230, 3,  760.00],
  [12373, 55,  9,  3950.00],
  [12374, 100, 7,  3000.00],
  [12375, 20,  16, 9400.00],
];

// ---------------------------------------------------------------------------
// Probability formula
// ---------------------------------------------------------------------------
/**
 * Simple logistic-style probability estimate.
 *
 * Intuition:
 *  - Lower recency → more recent → higher chance of returning
 *  - Higher frequency → more loyal → higher chance
 *  - Higher monetary → bigger spender → slightly higher chance (dampened by log)
 *
 * The formula is intentionally transparent so you can follow the math.
 * It is NOT the real ML model; it just produces realistic-looking numbers.
 *
 * Steps:
 *  1. Compute a "score" as a weighted sum of normalised signals.
 *  2. Pass the score through a logistic function (sigmoid) → value in (0, 1).
 */
function computeProbability(recency, frequency, monetary) {
  // Normalise each feature against rough max values seen in retail RFM data
  const recencyScore  = 1 - Math.min(recency / 400, 1);       // 0 = very lapsed, 1 = just bought
  const freqScore     = Math.min(frequency / 30, 1);           // 0 = one-time, 1 = very loyal
  const moneyScore    = Math.min(Math.log1p(monetary) / Math.log1p(80000), 1); // log dampens outliers

  // Weighted sum — recency matters most, then frequency, then spend
  const score = 2.5 * recencyScore + 1.5 * freqScore + 0.5 * moneyScore - 2.0;

  // Logistic (sigmoid) function maps any real number to (0, 1)
  const probability = 1 / (1 + Math.exp(-score));

  // Round to 4 decimal places, matching the contract examples
  return Math.round(probability * 10000) / 10000;
}

// ---------------------------------------------------------------------------
// Build the in-memory customer list
// ---------------------------------------------------------------------------

const CUSTOMERS = MOCK_CUSTOMERS_RAW.map(([customer_id, recency, frequency, monetary]) => ({
  customer_id,
  recency: parseFloat(recency),
  frequency,
  monetary: parseFloat(monetary),
  probability: computeProbability(recency, frequency, monetary),
  will_return: computeProbability(recency, frequency, monetary) >= 0.5,
}));

// Map for fast lookup by ID
const CUSTOMER_MAP = new Map(CUSTOMERS.map((c) => [c.customer_id, c]));

// The threshold that separates "likely to return" from "likely to leave"
const THRESHOLD = 0.5;

// ---------------------------------------------------------------------------
// In-memory prediction history  (5 seeded entries, newest first)
// ---------------------------------------------------------------------------

let historyIdCounter = 6; // next ID to assign

const SEEDED_HISTORY = [
  { customer_id: 12347, recency: 2.0,   frequency: 8,  monetary: 4921.53,  probability: computeProbability(2, 8, 4921.53) },
  { customer_id: 12362, recency: 3.0,   frequency: 30, monetary: 35000.00, probability: computeProbability(3, 30, 35000) },
  { customer_id: null,  recency: 10.0,  frequency: 12, monetary: 900.00,   probability: computeProbability(10, 12, 900) },
  { customer_id: 12346, recency: 325.0, frequency: 12, monetary: 77556.46, probability: computeProbability(325, 12, 77556.46) },
  { customer_id: null,  recency: 300.0, frequency: 1,  monetary: 40.00,    probability: computeProbability(300, 1, 40) },
].map((item, idx) => ({
  id: idx + 1,
  customer_id: item.customer_id,
  recency: item.recency,
  frequency: parseFloat(item.frequency),
  monetary: item.monetary,
  probability: item.probability,
  will_return: item.probability >= THRESHOLD,
  // Spread timestamps across the last few days so the history looks realistic
  created_at: new Date(Date.now() - (5 - idx) * 18 * 3600 * 1000).toISOString(),
}));

let predictionHistory = [...SEEDED_HISTORY];

// ---------------------------------------------------------------------------
// Helper: throw if SIMULATE_NETWORK_ERROR is on
// ---------------------------------------------------------------------------

function maybeNetworkError() {
  if (SIMULATE_NETWORK_ERROR) {
    throw new ApiError(0, { detail: "Simulated network error. The server is unreachable." });
  }
}

// ---------------------------------------------------------------------------
// Mock implementations (called by endpoints.js)
// ---------------------------------------------------------------------------

/**
 * GET /dashboard/summary/
 * Returns aggregate stats derived from CUSTOMERS.
 */
export async function mockGetSummary() {
  await delay();
  maybeNetworkError();

  const total = CUSTOMERS.length;
  const likelyReturn = CUSTOMERS.filter((c) => c.probability >= THRESHOLD).length;
  const likelyLeave  = total - likelyReturn;
  const avgProb      = CUSTOMERS.reduce((sum, c) => sum + c.probability, 0) / total;

  const highChance   = CUSTOMERS.filter((c) => c.probability >= 0.7).length;
  const mediumChance = CUSTOMERS.filter((c) => c.probability >= 0.4 && c.probability < 0.7).length;
  const lowChance    = CUSTOMERS.filter((c) => c.probability < 0.4).length;

  return {
    total_customers: total,
    likely_to_return: likelyReturn,
    likely_to_leave: likelyLeave,
    avg_probability: Math.round(avgProb * 10000) / 10000,
    risk_groups: {
      high_chance: highChance,
      medium_chance: mediumChance,
      low_chance: lowChance,
    },
    predictions_saved: predictionHistory.length,
    threshold: THRESHOLD,
  };
}

/**
 * GET /dashboard/at-risk/?limit=<limit>
 * Returns customers below the threshold, sorted by monetary descending.
 */
export async function mockGetAtRisk(limit = 20) {
  await delay();
  maybeNetworkError();

  // Validate limit
  if (!Number.isInteger(limit) || limit < 1) {
    throw new ApiError(400, { limit: ["Must be a whole number."] });
  }

  const atRisk = CUSTOMERS
    .filter((c) => c.probability < THRESHOLD)
    .sort((a, b) => b.monetary - a.monetary)
    .slice(0, limit)
    .map(({ customer_id, recency, frequency, monetary, probability }) => ({
      customer_id, recency, frequency, monetary, probability,
    }));

  return atRisk;
}

/**
 * POST /customers/<customer_id>/predict/
 * Looks up the customer and returns a prediction record.
 */
export async function mockPredictCustomer(customerId) {
  await delay();
  maybeNetworkError();

  const customer = CUSTOMER_MAP.get(Number(customerId));
  if (!customer) {
    throw new ApiError(404, { detail: "No Customer matches the given query." });
  }

  const record = {
    id: historyIdCounter++,
    customer_id: customer.customer_id,
    recency: customer.recency,
    frequency: parseFloat(customer.frequency),
    monetary: customer.monetary,
    probability: customer.probability,
    will_return: customer.will_return,
    created_at: new Date().toISOString(),
  };

  // Prepend to history (newest first)
  predictionHistory = [record, ...predictionHistory];

  return record;
}

/**
 * POST /predict/
 * Manual prediction from arbitrary RFM values.
 * Validates input with the exact messages from the API contract.
 */
export async function mockPredictManual({ recency, frequency, monetary }) {
  await delay();
  maybeNetworkError();

  // --- Validation (mirrors Django REST Framework field errors) ---
  const errors = {};

  function validateField(name, value, opts = {}) {
    if (value === undefined || value === null || value === "") {
      errors[name] = ["This field is required."];
      return;
    }
    const num = Number(value);
    if (isNaN(num)) {
      errors[name] = ["A valid number is required."];
      return;
    }
    if (opts.integer && !Number.isInteger(num)) {
      errors[name] = ["A valid integer is required."];
      return;
    }
    if (opts.min !== undefined && num < opts.min) {
      errors[name] = [
        `Ensure this value is greater than or equal to ${opts.min}.`,
      ];
    }
  }

  validateField("recency",   recency,   { min: 0 });
  validateField("frequency", frequency, { integer: true, min: 1 });
  validateField("monetary",  monetary,  { min: 0 });

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, errors);
  }

  const prob = computeProbability(Number(recency), Number(frequency), Number(monetary));

  const record = {
    id: historyIdCounter++,
    customer_id: null,
    recency: parseFloat(recency),
    frequency: parseInt(frequency, 10),
    monetary: parseFloat(monetary),
    probability: prob,
    will_return: prob >= THRESHOLD,
    created_at: new Date().toISOString(),
  };

  predictionHistory = [record, ...predictionHistory];

  return record;
}

/**
 * GET /predictions/
 * Returns the history list (newest first, max 50).
 */
export async function mockGetHistory() {
  await delay();
  maybeNetworkError();

  return predictionHistory.slice(0, 50);
}
