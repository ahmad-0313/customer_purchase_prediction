from django.shortcuts import render

# Create your views here.
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .ml_model import predict_probability
from .models import Prediction
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
