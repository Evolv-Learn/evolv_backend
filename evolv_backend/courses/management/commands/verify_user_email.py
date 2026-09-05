import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction


class Command(BaseCommand):
    help = "Mark a user email as verified by email address"

    def add_arguments(self, parser):
        parser.add_argument(
            "email",
            nargs="?",
            help="Email address to verify. Defaults to VERIFY_USER_EMAIL environment variable.",
        )

    def handle(self, *args, **options):
        email = (options.get("email") or os.getenv("VERIFY_USER_EMAIL", "")).strip().lower()
        if not email:
            raise CommandError("Provide an email argument or set VERIFY_USER_EMAIL.")

        User = get_user_model()

        with transaction.atomic():
            user = User.objects.filter(email__iexact=email).first()
            if user is None:
                raise CommandError(f"No user found with email: {email}")

            user.is_email_verified = True
            user.email_verification_token = None
            user.email_verification_sent_at = None
            user.save(update_fields=["is_email_verified", "email_verification_token", "email_verification_sent_at"])

        self.stdout.write(self.style.SUCCESS(f"Verified user email: {email}"))