# Customer Return Predictor — Build Summary

> `npm run build` ✅ exits with code 0. Dev server running on http://localhost:5173. Zero console errors.

---

## Screenshots

````carousel
![Dashboard — KPI cards + donut chart + at-risk table](C:\Users\Ahmad\.gemini\antigravity-ide\brain\ab6d56cf-5e2f-42ee-b3dc-190fcf3c92c0\home_page_loaded_1792340218406.png)
<!-- slide -->
![Customer Lookup — Customer #12347, 78% chance of returning](C:\Users\Ahmad\.gemini\antigravity-ide\brain\ab6d56cf-5e2f-42ee-b3dc-190fcf3c92c0\customer_12347_page_1792340266521.png)
<!-- slide -->
![What-if Predict — "Loyal customer" example filled & result shown](C:\Users\Ahmad\.gemini\antigravity-ide\brain\ab6d56cf-5e2f-42ee-b3dc-190fcf3c92c0\predict_result_1792340335971.png)
<!-- slide -->
![History — seeded + live predictions table](C:\Users\Ahmad\.gemini\antigravity-ide\brain\ab6d56cf-5e2f-42ee-b3dc-190fcf3c92c0\history_page_1792340364462.png)
````

---

## Files Created

| File | Purpose |
|------|---------|
| [`vite.config.js`](file:///e:/Projects/retail_frontend/vite.config.js) | Vite + Tailwind v4 plugin + `strictPort: 5173` |
| [`index.html`](file:///e:/Projects/retail_frontend/index.html) | Inter font, SEO meta tags |
| [`src/config.js`](file:///e:/Projects/retail_frontend/src/config.js) | `API_BASE_URL` (reads `VITE_API_URL` env var) |
| [`src/index.css`](file:///e:/Projects/retail_frontend/src/index.css) | Tailwind v4 import + global base styles |
| [`src/App.jsx`](file:///e:/Projects/retail_frontend/src/App.jsx) | Router + layout |
| [`src/api/errors.js`](file:///e:/Projects/retail_frontend/src/api/errors.js) | `ApiError(status, body)` class |
| [`src/api/mock.js`](file:///e:/Projects/retail_frontend/src/api/mock.js) | 30-customer in-memory backend, history, `SIMULATE_NETWORK_ERROR` |
| [`src/api/endpoints.js`](file:///e:/Projects/retail_frontend/src/api/endpoints.js) | Public API layer with TODO comments for real fetch |
| [`src/utils/format.js`](file:///e:/Projects/retail_frontend/src/utils/format.js) | `formatPercent`, `formatCurrency`, `formatDate`, `probabilityColor` |
| [`src/components/Sidebar.jsx`](file:///e:/Projects/retail_frontend/src/components/Sidebar.jsx) | Desktop sidebar + mobile hamburger |
| [`src/components/PageShell.jsx`](file:///e:/Projects/retail_frontend/src/components/PageShell.jsx) | Page wrapper + footer disclaimer |
| [`src/components/StatCard.jsx`](file:///e:/Projects/retail_frontend/src/components/StatCard.jsx) | KPI tile |
| [`src/components/ProbabilityGauge.jsx`](file:///e:/Projects/retail_frontend/src/components/ProbabilityGauge.jsx) | SVG circular gauge |
| [`src/components/ProbabilityBar.jsx`](file:///e:/Projects/retail_frontend/src/components/ProbabilityBar.jsx) | Slim colored progress bar |
| [`src/components/Badge.jsx`](file:///e:/Projects/retail_frontend/src/components/Badge.jsx) | Pill badge (green/amber/red/slate) |
| [`src/components/ResultCard.jsx`](file:///e:/Projects/retail_frontend/src/components/ResultCard.jsx) | Gauge + badge + RFM stats (reused on 2 pages) |
| [`src/components/DataTable.jsx`](file:///e:/Projects/retail_frontend/src/components/DataTable.jsx) | Generic responsive table with custom renderers |
| [`src/components/Skeleton.jsx`](file:///e:/Projects/retail_frontend/src/components/Skeleton.jsx) | `Skeleton`, `Spinner`, `LoadingOverlay` |
| [`src/components/ErrorState.jsx`](file:///e:/Projects/retail_frontend/src/components/ErrorState.jsx) | Network/API error with Retry button |
| [`src/components/EmptyState.jsx`](file:///e:/Projects/retail_frontend/src/components/EmptyState.jsx) | Empty list placeholder |
| [`src/pages/Dashboard.jsx`](file:///e:/Projects/retail_frontend/src/pages/Dashboard.jsx) | `/` — KPI cards, donut chart, at-risk table |
| [`src/pages/Customer.jsx`](file:///e:/Projects/retail_frontend/src/pages/Customer.jsx) | `/customer/:id` — lookup by ID |
| [`src/pages/Predict.jsx`](file:///e:/Projects/retail_frontend/src/pages/Predict.jsx) | `/predict` — what-if form |
| [`src/pages/History.jsx`](file:///e:/Projects/retail_frontend/src/pages/History.jsx) | `/history` — prediction log |
| [`.env.example`](file:///e:/Projects/retail_frontend/.env.example) | Env variable reference |
| [`.gitignore`](file:///e:/Projects/retail_frontend/.gitignore) | Excludes `node_modules/`, `dist/`, `.env` |
| [`README.md`](file:///e:/Projects/retail_frontend/README.md) | Full run guide, test IDs, backend connection docs |

---

## Assumptions Made

1. **Tailwind v4** was used (latest), not v3. The CSS-first configuration (`@import "tailwindcss"`) is used instead of a `tailwind.config.js` file.
2. **Probability formula**: The mock uses a logistic (sigmoid) function over normalised RFM signals. It is documented in `mock.js` so you can follow the math. It is not the same as the real ML model.
3. **30 mock customers** were generated (IDs 12346–12375) — the three contract-specified customers have exact values per the spec.
4. **ID `99999`** reliably returns a 404, as documented in the README.
5. **`lucide-react`** was added for icons (sidebar icons, error state icons, etc.) — it is tree-shaken so only used icons are bundled.
6. The build chunk warning (626 kB) is from Recharts and is normal — it is not an error. For production, code-splitting can be added later.
