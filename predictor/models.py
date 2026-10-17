from django.db import models

# Create your models here.
from django.db import models


class Prediction(models.Model):
    recency = models.FloatField()
    frequency = models.FloatField()
    monetary = models.FloatField()
    probability = models.FloatField()
    will_return = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.probability:.2f} at {self.created_at:%Y-%m-%d %H:%M}"
