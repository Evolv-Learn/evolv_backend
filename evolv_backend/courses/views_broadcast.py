"""
Broadcast email views — admin only.

Endpoints:
  GET  /admin/broadcast/preview/   — preview recipients and deduplicated list
  POST /admin/broadcast/send/      — send the broadcast email
"""
import logging
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from .models import EventRegistration
from .utils import send_transactional_email

logger = logging.getLogger(__name__)
User = get_user_model()


def _build_recipient_list():
    """
    Merge registered users and event registrants.
    Deduplicate by email (case-insensitive).
    Returns a list of dicts: {email, full_name}
    """
    recipients = {}  # keyed by lowercase email

    # 1. Registered users
    users = User.objects.filter(
        is_active=True
    ).values('email', 'first_name', 'last_name')

    for u in users:
        email = u['email'].strip().lower()
        if not email:
            continue
        full_name = f"{u['first_name']} {u['last_name']}".strip() or email
        recipients[email] = {'email': u['email'], 'full_name': full_name}

    # 2. Event registrants — only add if not already in registered users
    registrants = EventRegistration.objects.values('email', 'full_name')
    for r in registrants:
        email = r['email'].strip().lower()
        if not email:
            continue
        if email not in recipients:
            full_name = r['full_name'].strip() or email
            recipients[email] = {'email': r['email'], 'full_name': full_name}

    return list(recipients.values())


class BroadcastPreviewView(APIView):
    """
    GET /admin/broadcast/preview/
    Returns the deduplicated recipient list so admin can review before sending.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        recipients = _build_recipient_list()
        return Response({
            'total': len(recipients),
            'recipients': recipients,
        })


class BroadcastSendView(APIView):
    """
    POST /admin/broadcast/send/
    Body: {
        "subject": "...",
        "message": "...",   plain text with {full_name} placeholder
        "preview_only": false
    }

    Sends one personalised email per recipient.
    Uses {full_name} in the message body as a placeholder.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        subject = (request.data.get('subject') or '').strip()
        message = (request.data.get('message') or '').strip()
        preview_only = request.data.get('preview_only', False)

        if not subject:
            return Response(
                {'detail': 'subject is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not message:
            return Response(
                {'detail': 'message is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        recipients = _build_recipient_list()

        if preview_only:
            return Response({
                'total': len(recipients),
                'recipients': recipients,
                'subject': subject,
                'message_preview': message.replace('{full_name}', recipients[0]['full_name'] if recipients else 'John Doe'),
            })

        sent = 0
        failed = 0

        for recipient in recipients:
            personalised_message = message.replace('{full_name}', recipient['full_name'])
            try:
                success = send_transactional_email(
                    subject=subject,
                    text_message=personalised_message,
                    recipient_list=[recipient['email']],
                    fail_silently=False,
                )
                if success:
                    sent += 1
                else:
                    failed += 1
            except Exception as exc:
                logger.error(
                    'Broadcast failed for %s: %s',
                    recipient['email'], exc
                )
                failed += 1

        logger.info(
            'Broadcast "%s" completed: %d sent, %d failed, %d total',
            subject, sent, failed, len(recipients)
        )

        return Response({
            'total': len(recipients),
            'sent': sent,
            'failed': failed,
        })
