from functools import lru_cache
from pathlib import Path

import pandas as pd
from xgboost import XGBClassifier

MODEL_PATH = Path(__file__).resolve().parent / "ml" / "repeat_buyer_model.json"
FEATURES = ["recency", "frequency", "monetary"]  # SAME order as training


@lru_cache(maxsize=1)
def get_model():
    """Load the model from disk the first time, then reuse it."""
    model = XGBClassifier()
    model.load_model(MODEL_PATH)
    return model


def predict_probability(recency, frequency, monetary):
    X = pd.DataFrame([[recency, frequency, monetary]], columns=FEATURES)
    return float(get_model().predict_proba(X)[0][1])
