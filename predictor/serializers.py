from rest_framework import serializers

from .models import Prediction


class PredictInputSerializer(serializers.Serializer):
    recency = serializers.FloatField(min_value=0)  # days since last purchase
    frequency = serializers.IntegerField(min_value=1)  # number of orders
    monetary = serializers.FloatField(min_value=0)  # total spent


class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = [
            "id",
            "recency",
            "frequency",
            "monetary",
            "probability",
            "will_return",
            "created_at",
        ]
