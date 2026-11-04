"""
In-process APScheduler configuration.
Only used if you are NOT using Render Cron Jobs.

To activate, call start() from apps.py AppConfig.ready().
"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django_apscheduler.jobstores import DjangoJobStore

logger = logging.getLogger(__name__)

_scheduler = None


def enforce_deadlines_job():
    """Wrapper so APScheduler can call the management command logic directly."""
    from django.core.management import call_command
    try:
        call_command('enforce_installment_deadlines')
    except Exception as exc:
        logger.error("enforce_installment_deadlines failed: %s", exc)


def start():
    global _scheduler
    if _scheduler and _scheduler.running:
        return

    _scheduler = BackgroundScheduler(timezone='Africa/Lagos')
    _scheduler.add_jobstore(DjangoJobStore(), 'default')

    # Run daily at 00:30 WAT (West Africa Time)
    _scheduler.add_job(
        enforce_deadlines_job,
        trigger=CronTrigger(hour=0, minute=30, timezone='Africa/Lagos'),
        id='enforce_installment_deadlines',
        name='Enforce installment deadlines and send reminders',
        replace_existing=True,
        jobstore='default',
    )

    _scheduler.start()
    logger.info("Scheduler started — enforce_installment_deadlines runs daily at 00:30 WAT")
