"""
Payment views — processor-agnostic scaffold.

Endpoints:
  GET  /pricing/                          — all courses with active prices (public)
  GET  /courses/<course_id>/prices/       — prices for one course (public)
  POST /payments/initiate/                — create a pending Payment (authenticated)
  GET  /payments/<pk>/                    — check payment status (authenticated, own only)
  POST /payments/webhook/?processor=<x>  — webhook called by payment processor (no auth)

Wire a real processor by:
  1. Setting Payment.processor on the initiation response.
  2. Implementing signature verification in PaymentWebhookView.
  3. Using the processor SDK to build a checkout URL and returning it from InitiatePaymentView.
"""

import hmac
import hashlib
import logging
import time as _time

import requests as http_requests

from django.db import models as django_models
from django.utils import timezone
from django.conf import settings
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response

from .models import Course, CoursePrice, CourseEnrollment, Payment, DiscountCode
from .serializers import (
    CoursePriceSerializer,
    CourseWithPricesSerializer,
    PaymentSerializer,
    DiscountCodeSerializer,
)

logger = logging.getLogger(__name__)


# ── Public: all courses with their prices (pricing page) ─────────────────────

class PublicPricingListView(generics.ListAPIView):
    """
    GET /pricing/
    Returns all courses that have at least one active price.
    Used to render the public /pricing page.
    """
    serializer_class = CourseWithPricesSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Course.objects
            .filter(prices__is_active=True)
            .prefetch_related('prices')
            .select_related('instructor')
            .distinct()
            .order_by('name')
        )


# ── Public: prices for a single course ───────────────────────────────────────

class CoursePriceListView(generics.ListAPIView):
    """
    GET /courses/<course_id>/prices/
    Returns active prices for a specific course.
    """
    serializer_class = CoursePriceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return CoursePrice.objects.filter(
            course_id=self.kwargs['course_id'],
            is_active=True,
        )


# ── Admin: manage prices ──────────────────────────────────────────────────────

class CoursePriceAdminView(generics.ListCreateAPIView):
    """
    GET/POST /admin/prices/
    Admin can list or create prices.
    """
    serializer_class = CoursePriceSerializer
    permission_classes = [IsAdminUser]
    queryset = CoursePrice.objects.select_related('course').order_by('course__name', 'currency')


class CoursePriceAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /admin/prices/<pk>/
    """
    serializer_class = CoursePriceSerializer
    permission_classes = [IsAdminUser]
    queryset = CoursePrice.objects.all()


# ── Admin: manage discount codes ─────────────────────────────────────────────

class DiscountCodeAdminListCreateView(generics.ListCreateAPIView):
    """
    GET  /admin/discount-codes/  — list all codes
    POST /admin/discount-codes/  — create a new code
    """
    serializer_class = DiscountCodeSerializer
    permission_classes = [IsAdminUser]
    queryset = DiscountCode.objects.prefetch_related('courses').order_by('-created_at')


class DiscountCodeAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /admin/discount-codes/<pk>/
    """
    serializer_class = DiscountCodeSerializer
    permission_classes = [IsAdminUser]
    queryset = DiscountCode.objects.prefetch_related('courses')
    http_method_names = ['get', 'patch', 'delete', 'options', 'head']


