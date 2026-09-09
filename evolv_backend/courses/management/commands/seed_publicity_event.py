import os
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_time

from courses.models import Course, Event


DEFAULT_COURSE_NAME = "R for Quantitative Research - November 2026 Cohort"
DEFAULT_TITLE = "Free 2-Day R for Quantitative Research Preview Workshop"
DEFAULT_START_DATE = date(2026, 9, 26)
DEFAULT_START_TIME = time(18, 0)
DEFAULT_DURATION_HOURS = 3


class Command(BaseCommand):
    help = "Seed the two-day publicity event for the open R course cohort"

    def add_arguments(self, parser):
        parser.add_argument("--course-name", default=os.getenv("EVENT_COURSE_NAME", DEFAULT_COURSE_NAME))
        parser.add_argument("--title", default=os.getenv("EVENT_TITLE", DEFAULT_TITLE))
        parser.add_argument("--start-date", default=os.getenv("EVENT_START_DATE", DEFAULT_START_DATE.isoformat()))
        parser.add_argument("--start-time", default=os.getenv("EVENT_START_TIME", DEFAULT_START_TIME.strftime("%H:%M")))
        parser.add_argument("--duration-hours", type=int, default=int(os.getenv("EVENT_DURATION_HOURS", DEFAULT_DURATION_HOURS)))
        parser.add_argument("--timezone", default=os.getenv("EVENT_TIMEZONE", "Africa/Lagos"))
        parser.add_argument("--meeting-link", default=os.getenv("EVENT_MEETING_LINK", ""))

    def handle(self, *args, **options):
        course_name = options["course_name"]
        title = options["title"]
        duration_hours = options["duration_hours"]
        meeting_link = options["meeting_link"].strip() or None

        start_date = parse_date(options["start_date"])
        start_time = parse_time(options["start_time"])
        if not start_date:
            raise CommandError("EVENT_START_DATE must use YYYY-MM-DD format.")
        if not start_time:
            raise CommandError("EVENT_START_TIME must use HH:MM format, for example 18:00.")
        if duration_hours <= 0:
            raise CommandError("EVENT_DURATION_HOURS must be greater than zero.")

        try:
            event_tz = ZoneInfo(options["timezone"])
        except Exception as exc:
            raise CommandError(f"Invalid EVENT_TIMEZONE: {options['timezone']}") from exc

        try:
            course = Course.objects.get(name=course_name)
        except Course.DoesNotExist as exc:
            raise CommandError(f"Course not found: {course_name}") from exc

        description = (
            "A free two-day public introduction to EvolvLearn and the programmes we offer for researchers, "
            "students, and professionals. This workshop spotlights our open R for Quantitative Research cohort, "
            "walks participants through the course syllabus, and shows how the programme supports data analysis, "
            "statistics, visualisation, and reproducible research. Each session runs for three hours, with guidance "
            "on how to register and access the current course package."
        )

        with transaction.atomic():
            for day_offset in range(2):
                session_date = start_date + timedelta(days=day_offset)
                starts_at = timezone.make_aware(datetime.combine(session_date, start_time), event_tz)
                ends_at = starts_at + timedelta(hours=duration_hours)
                day_title = f"{title} - Day {day_offset + 1}"

                event, created = Event.objects.update_or_create(
                    title=day_title,
                    defaults={
                        "description": f"{description}\n\nSession time: {starts_at.strftime('%H:%M')} - {ends_at.strftime('%H:%M')} {options['timezone']}.",
                        "date": starts_at,
                        "meeting_link": meeting_link,
                        "course": course,
                        "is_virtual": True,
                        "location": None,
                    },
                )
                action = "Created" if created else "Updated"
                self.stdout.write(self.style.SUCCESS(f"{action}: {event.title} at {event.date}"))

        self.stdout.write(self.style.SUCCESS("Done. Publicity event is ready."))