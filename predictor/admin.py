from django.contrib import admin

from .models import Customer, Prediction

admin.site.register(Customer)
admin.site.register(Prediction)
