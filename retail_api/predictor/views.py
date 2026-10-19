import pandas as pd
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .ml_model import predict_many, predict_probability
from .models import Customer, Prediction
from .serializers import PredictInputSerializer, PredictionSerializer


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


@api_view(["POST"])
def predict(request):
    serializer = PredictInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)  # returns 400 automatically if invalid
    d = serializer.validated_data

    prob = predict_probability(d["recency"], d["frequency"], d["monetary"])
    will_return = prob >= settings.PREDICTION_THRESHOLD

    saved = Prediction.objects.create(
        recency=d["recency"],
        frequency=d["frequency"],
        monetary=d["monetary"],
        probability=prob,
        will_return=will_return,
    )
    return Response(PredictionSerializer(saved).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def history(request):
    qs = Prediction.objects.all()[:50]  # latest 50
    return Response(PredictionSerializer(qs, many=True).data)


@api_view(["POST"])
def predict_customer(request, customer_id):
    customer = get_object_or_404(Customer, customer_id=customer_id)  # 404 if unknown ID

    prob = predict_probability(customer.recency, customer.frequency, customer.monetary)
    will_return = prob >= settings.PREDICTION_THRESHOLD

    saved = Prediction.objects.create(
        customer_id=customer.customer_id,
        recency=customer.recency,
        frequency=customer.frequency,
        monetary=customer.monetary,
        probability=prob,
        will_return=will_return,
    )
    return Response(PredictionSerializer(saved).data, status=status.HTTP_201_CREATED)


def scored_customers():
    """All customers from the database with a 'probability' column added."""
    df = pd.DataFrame(
        list(Customer.objects.values("customer_id", "recency", "frequency", "monetary"))
    )
    if not df.empty:
        df["probability"] = predict_many(df).astype("float64")
    return df


@api_view(["GET"])
def dashboard_summary(request):
    df = scored_customers()
    if df.empty:
        return Response(
            {
                "detail": "No customers loaded. Run: python manage.py load_customers <csv>"
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    threshold = settings.PREDICTION_THRESHOLD
    likely = int((df["probability"] >= threshold).sum())
    return Response(
        {
            "total_customers": len(df),
            "likely_to_return": likely,
            "likely_to_leave": len(df) - likely,
            "avg_probability": round(float(df["probability"].mean()), 4),
            "risk_groups": {
                "high_chance": int((df["probability"] >= 0.7).sum()),
                "medium_chance": int(
                    ((df["probability"] >= 0.4) & (df["probability"] < 0.7)).sum()
                ),
                "low_chance": int((df["probability"] < 0.4).sum()),
            },
            "predictions_saved": Prediction.objects.count(),
            "threshold": threshold,
        }
    )


@api_view(["GET"])
def dashboard_at_risk(request):
    """Big spenders who are unlikely to return: the people worth contacting first."""
    try:
        limit = min(int(request.query_params.get("limit", 20)), 100)
    except ValueError:
        return Response(
            {"limit": ["Must be a whole number."]}, status=status.HTTP_400_BAD_REQUEST
        )

    df = scored_customers()
    if df.empty:
        return Response([])

    at_risk = (
        df[df["probability"] < settings.PREDICTION_THRESHOLD]
        .sort_values("monetary", ascending=False)
        .head(limit)
    )
    return Response(at_risk.round(4).to_dict(orient="records"))
