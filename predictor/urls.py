from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health),
    path("predict/", views.predict),
    path("predictions/", views.history),
    path("customers/<int:customer_id>/predict/", views.predict_customer),
    path("dashboard/summary/", views.dashboard_summary),
    path("dashboard/at-risk/", views.dashboard_at_risk),
]
