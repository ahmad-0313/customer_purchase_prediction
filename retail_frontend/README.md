# Customer Return Predictor — Frontend

A React dashboard for predicting which customers are likely to return within 90 days, using RFM (Recency, Frequency, Monetary) signals fed into a machine-learning model.

---

## Running locally

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

> The dev server is locked to port 5173 (`strictPort: true`). This matches the CORS allow-list on the real Django backend.

---

## Mock customer IDs to test

All of these are available in the mock data and will return a result:

| Customer ID | Recency (days) | Orders | Total Spent | Predicted Return Chance |
|-------------|---------------|--------|-------------|------------------------|
| **12346**   | 325           | 12     | £77,556.46  | Low (very lapsed)      |
| **12347**   | 2             | 8      | £4,921.53   | High (very recent)     |
| **12348**   | 75            | 5      | £2,019.40   | Medium                 |
| **12349**   | 14            | 22     | £15,320.00  | High                   |
| **12357**   | 7             | 25     | £21,000.00  | High                   |
| **12362**   | 3             | 30     | £35,000.00  | Very high              |
| 12350–12375 | Various       | —      | —           | See mock.js            |

**To get a 404 "Customer not found" response**, use any ID **not** in the list above, for example: `99999`.

---

## Testing the network error state

Open `src/api/mock.js` and change line:

```js
export let SIMULATE_NETWORK_ERROR = false;
```

to:

```js
export let SIMULATE_NETWORK_ERROR = true;
```

Every API call will then throw an `ApiError` with `status === 0`, and the UI will show  
**"Cannot reach the server. Is the backend running?"** with a Retry button.

Remember to set it back to `false` when done.

---

## Folder structure

```
retail_frontend/
├── index.html                  # HTML entry point (Inter font, SEO meta)
├── vite.config.js              # Vite + Tailwind v4 + strictPort: 5173
├── .env.example                # Env variable reference
├── .gitignore
├── README.md
│
└── src/
    ├── main.jsx                # React root
    ├── App.jsx                 # Router + Sidebar layout
    ├── index.css               # Tailwind v4 import + global base styles
    ├── config.js               # API_BASE_URL (reads VITE_API_URL env var)
    │
    ├── api/
    │   ├── errors.js           # ApiError class (status + body)
    │   ├── mock.js             # In-memory fake backend (30 customers, history)
    │   └── endpoints.js        # Public API layer — ONLY file components import
    │
    ├── components/
    │   ├── Sidebar.jsx         # Desktop sidebar + mobile hamburger
    │   ├── PageShell.jsx       # Page wrapper with header + footer
    │   ├── StatCard.jsx        # KPI tile
    │   ├── ProbabilityGauge.jsx # Circular SVG gauge
    │   ├── ProbabilityBar.jsx  # Slim horizontal bar
    │   ├── Badge.jsx           # Pill label (green / amber / red)
    │   ├── ResultCard.jsx      # Gauge + badge + RFM stats (reused on 2 pages)
    │   ├── DataTable.jsx       # Generic responsive table
    │   ├── Skeleton.jsx        # Skeleton, Spinner, LoadingOverlay
    │   ├── ErrorState.jsx      # Network / API error with Retry
    │   └── EmptyState.jsx      # Empty list placeholder
    │
    ├── pages/
    │   ├── Dashboard.jsx       # / — KPI cards, donut chart, at-risk table
    │   ├── Customer.jsx        # /customer/:id — lookup by ID
    │   ├── Predict.jsx         # /predict — manual what-if form
    │   └── History.jsx         # /history — prediction log
    │
    └── utils/
        └── format.js           # formatPercent, formatCurrency, formatDate, probabilityColor
```

---

## Connecting the real backend (to do)

When your Django REST API is ready, open `src/api/endpoints.js` and replace each mock call one at a time. The `ApiError` class stays the same — the UI needs no changes.

| Function | Method | URL | Replace mock call with |
|---|---|---|---|
| `getSummary()` | `GET` | `/api/dashboard/summary/` | `fetch(url)` → parse JSON → throw `ApiError` on non-2xx |
| `getAtRisk(limit)` | `GET` | `/api/dashboard/at-risk/?limit=<limit>` | same pattern |
| `predictCustomer(id)` | `POST` | `/api/customers/<id>/predict/` | `fetch(url, { method: 'POST' })` — no body needed |
| `predictManual({r,f,m})` | `POST` | `/api/predict/` | `fetch(url, { method: 'POST', body: JSON.stringify({recency,frequency,monetary}) })` |
| `getHistory()` | `GET` | `/api/predictions/` | `fetch(url)` → parse JSON |

Each function in `endpoints.js` has a detailed comment block with the exact request shape, success response, and error responses.

Steps to write each real fetch:
1. Import `API_BASE_URL` from `../config.js`.
2. Call `fetch(url, options)` with `"Content-Type": "application/json"` header.
3. Parse the response: `const body = await res.json()`.
4. If `!res.ok`, throw `new ApiError(res.status, body)`.
5. Return the body.

That's it — the UI will work without any further changes.
