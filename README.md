# Customer Return Predictor

Predict which customers of an online shop will buy again in the next 90 days, and show the results in a dashboard.

A machine learning model (XGBoost) scores every customer from three simple numbers. A Django REST API serves the predictions, and a React dashboard lets a shop owner see the big picture, find valuable customers who are unlikely to return, and check any single customer.

![Dashboard](docs/dashboard.png)

## What it does

- **Dashboard:** totals, how many customers are likely to return, a risk-group chart, and a table of big spenders who are unlikely to come back (so they can be contacted first).
- **Customer lookup:** enter a customer ID and get their chance of returning.
- **What-if prediction:** type any recency, frequency and monetary values and see the result.
- **History:** every prediction is saved and listed.

## Project structure

```
.
├── retail_api/          Django REST API + trained model
│   ├── config/          project settings and main URLs
│   ├── predictor/       app: models, serializers, views, ML loading
│   │   ├── ml/          saved XGBoost model (JSON)
│   │   └── data/        customer snapshot (RFM per customer)
│   └── notebooks/       the full ML work (cleaning, features, validation, tuning)
└── retail_frontend/     React + Vite + Tailwind dashboard
```

## The machine learning part

**Data:** [Online Retail II](https://archive.ics.uci.edu/dataset/502/online+retail+ii) (UCI), about 1M transactions from a UK online retailer, Dec 2009 to Dec 2011. The data is not included in this repo (download it and place the CSVs next to the notebook).

**Question:** will a customer who has bought before buy again within the next 90 days?

**Method**
1. Clean the transactions (returns/cancellations set aside, missing customer IDs, invalid prices and quantities, duplicates).
2. Build one table per **cut-off date**: features use only purchases *before* the cut-off, and the target (bought again: yes or no) comes from the following 90 days. This avoids data leakage.
3. Features: **recency** (days since last purchase), **frequency** (number of orders), **monetary** (total spent).
4. Train on 5 cut-offs (Jun 2010 to Jun 2011), test on a later one (Sep 2011). The split is by **time**, never random.
5. Compare against baselines, then tune XGBoost with time-based validation (each fold trains on earlier cut-offs and validates on the next).

**Results** (test period, never seen during training or tuning)

| Model | ROC-AUC |
|---|---|
| Dummy (class ratio) | 0.50 |
| Logistic regression | [0.789] |
| **XGBoost** (depth 3, learning rate 0.03, 200 trees) | **[0.794]** |

At the default threshold of 0.5: precision **0.775** and recall **0.477** for the "will return" class. Lowering the threshold catches more returners at the cost of more wasted offers.

A simple model gets almost all of the way there, which shows that RFM features carry most of the signal. In my experiments, extra features (average order value, customer age, unique products, country) did not help, except the average gap between orders, which added about 0.01 AUC.

The deployed model is retrained on all cut-offs, including the test period. The scores above come from the model before that final retrain.

## API

Base URL: `http://127.0.0.1:8000/api` (all paths end with a `/`).

| Method | Path | Description |
|---|---|---|
| GET | `/health/` | server check |
| POST | `/predict/` | body: `recency`, `frequency`, `monetary` |
| POST | `/customers/<id>/predict/` | predict for a customer in the database |
| GET | `/predictions/` | latest 50 saved predictions |
| GET | `/dashboard/summary/` | totals and risk groups |
| GET | `/dashboard/at-risk/?limit=20` | valuable customers unlikely to return |

Customer numbers are a snapshot taken on **10 Dec 2011**, the day after the data ends, so predictions mean "the next 90 days from that date".

## Run it locally

**Backend** (Windows PowerShell)
```powershell
cd retail_api
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py load_customers predictor/data/customers_snapshot.csv
python manage.py runserver
```

**Frontend** (second terminal)
```powershell
cd retail_frontend
npm install
npm run dev
```

Open `http://localhost:5173` (use `localhost`, not `127.0.0.1`, because the API only allows that origin through CORS).

## Limitations

- Only three features, from one retailer, so results may not transfer to other shops.
- Test AUC is about 0.79: good for ranking who to contact first, not a guarantee for any single customer.
- The return rate changes a lot with the season (31% to 57% across cut-offs), and the model has seen only two years of data.
- Returns and cancellations are not used as features yet.
- The customer snapshot is static. A real deployment would refresh it regularly.
- Development setup only: SQLite, Django dev server, no login.

## Tech

Python, pandas, XGBoost, scikit-learn, Django, Django REST Framework, React, Vite, Tailwind CSS, Recharts.
