"""
Management command: enforce_installment_deadlines

Runs daily (via cron or Azure scheduler) to:
  1. Suspend enrollments where the second installment deadline has passed
     and the balance has not been paid.
  2. Send Week 5 reminder emails to students whose deadline is approaching.

Usage:
    python manage.py enforce_installment_deadlines
    python manage.py enforce_installment_deadlines --dry-run

Schedule (recommended):
    Run daily at 00:30 WAT (23:30 UTC previous day) so it fires shortly
    after the 11:59 PM WAT cutoff.

Azure:
    Add to azure-pipelines.yml or configure as a WebJob / Azure Function.
"""

import logging
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings

from courses.models import InstallmentPlan, InstallmentPayment

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Enforce installment deadlines and send Week 5 reminders."

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help="Preview changes without saving anything to the database.",
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        now = timezone.now()

        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN — no changes will be saved.\n"))

        self._suspend_overdue_plans(now, dry_run)
        self._send_week5_reminders(now, dry_run)

    # ── Step 1: Suspend overdue plans ─────────────────────────────────────────

    def _suspend_overdue_plans(self, now, dry_run):
        """
        Find active plans where:
          - effective_deadline has passed
          - second installment is not paid

        Sets plan.status = 'defaulted' and enrollment.status = 'Suspended'.
        """
        active_plans = InstallmentPlan.objects.filter(
            status='active',
            second_installment_deadline__isnull=False,
        ).prefetch_related('installments').select_related(
            'enrollment__student__user',
            'enrollment__course',
        )

        suspended_count = 0

        for plan in active_plans:
            # Skip if within effective deadline (including approved grace period)
            effective = plan.effective_deadline
            if effective is None or now <= effective:
                continue

            # Check second installment is not paid
            second_paid = plan.installments.filter(
                installment_number=2, status='paid'
            ).exists()
            if second_paid:
                continue

            # This plan is overdue — suspend
            enrollment = plan.enrollment
            student_email = enrollment.student.user.email
            course_name = enrollment.course.name

            self.stdout.write(
                f"  Suspending: {enrollment.student.first_name} "
                f"{enrollment.student.last_name} — {course_name} "
                f"(plan {plan.id}, deadline {plan.second_installment_deadline})"
            )

            if not dry_run:
                with transaction.atomic():
                    plan.status = 'defaulted'
                    plan.save(update_fields=['status'])

                    enrollment.status = 'Suspended'
                    enrollment.save(update_fields=['status'])

                # Send removal notification email
                self._send_removal_email(
                    student_email=student_email,
                    first_name=enrollment.student.first_name,
                    course_name=course_name,
                )

            suspended_count += 1

        if suspended_count:
            self.stdout.write(
                self.style.ERROR(
                    f"\n{'[DRY RUN] Would suspend' if dry_run else 'Suspended'} "
                    f"{suspended_count} enrollment(s).\n"
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS("No overdue plans found.\n"))

    # ── Step 2: Send Week 5 reminders ─────────────────────────────────────────

    def _send_week5_reminders(self, now, dry_run):
        """
        Send a reminder email to students whose second installment deadline
        is within the next 7 days and no reminder has been sent yet.
        """
        reminder_window_end = now + timedelta(days=7)

        plans_to_remind = InstallmentPlan.objects.filter(
            status='active',
            second_installment_deadline__isnull=False,
            second_installment_deadline__lte=reminder_window_end,
            second_installment_deadline__gt=now,
            reminder_sent_at__isnull=True,
        ).select_related(
            'enrollment__student__user',
            'enrollment__course',
        ).prefetch_related('installments')

        reminded_count = 0
        failed_count = 0

        for plan in plans_to_remind:
            # Skip if second installment already paid
            second_paid = plan.installments.filter(
                installment_number=2, status='paid'
            ).exists()
            if second_paid:
                continue

            enrollment = plan.enrollment
            student_email = enrollment.student.user.email
            first_name = enrollment.student.first_name
            course_name = enrollment.course.name
            deadline = plan.second_installment_deadline

            self.stdout.write(
                f"  Reminding: {first_name} {enrollment.student.last_name} "
                f"— {course_name} (deadline {deadline})"
            )

            if not dry_run:
                sent = self._send_reminder_email(
                    student_email=student_email,
                    first_name=first_name,
                    course_name=course_name,
                    deadline=deadline,
                    amount=plan.second_installment_amount,
                    currency=plan.currency,
                    plan_id=plan.id,
                )
                if sent:
                    plan.reminder_sent_at = now
                    plan.save(update_fields=['reminder_sent_at'])
                    reminded_count += 1
                else:
                    failed_count += 1
            else:
                reminded_count += 1

        if reminded_count or failed_count:
            self.stdout.write(
                (
                    self.style.SUCCESS(
                        f"{'[DRY RUN] Would send' if dry_run else 'Sent'} "
                        f"{reminded_count} reminder(s)."
                    )
                    + (
                        f" Failed to send {failed_count}; those will be retried."
                        if failed_count else ""
                    )
                    + "\n"
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS("No reminders to send.\n"))

    # ── Email helpers ─────────────────────────────────────────────────────────

    def _send_reminder_email(self, student_email, first_name, course_name,
                              deadline, amount, currency, plan_id):
        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://evolvlearn.org')
        deadline_str = deadline.strftime('%A, %d %B %Y at 11:59 PM WAT')

        subject = f"Reminder: Your second payment for {course_name} is due soon"
        message = (
            f"Hi {first_name},\n\n"
            f"This is a reminder that your second installment payment for "
            f"{course_name} is due by {deadline_str}.\n\n"
            f"Amount due: {currency} {amount}\n\n"
            f"Please log in to complete your payment:\n"
            f"{frontend_url}/dashboard\n\n"
            f"If you experience a technical issue making payment, please contact us "
            f"at evolvngo@gmail.com before the deadline.\n\n"
            f"If payment is not received by the deadline, you will be removed from "
            f"the cohort before Week 7 and your access will end.\n\n"
            f"Best regards,\nThe EvolvLearn Team"
        )

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'evolvngo@gmail.com'),
                recipient_list=[student_email],
                fail_silently=False,
            )
            logger.info("Reminder email sent to %s for plan %s", student_email, plan_id)
            return True
        except Exception as exc:
            logger.error("Failed to send reminder to %s: %s", student_email, exc)
            return False

    def _send_removal_email(self, student_email, first_name, course_name):
        subject = f"Your access to {course_name} has ended"
        message = (
            f"Hi {first_name},\n\n"
            f"Unfortunately, your access to {course_name} has ended because the "
            f"second installment payment was not received by the deadline.\n\n"
            f"As per our payment policy, you have been removed from the cohort. "
            f"You cannot rejoin this cohort, but you are welcome to apply for a "
            f"future cohort.\n\n"
            f"If you believe this is an error or experienced a technical issue, "
            f"please contact us at evolvngo@gmail.com.\n\n"
            f"Best regards,\nThe EvolvLearn Team"
        )

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'evolvngo@gmail.com'),
                recipient_list=[student_email],
                fail_silently=False,
            )
            logger.info("Removal email sent to %s", student_email)
        except Exception as exc:
            logger.error("Failed to send removal email to %s: %s", student_email, exc)