# ── Authenticated: initiate a payment ────────────────────────────────────────
class ValidateDiscountView(APIView):
    """
    POST /payments/validate-discount/
    Body: { "enrollment_id": <int>, "currency": "USD", "code": "SUMMER25" }

    Validates a discount code and returns the breakdown without committing anything.
    Safe to call repeatedly as the user types.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        enrollment_id = request.data.get('enrollment_id')
        currency = request.data.get('currency', 'USD').upper()
        code = (request.data.get('code') or '').strip().upper()

        if not enrollment_id or not code:
            return Response(
                {'detail': 'enrollment_id and code are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            enrollment = (
                CourseEnrollment.objects
                .select_related('course', 'student__user')
                .get(id=enrollment_id, student__user=request.user)
            )
        except CourseEnrollment.DoesNotExist:
            return Response({'detail': 'Enrollment not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            discount = DiscountCode.objects.prefetch_related('courses').get(code=code)
        except DiscountCode.DoesNotExist:
            return Response({'valid': False, 'detail': 'Invalid discount code.'}, status=status.HTTP_200_OK)

        ok, error = discount.is_valid_for(course=enrollment.course)
        if not ok:
            return Response({'valid': False, 'detail': error}, status=status.HTTP_200_OK)

        # Resolve base price
        price = (
            CoursePrice.objects
            .filter(course=enrollment.course, currency=currency, is_active=True)
            .first()
        )
        if not price:
            price = (
                CoursePrice.objects
                .filter(course=enrollment.course, currency='USD', is_active=True)
                .first()
            )
            if not price:
                return Response(
                    {'detail': 'No pricing configured for this course yet.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            currency = 'USD'

        from decimal import Decimal
        original = price.amount
        discount_amount, final = discount.calculate_discount(original)

        return Response({
            'valid': True,
            'code': discount.code,
            'discount_label': f"{discount.discount_value}% off" if discount.discount_type == 'percentage' else f"{currency} {discount.discount_value} off",
            'currency': currency,
            'original_amount': str(original),
            'discount_amount': str(discount_amount),
            'final_amount': str(final),
        })

class InitiatePaymentView(APIView):
    """
    POST /payments/initiate/
    Body: { "enrollment_id": <int>, "currency": "USD", "discount_code": "SUMMER25" (optional) }

    Creates (or returns existing pending) Payment record.
    Returns the Payment object — the frontend uses the id to poll status
    and can redirect to a processor checkout URL once one is configured.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        enrollment_id = request.data.get('enrollment_id')
        currency = request.data.get('currency', 'USD').upper()
        code_str = (request.data.get('discount_code') or '').strip().upper()

        if not enrollment_id:
            return Response({'detail': 'enrollment_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify the enrollment belongs to this user
        try:
            enrollment = (
                CourseEnrollment.objects
                .select_related('course', 'student__user')
                .get(id=enrollment_id, student__user=request.user)
            )
        except CourseEnrollment.DoesNotExist:
            return Response({'detail': 'Enrollment not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Don't create a new payment if one is already paid
        if hasattr(enrollment, 'payment') and enrollment.payment.status == 'paid':
            return Response(
                PaymentSerializer(enrollment.payment).data,
                status=status.HTTP_200_OK,
            )

        # Resolve price — fall back to USD if requested currency unavailable
        price = (
            CoursePrice.objects
            .filter(course=enrollment.course, currency=currency, is_active=True)
            .first()
        )
        if not price:
            price = (
                CoursePrice.objects
                .filter(course=enrollment.course, currency='USD', is_active=True)
                .first()
            )
            if not price:
                return Response(
                    {'detail': 'No pricing configured for this course yet.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            currency = 'USD'

        original_amount = price.amount
        discount_obj = None
        discount_amount = 0
        final_amount = original_amount

        # Apply discount code if provided
        if code_str:
            try:
                discount_obj = DiscountCode.objects.prefetch_related('courses').get(code=code_str)
                ok, error = discount_obj.is_valid_for(course=enrollment.course)
                if not ok:
                    return Response({'detail': error}, status=status.HTTP_400_BAD_REQUEST)
                discount_amount, final_amount = discount_obj.calculate_discount(original_amount)
            except DiscountCode.DoesNotExist:
                return Response({'detail': 'Invalid discount code.'}, status=status.HTTP_400_BAD_REQUEST)

        from django.db import transaction
        with transaction.atomic():
            payment, created = Payment.objects.get_or_create(
                enrollment=enrollment,
                defaults={
                    'original_amount': original_amount,
                    'discount_code': discount_obj,
                    'discount_amount': discount_amount,
                    'amount': final_amount,
                    'currency': currency,
                    'status': 'pending',
                },
            )
            # Increment uses_count atomically only on first creation
            if created and discount_obj:
                DiscountCode.objects.filter(pk=discount_obj.pk).update(
                    uses_count=django_models.F('uses_count') + 1
                )

        if payment.status == 'paid':
            return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)

        # ── Paystack: initialise transaction ─────────────────────────────────
        paystack_secret = getattr(settings, 'PAYSTACK_SECRET_KEY', '')
        if not paystack_secret:
            # No processor configured — return pending payment (useful for local dev)
            return Response(
                PaymentSerializer(payment).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )

        reference = f"EVOLV-{payment.id}-{int(_time.time())}"
        # Paystack expects amounts in the smallest currency unit (kobo for NGN, cents for USD/GBP/EUR, etc.)
        amount_minor = int(payment.amount * 100)
        callback_url = f"{settings.FRONTEND_URL}/payment/callback"

        try:
            ps_resp = http_requests.post(
                'https://api.paystack.co/transaction/initialize',
                headers={
                    'Authorization': f'Bearer {paystack_secret}',
                    'Content-Type': 'application/json',
                },
                json={
                    'email': enrollment.student.user.email,
                    'amount': amount_minor,
                    'reference': reference,
                    'currency': currency,
                    'callback_url': callback_url,
                    'metadata': {
                        'payment_id': payment.id,
                        'course_name': enrollment.course.name,
                    },
                },
                timeout=15,
            )
        except http_requests.RequestException as exc:
            logger.error("Paystack API request failed: %s", exc)
            return Response(
                {'detail': 'Payment processor unavailable. Please try again.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not ps_resp.ok:
            logger.error("Paystack initialize failed: %s %s", ps_resp.status_code, ps_resp.text)
            return Response(
                {'detail': 'Could not create payment session. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        ps_data = ps_resp.json()
        if not ps_data.get('status'):
            return Response(
                {'detail': ps_data.get('message', 'Payment initialization failed.')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Persist the reference so the webhook can match it back
        payment.processor_reference = reference
        payment.processor = 'paystack'
        payment.save(update_fields=['processor_reference', 'processor'])

        response_data = PaymentSerializer(payment).data
        response_data['authorization_url'] = ps_data['data']['authorization_url']
        return Response(
            response_data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


# ── Authenticated: check own payment status ───────────────────────────────────

class PaymentStatusView(generics.RetrieveAPIView):
    """
    GET /payments/<pk>/
    Returns the payment if it belongs to the requesting user.
    """
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(
            enrollment__student__user=self.request.user
        ).select_related('enrollment__course')


# ── Webhook: receive payment confirmation from processor ─────────────────────

class PaymentWebhookView(APIView):
    """
    POST /payments/webhook/?processor=<stripe|paystack|flutterwave>

    Processor-agnostic stub. Wire a real processor by:
      • Verifying the request signature (see _verify_signature).
      • Mapping the processor's event payload to our canonical fields.

    Expected body (normalised across processors):
      {
        "reference": "<processor_reference>",
        "event":     "charge.success" | "charge.failed" | ...,
        ... (raw processor payload stored in metadata)
      }
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        processor = request.query_params.get('processor', 'manual')
        raw_body = request.body  # needed for signature verification

        if not self._verify_signature(processor, request, raw_body):
            logger.warning("Webhook signature verification failed for processor=%s", processor)
            return Response({'detail': 'Invalid signature.'}, status=status.HTTP_400_BAD_REQUEST)

        # Normalise reference and event across processors
        reference = (
            request.data.get('reference')
            or request.data.get('id')
            or (request.data.get('data') or {}).get('reference')
        )
        event = (
            request.data.get('event')
            or request.data.get('type', '')
        )

        if not reference:
            return Response({'detail': 'No payment reference found.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.select_related('enrollment').get(
                processor_reference=reference
            )
        except Payment.DoesNotExist:
            # Unknown reference — acknowledge to prevent processor retries
            logger.info("Webhook received for unknown reference=%s processor=%s", reference, processor)
            return Response({'received': True})

        event_lower = event.lower()
        if any(kw in event_lower for kw in ('success', 'charge.succeeded', 'payment_intent.succeeded')):
            payment.status = 'paid'
            payment.paid_at = timezone.now()
            payment.processor = processor
            payment.metadata = request.data
            payment.save()
            # Move enrollment to Under Review — admin reviews only paid applicants
            payment.enrollment.status = 'Under Review'
            payment.enrollment.save()
            logger.info("Payment %s marked as paid via %s", payment.id, processor)
        elif any(kw in event_lower for kw in ('fail', 'declined', 'payment_intent.payment_failed')):
            payment.status = 'failed'
            payment.processor = processor
            payment.metadata = request.data
            payment.save()
            logger.info("Payment %s marked as failed via %s", payment.id, processor)
        elif any(kw in event_lower for kw in ('refund',)):
            payment.status = 'refunded'
            payment.processor = processor
            payment.metadata = request.data
            payment.save()
            logger.info("Payment %s marked as refunded via %s", payment.id, processor)

        return Response({'received': True})

    # ── Signature verification (stub — implement per-processor) ──────────────

    def _verify_signature(self, processor: str, request, raw_body: bytes) -> bool:
        """
        Return True if the request is genuinely from the named processor.

        Implement per-processor verification here.  Until a processor is
        configured the webhook is open (returns True).  Set the relevant
        secret in Django settings and uncomment the appropriate block.
        """

        # ── Paystack ──────────────────────────────────────────────────────────
        secret = getattr(settings, 'PAYSTACK_SECRET_KEY', None)
        if processor == 'paystack' and secret:
            sig = request.headers.get('x-paystack-signature', '')
            expected = hmac.new(secret.encode(), raw_body, hashlib.sha512).hexdigest()
            return hmac.compare_digest(sig, expected)

        # ── Stripe ────────────────────────────────────────────────────────────
        # import stripe
        # secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)
        # if processor == 'stripe' and secret:
        #     sig = request.headers.get('stripe-signature', '')
        #     try:
        #         stripe.Webhook.construct_event(raw_body, sig, secret)
        #         return True
        #     except stripe.error.SignatureVerificationError:
        #         return False

        # ── Flutterwave ───────────────────────────────────────────────────────
        # secret = getattr(settings, 'FLUTTERWAVE_SECRET_HASH', None)
        # if processor == 'flutterwave' and secret:
        #     sig = request.headers.get('verif-hash', '')
        #     return hmac.compare_digest(sig, secret)

        # No processor configured — allow through (remove before going live)
        return True


# ── Authenticated: verify payment directly with Paystack ─────────────────────

class VerifyPaymentView(APIView):
    """
    POST /payments/verify/
    Body: { "reference": "<paystack_reference>" }

    Called from the frontend callback page after Paystack redirect.
    Verifies the transaction with Paystack API directly (no webhook needed).
    Marks the payment as paid and enrollment as Under Review if successful.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        reference = (request.data.get('reference') or '').strip()
        if not reference:
            return Response({'detail': 'reference is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Look up payment by reference
        try:
            payment = Payment.objects.select_related(
                'enrollment__student__user', 'enrollment__course'
            ).get(processor_reference=reference)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Security: ensure the payment belongs to the requesting user
        if payment.enrollment.student.user != request.user:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Already paid — return current state
        if payment.status == 'paid':
            return Response(PaymentSerializer(payment).data)

        # Verify with Paystack
        paystack_secret = getattr(settings, 'PAYSTACK_SECRET_KEY', '')
        if not paystack_secret:
            return Response({'detail': 'Payment processor not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            ps_resp = http_requests.get(
                f'https://api.paystack.co/transaction/verify/{reference}',
                headers={'Authorization': f'Bearer {paystack_secret}'},
                timeout=10,
            )
        except http_requests.RequestException as exc:
            logger.error('Paystack verify request failed: %s', exc)
            return Response({'detail': 'Could not reach payment processor.'}, status=status.HTTP_502_BAD_GATEWAY)

        if not ps_resp.ok:
            return Response({'detail': 'Verification failed.'}, status=status.HTTP_502_BAD_GATEWAY)

        ps_data = ps_resp.json().get('data', {})
        ps_status = ps_data.get('status', '')

        if ps_status == 'success':
            payment.status = 'paid'
            payment.paid_at = timezone.now()
            payment.metadata = ps_resp.json()
            payment.save(update_fields=['status', 'paid_at', 'metadata'])
            payment.enrollment.status = 'Under Review'
            payment.enrollment.save(update_fields=['status'])
            logger.info('Payment %s verified as paid via Paystack direct verify', payment.id)
        elif ps_status in ('failed', 'abandoned'):
            payment.status = 'failed'
            payment.metadata = ps_resp.json()
            payment.save(update_fields=['status', 'metadata'])

        return Response(PaymentSerializer(payment).data)
