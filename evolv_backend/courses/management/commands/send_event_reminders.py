from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from courses.models import Event
from courses.utils import send_event_reminders


class Command(BaseCommand):
    help = "Send meeting-link reminder emails to event registrants who have not been reminded"

    def add_arguments(self, parser):
        parser.add_argument(
            "--event-id",
            type=int,
            help="Send reminders for one event instead of events happening in two days",
        )
        parser.add_argument(
            "--resend-all",
            action="store_true",
            help="Also resend reminders to registrants who were already emailed",
        )

    def handle(self, *args, **options):
        if options["event_id"]:
            events = Event.objects.filter(pk=options["event_id"])
            if not events.exists():
                raise CommandError(f"Event not found: {options['event_id']}")
        else:
            target_date = timezone.localdate() + timedelta(days=2)
            events = Event.objects.filter(date__date=target_date)

        if not events.exists():
            self.stdout.write("No matching events found.")
            return

        totals = {"sent": 0, "failed": 0}
        for event in events:
            try:
                result = send_event_reminders(
                    event,
                    resend_all=options["resend_all"],
                )
            except ValueError as exc:
                raise CommandError(f"{event.title}: {exc}") from exc

            totals["sent"] += result["sent"]
            totals["failed"] += result["failed"]
            self.stdout.write(
                f"{event.title}: sent {result['sent']}, failed {result['failed']}, "
                f"already sent {result['already_sent']}."
            )

        if totals["failed"]:
            raise CommandError(
                f"Reminder sending completed with {totals['failed']} failure(s); "
                f"{totals['sent']} email(s) sent."
            )

        self.stdout.write(
            self.style.SUCCESS(f"Sent {totals['sent']} event reminder email(s).")
        )