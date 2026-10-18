import csv

from django.core.management.base import BaseCommand

from predictor.models import Customer


class Command(BaseCommand):
    help = "Load the customer RFM snapshot from a CSV file"

    def add_arguments(self, parser):
        parser.add_argument("csv_path")

    def handle(self, *args, **options):
        with open(options["csv_path"], newline="", encoding="utf-8") as f:
            rows = [
                Customer(
                    customer_id=int(float(r["CustomerID"])),
                    recency=float(r["recency"]),
                    frequency=int(float(r["frequency"])),
                    monetary=float(r["monetary"]),
                )
                for r in csv.DictReader(f)
            ]
        Customer.objects.all().delete()
        Customer.objects.bulk_create(rows, batch_size=1000)
        self.stdout.write(self.style.SUCCESS(f"Loaded {len(rows)} customers"))
