from django.db import models


class Customer(models.Model):
    """One row per customer: their RFM numbers on the snapshot date."""

    customer_id = models.IntegerField(unique=True)
    recency = models.FloatField()
    frequency = models.IntegerField()
    monetary = models.FloatField()

    def __str__(self):
        return f"Customer {self.customer_id}"


class Prediction(models.Model):
    customer_id = models.IntegerField(
        null=True, blank=True
    )  # filled when predicted by ID
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
