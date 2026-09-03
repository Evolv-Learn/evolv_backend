import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from courses.models import Profile


class Command(BaseCommand):
    help = "Create or update an admin/instructor user from environment variables"

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-password-update",
            action="store_true",
            help="Do not update the user's password if the user already exists.",
        )

    def handle(self, *args, **options):
        username = os.getenv("ADMIN_USERNAME", "moshood").strip()
        email = os.getenv("ADMIN_EMAIL", "").strip().lower()
        password = os.getenv("ADMIN_PASSWORD", "")
        first_name = os.getenv("ADMIN_FIRST_NAME", "Moshood").strip()
        last_name = os.getenv("ADMIN_LAST_NAME", "Owolabi").strip()

        if not email:
            raise CommandError("ADMIN_EMAIL must be set.")

        User = get_user_model()

        with transaction.atomic():
            user = User.objects.filter(email__iexact=email).first()
            created = False

            if user is None:
                if not password:
                    raise CommandError("ADMIN_PASSWORD must be set when creating a new admin user.")
                user = User(username=username, email=email)
                created = True

            user.username = username or user.username
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.is_active = True
            user.is_staff = True
            user.is_superuser = True
            user.is_email_verified = True

            if password and (created or not options["no_password_update"]):
                user.set_password(password)

            user.save()
            Profile.objects.update_or_create(user=user, defaults={"role": "Instructor"})

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{action} admin/instructor user: {email}"))
        self.stdout.write("Profile role: Instructor")