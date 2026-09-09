from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from courses.models import EventRegistration
from courses.utils import send_event_reminder_email


class Command(BaseCommand):
    help = "Send meeting-link reminder emails for events happening in two days"

    def handle(self, *args, **options):
        target_date = timezone.localdate() + timedelta(days=2)
        registrations = EventRegistration.objects.select_related("event").filter(
            reminder_sent_at__isnull=True,
            event__date__date=target_date,
        )

        sent_count = 0
        with transaction.atomic():
            for registration in registrations:
                if send_event_reminder_email(registration):
                    registration.reminder_sent_at = timezone.now()
                    registration.save(update_fields=["reminder_sent_at"])
                    sent_count += 1

        self.stdout.write(self.style.SUCCESS(f"Sent {sent_count} event reminder email(s)."))