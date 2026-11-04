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

        # FIX (i): Block full payment if an installment plan already exists for this enrollment
        conflict = _block_if_installment_plan_exists(enrollment)
        if conflict:
            return conflict

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
            CourseEnrollment.objects.select_for_update().get(pk=enrollment.pk)
            conflict = _block_if_installment_plan_exists(enrollment)
            if conflict:
                return conflict
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

        if payment.status == 'pending' and payment.processor_reference:
            if payment.authorization_url:
                response_data = PaymentSerializer(payment).data
                response_data['authorization_url'] = payment.authorization_url
                return Response(response_data, status=status.HTTP_200_OK)
            return Response(
                {'detail': 'A payment attempt is being initialized. Please retry shortly.'},
                status=status.HTTP_409_CONFLICT,
            )

        if payment.status == 'failed':
            payment.status = 'pending'
            payment.processor_reference = None
            payment.authorization_url = ''
            payment.save(update_fields=[
                'status', 'processor_reference', 'authorization_url',
            ])

        from django.db import transaction
        with transaction.atomic():
            payment = Payment.objects.select_for_update().get(pk=payment.pk)
            if payment.status == 'pending' and payment.processor_reference:
                if payment.authorization_url:
                    response_data = PaymentSerializer(payment).data
                    response_data['authorization_url'] = payment.authorization_url
                    return Response(response_data, status=status.HTTP_200_OK)
                return Response(
                    {'detail': 'A payment attempt is being initialized. Please retry shortly.'},
                    status=status.HTTP_409_CONFLICT,
                )
            reference = f"EVOLVLEARN-{payment.id}-{int(_time.time())}"
            payment.processor_reference = reference
            payment.processor = 'paystack'
            payment.save(update_fields=['processor_reference', 'processor'])

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
            Payment.objects.filter(
                pk=payment.pk,
                status='pending',
                processor_reference=reference,
            ).update(processor_reference=None)
            return Response(
                {'detail': 'Payment processor unavailable. Please try again.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not ps_resp.ok:
            logger.error("Paystack initialize failed: %s %s", ps_resp.status_code, ps_resp.text)
            Payment.objects.filter(
                pk=payment.pk,
                status='pending',
                processor_reference=reference,
            ).update(processor_reference=None)
            return Response(
                {'detail': 'Could not create payment session. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        ps_data = ps_resp.json()
        if not ps_data.get('status'):
            Payment.objects.filter(
                pk=payment.pk,
                status='pending',
                processor_reference=reference,
            ).update(processor_reference=None)
            return Response(
                {'detail': ps_data.get('message', 'Payment initialization failed.')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        authorization_url = ps_data.get('data', {}).get('authorization_url')
        if not authorization_url:
            Payment.objects.filter(
                pk=payment.pk,
                status='pending',
                processor_reference=reference,
            ).update(processor_reference=None)
            logger.error('Paystack omitted authorization_url for payment %s', payment.pk)
            return Response(
                {'detail': 'Payment processor returned an invalid checkout response.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        payment.authorization_url = authorization_url
        payment.save(update_fields=['authorization_url'])

        response_data = PaymentSerializer(payment).data
        response_data['authorization_url'] = authorization_url
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
    POST /payments/webhook/?processor=paystack

    Paystack webhook signatures and payment amounts are verified before payment
    records are changed. Unsupported processors fail closed.

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
        processor = request.query_params.get('processor', '')
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
            # FIX (vi): Check if it's an installment reference before acknowledging as unknown
            try:
                installment = InstallmentPayment.objects.select_related(
                    'plan__enrollment'
                ).get(processor_reference=reference)
                return self._handle_installment_webhook(installment, event, request.data, processor)
            except InstallmentPayment.DoesNotExist:
                pass
            logger.info("Webhook received for unknown reference=%s processor=%s", reference, processor)
            return Response({'received': True})

        event_lower = event.lower()
        if any(kw in event_lower for kw in ('success', 'charge.succeeded', 'payment_intent.succeeded')):
            ps_data = request.data.get('data')
            if not isinstance(ps_data, dict) or 'amount' not in ps_data or not ps_data.get('currency'):
                logger.error('Ignoring Paystack success webhook with missing amount or currency')
                return Response({'received': True})
            try:
                ps_amount = Decimal(str(ps_data['amount'])) / Decimal('100')
            except (ArithmeticError, TypeError, ValueError):
                logger.error('Ignoring Paystack success webhook with invalid amount')
                return Response({'received': True})
            ps_currency = str(ps_data['currency']).upper()
            if (
                ps_data.get('reference') != reference
                or ps_currency != payment.currency.upper()
                or abs(ps_amount - payment.amount) > Decimal('0.01')
            ):
                logger.error('Ignoring Paystack webhook with mismatched reference, amount, or currency')
                return Response({'received': True})

            payment.status = 'paid'
            payment.paid_at = timezone.now()
            payment.processor = processor
            payment.metadata = request.data
            payment.authorization_url = ''
            payment.save()
            # Move enrollment to Under Review — admin reviews only paid applicants
            if payment.enrollment.status == 'Pending':
                payment.enrollment.status = 'Under Review'
                payment.enrollment.save(update_fields=['status'])
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

    def _handle_installment_webhook(self, installment, event, raw_data, processor):
        """
        FIX (vi): Handle webhook events for installment payments.
        Mirrors the amount/currency checks from VerifyInstallmentPaymentView.
        """
        if installment.status == 'paid':
            return Response({'received': True})

        event_lower = event.lower()

        if any(kw in event_lower for kw in ('success', 'charge.succeeded', 'payment_intent.succeeded')):
            # Validate amount and currency from webhook payload
            ps_data = raw_data.get('data', {})
            if (
                not isinstance(ps_data, dict)
                or 'amount' not in ps_data
                or not ps_data.get('currency')
                or ps_data.get('reference') != installment.processor_reference
            ):
                logger.error('Ignoring installment webhook %s with incomplete payment details', installment.id)
                return Response({'received': True})
            try:
                ps_amount = Decimal(str(ps_data['amount'])) / Decimal('100')
            except (ArithmeticError, TypeError, ValueError):
                logger.error('Ignoring installment webhook %s with invalid amount', installment.id)
                return Response({'received': True})
            ps_currency = str(ps_data['currency']).upper()

            if ps_currency != installment.currency.upper():
                logger.error(
                    'Webhook installment %s currency mismatch: expected %s got %s',
                    installment.id, installment.currency, ps_currency
                )
                return Response({'received': True})

            tolerance = Decimal('0.01')
            if abs(ps_amount - installment.amount) > tolerance:
                logger.error(
                    'Webhook installment %s amount mismatch: expected %s got %s',
                    installment.id, installment.amount, ps_amount
                )
                return Response({'received': True})

            from django.db import transaction
            with transaction.atomic():
                installment.status = 'paid'
                installment.paid_at = timezone.now()
                installment.processor = processor
                installment.metadata = raw_data
                installment.authorization_url = ''
                installment.save()

                plan = installment.plan
                enrollment = plan.enrollment

                if plan.installments.filter(status='paid').count() == 2:
                    plan.status = 'completed'
                    plan.save(update_fields=['status'])
                    if enrollment.status == 'Pending':
                        enrollment.status = 'Under Review'
                        enrollment.save(update_fields=['status'])
                elif installment.installment_number == 1:
                    if enrollment.status == 'Pending':
                        enrollment.status = 'Under Review'
                        enrollment.save(update_fields=['status'])

            logger.info('Installment %s marked paid via webhook (%s)', installment.id, processor)

        elif any(kw in event_lower for kw in ('fail', 'declined')):
            installment.status = 'failed'
            installment.processor = processor
            installment.metadata = raw_data
            installment.save()

        return Response({'received': True})

    # ── Paystack signature verification ──────────────────────────────────────

    def _verify_signature(self, processor: str, request, raw_body: bytes) -> bool:
        """
        Return True if the request is genuinely from the named processor.

        Unsupported processors and missing configuration are rejected.
        """

        if processor != 'paystack':
            return False

        secret = getattr(settings, 'PAYSTACK_SECRET_KEY', None)
        sig = request.headers.get('x-paystack-signature', '')
        if not secret or not sig:
            return False
        expected = hmac.new(secret.encode(), raw_body, hashlib.sha512).hexdigest()
        return hmac.compare_digest(sig, expected)


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
            if ps_data.get('reference') != reference:
                return Response(
                    {'detail': 'Payment reference mismatch. Please contact support.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            ps_amount = Decimal(str(ps_data.get('amount', 0))) / Decimal('100')
            ps_currency = (ps_data.get('currency') or '').upper()
            if ps_currency != payment.currency.upper() or abs(ps_amount - payment.amount) > Decimal('0.01'):
                return Response(
                    {'detail': 'Payment amount or currency mismatch. Please contact support.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            payment.status = 'paid'
            payment.paid_at = timezone.now()
            payment.metadata = ps_resp.json()
            payment.authorization_url = ''
            payment.save(update_fields=[
                'status', 'paid_at', 'metadata', 'authorization_url',
            ])
            if payment.enrollment.status == 'Pending':
                payment.enrollment.status = 'Under Review'
                payment.enrollment.save(update_fields=['status'])
            logger.info('Payment %s verified as paid via Paystack direct verify', payment.id)
        elif ps_status in ('failed', 'abandoned'):
            payment.status = 'failed'
            payment.metadata = ps_resp.json()
            payment.save(update_fields=['status', 'metadata'])

        return Response(PaymentSerializer(payment).data)


# ── Installment Payment Views ─────────────────────────────────────────────────

from .models import InstallmentPlan, InstallmentPayment
from .serializers import (
    InstallmentPlanSerializer,
    GracePeriodRequestSerializer,
    GracePeriodReviewSerializer,
    InitiateInstallmentView_Serializer,
)
from decimal import Decimal


def _block_if_installment_plan_exists(enrollment):
    """
    Returns a Response error if the enrollment already has an installment
    plan, to prevent switching payment paths after an installment exists.
    Returns None if no conflict.
    """
    try:
        enrollment.installment_plan
    except InstallmentPlan.DoesNotExist:
        return None
    return Response(
        {
            'detail': (
                'This enrollment has an installment plan. '
                'Use the installment endpoints to manage its payments.'
            )
        },
        status=status.HTTP_400_BAD_REQUEST,
    )


class InstallmentPlanView(APIView):
    """
    GET  /installments/my-plan/?enrollment_id=<id>
    Returns the student's installment plan for a given enrollment.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enrollment_id = request.query_params.get('enrollment_id')
        if not enrollment_id:
            return Response(
                {'detail': 'enrollment_id query param is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            plan = InstallmentPlan.objects.prefetch_related('installments').get(
                enrollment_id=enrollment_id,
                enrollment__student__user=request.user,
            )
        except InstallmentPlan.DoesNotExist:
            return Response(
                {'detail': 'No installment plan found for this enrollment.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(InstallmentPlanSerializer(plan).data)


class InitiateInstallmentPaymentView(APIView):
    """
    POST /installments/initiate/
    Body: { "enrollment_id": <int>, "currency": "NGN", "installment_number": 1 }

    - installment_number=1: Creates the InstallmentPlan and first InstallmentPayment (50% upfront).
    - installment_number=2: Initiates the second payment (50% at Week 6).

    Policy enforced:
    - Discount codes are NOT accepted (per policy).
    - Only valid for cohorts with installments_enabled=True.
    - Amounts anchored to plan.total_amount, not live course price.
    - Second installment must be paid before effective_deadline.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = InitiateInstallmentView_Serializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        enrollment_id = ser.validated_data['enrollment_id']
        currency = ser.validated_data['currency'].upper()
        installment_number = ser.validated_data['installment_number']

        # Verify enrollment belongs to this user
        try:
            enrollment = CourseEnrollment.objects.select_related(
                'course', 'student__user'
            ).get(id=enrollment_id, student__user=request.user)
        except CourseEnrollment.DoesNotExist:
            return Response({'detail': 'Enrollment not found.'}, status=status.HTTP_404_NOT_FOUND)

        # FIX (iv): Only allow installments for cohorts that explicitly offer them
        if not enrollment.course.installments_enabled:
            return Response(
                {'detail': 'Installment payments are not available for this course.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── First installment: create plan ────────────────────────────────────
        if installment_number == 1:
            # Do not let a pending full-payment checkout race an installment payment.
            if Payment.objects.filter(
                enrollment=enrollment,
                status__in=('pending', 'paid'),
            ).exists():
                return Response(
                    {'detail': 'A full-payment transaction already exists for this enrollment.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Resolve course price for initial plan creation
            price = (
                CoursePrice.objects
                .filter(course=enrollment.course, currency=currency, is_active=True)
                .first()
            )
            if not price:
                price = CoursePrice.objects.filter(
                    course=enrollment.course, currency='USD', is_active=True
                ).first()
                if not price:
                    return Response(
                        {'detail': 'No pricing configured for this course yet.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                currency = 'USD'

            total_amount = price.amount
            installment_amount = (total_amount / Decimal('2')).quantize(Decimal('0.01'))

            from django.db import transaction
            with transaction.atomic():
                CourseEnrollment.objects.select_for_update().get(pk=enrollment.pk)
                if Payment.objects.filter(
                    enrollment=enrollment,
                    status__in=('pending', 'paid'),
                ).exists():
                    return Response(
                        {'detail': 'A full-payment transaction already exists for this enrollment.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                plan, plan_created = InstallmentPlan.objects.get_or_create(
                    enrollment=enrollment,
                    defaults={
                        'currency': currency,
                        'total_amount': total_amount,
                        'status': 'active',
                    },
                )

                if not plan_created and plan.status != 'active':
                    return Response(
                        {'detail': 'This installment plan is closed and cannot be restarted.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                installment, _ = InstallmentPayment.objects.get_or_create(
                    plan=plan,
                    installment_number=1,
                    defaults={
                        'amount': installment_amount,
                        'currency': plan.currency,  # use plan's locked currency
                        'status': 'pending',
                    },
                )

                if installment.status == 'paid':
                    return Response(InstallmentPlanSerializer(plan).data, status=status.HTTP_200_OK)

        # ── Second installment ────────────────────────────────────────────────
        elif installment_number == 2:
            try:
                plan = InstallmentPlan.objects.prefetch_related('installments').get(
                    enrollment=enrollment
                )
            except InstallmentPlan.DoesNotExist:
                return Response(
                    {'detail': 'No installment plan found. Please complete the first installment first.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if plan.status == 'defaulted':
                return Response(
                    {'detail': 'This installment plan has been closed due to non-payment.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if plan.status == 'completed':
                return Response(
                    {'detail': 'This installment plan is already completed.'},
                    status=status.HTTP_200_OK,
                )

            # Confirm first installment is paid
            first = plan.installments.filter(installment_number=1, status='paid').first()
            if not first:
                return Response(
                    {'detail': 'First installment must be paid before initiating the second.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # FIX (v): Check effective deadline (anchored to deadline + 48hrs if grace approved)
            from django.utils import timezone as tz
            effective = plan.effective_deadline
            if effective and tz.now() > effective:
                return Response(
                    {'detail': 'The payment deadline has passed. Please contact support.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # FIX (ii): Anchor second installment amount to plan.total_amount, not live price
            installment_amount = (plan.total_amount / Decimal('2')).quantize(Decimal('0.01'))
            remaining = plan.total_amount - installment_amount
            currency = plan.currency  # use plan's locked currency

            from django.db import transaction
            with transaction.atomic():
                installment, _ = InstallmentPayment.objects.get_or_create(
                    plan=plan,
                    installment_number=2,
                    defaults={
                        'amount': remaining,
                        'currency': currency,
                        'status': 'pending',
                        'due_date': plan.second_installment_deadline,
                    },
                )

                if installment.status == 'paid':
                    return Response(InstallmentPlanSerializer(plan).data, status=status.HTTP_200_OK)

        # ── Initiate Paystack payment ─────────────────────────────────────────
        paystack_secret = getattr(settings, 'PAYSTACK_SECRET_KEY', '')
        plan_data = InstallmentPlanSerializer(plan).data
        charge_amount = installment.amount  # always from the locked installment record

        if not paystack_secret:
            return Response(plan_data, status=status.HTTP_201_CREATED)

        from django.db import transaction

        with transaction.atomic():
            installment = InstallmentPayment.objects.select_for_update().get(
                pk=installment.pk
            )
            if installment.status == 'paid':
                return Response(InstallmentPlanSerializer(plan).data)

            if installment.status == 'pending' and installment.processor_reference:
                if installment.authorization_url:
                    plan_data['authorization_url'] = installment.authorization_url
                    plan_data['installment_number'] = installment_number
                    return Response(plan_data)
                return Response(
                    {'detail': 'A payment attempt is being initialized. Please retry shortly.'},
                    status=status.HTTP_409_CONFLICT,
                )

            if installment.status == 'failed':
                installment.status = 'pending'
                installment.processor_reference = None
                installment.authorization_url = ''

            reference = f"EVOLVLEARN-INST-{plan.id}-{installment_number}-{int(_time.time())}"
            installment.processor_reference = reference
            installment.processor = 'paystack'
            installment.save(update_fields=[
                'status', 'processor_reference', 'processor', 'authorization_url',
            ])

        amount_minor = int(charge_amount * 100)
        callback_url = f"{settings.FRONTEND_URL}/payment/installment-callback"

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
                        'plan_id': plan.id,
                        'installment_number': installment_number,
                        'course_name': enrollment.course.name,
                    },
                },
                timeout=15,
            )
        except http_requests.RequestException as exc:
            logger.error("Paystack API request failed for installment: %s", exc)
            InstallmentPayment.objects.filter(
                pk=installment.pk,
                status='pending',
                processor_reference=reference,
            ).update(processor_reference=None)
            return Response(
                {'detail': 'Payment processor unavailable. Please try again.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not ps_resp.ok:
            InstallmentPayment.objects.filter(
                pk=installment.pk,
                status='pending',
                processor_reference=reference,
            ).update(processor_reference=None)
            return Response(
                {'detail': 'Could not create payment session. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        ps_data = ps_resp.json()
        if not ps_data.get('status'):
            InstallmentPayment.objects.filter(
                pk=installment.pk,
                status='pending',
                processor_reference=reference,
            ).update(processor_reference=None)
            return Response(
                {'detail': ps_data.get('message', 'Payment initialization failed.')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        authorization_url = ps_data.get('data', {}).get('authorization_url')
        if not authorization_url:
            InstallmentPayment.objects.filter(
                pk=installment.pk,
                status='pending',
                processor_reference=reference,
            ).update(processor_reference=None)
            logger.error('Paystack omitted authorization_url for installment %s', installment.pk)
            return Response(
                {'detail': 'Payment processor returned an invalid checkout response.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        installment.authorization_url = authorization_url
        installment.save(update_fields=['authorization_url'])

        plan_data['authorization_url'] = authorization_url
        plan_data['installment_number'] = installment_number
        return Response(plan_data, status=status.HTTP_201_CREATED)


class VerifyInstallmentPaymentView(APIView):
    """
    POST /installments/verify/
    Body: { "reference": "<paystack_reference>" }

    FIX (ii): Verifies amount and currency against the locked installment record.
    FIX (medium): Only moves enrollment to Under Review if not already Approved.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        reference = (request.data.get('reference') or '').strip()
        if not reference:
            return Response({'detail': 'reference is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            installment = InstallmentPayment.objects.select_related(
                'plan__enrollment__student__user',
                'plan__enrollment__course',
            ).get(processor_reference=reference)
        except InstallmentPayment.DoesNotExist:
            return Response({'detail': 'Installment payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if installment.plan.enrollment.student.user != request.user:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if installment.status == 'paid':
            return Response(InstallmentPlanSerializer(installment.plan).data)

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
            logger.error('Paystack verify failed for installment: %s', exc)
            return Response({'detail': 'Could not reach payment processor.'}, status=status.HTTP_502_BAD_GATEWAY)

        if not ps_resp.ok:
            return Response({'detail': 'Verification failed.'}, status=status.HTTP_502_BAD_GATEWAY)

        ps_data = ps_resp.json().get('data', {})
        ps_status = ps_data.get('status', '')

        from django.utils import timezone as tz
        from django.db import transaction

        if ps_status == 'success':
            # FIX (ii): Validate amount and currency against locked installment record
            if ps_data.get('reference') != reference:
                return Response(
                    {'detail': 'Payment reference mismatch. Please contact support.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            ps_amount = Decimal(str(ps_data.get('amount', 0))) / Decimal('100')
            ps_currency = (ps_data.get('currency') or '').upper()
            expected_amount = installment.amount
            expected_currency = installment.currency.upper()

            if ps_currency != expected_currency:
                logger.error(
                    'Installment %s currency mismatch: expected %s got %s',
                    installment.id, expected_currency, ps_currency
                )
                return Response(
                    {'detail': 'Payment currency mismatch. Please contact support.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            tolerance = Decimal('0.01')
            if abs(ps_amount - expected_amount) > tolerance:
                logger.error(
                    'Installment %s amount mismatch: expected %s got %s',
                    installment.id, expected_amount, ps_amount
                )
                return Response(
                    {'detail': 'Payment amount mismatch. Please contact support.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with transaction.atomic():
                installment.status = 'paid'
                installment.paid_at = tz.now()
                installment.metadata = ps_resp.json()
                installment.authorization_url = ''
                installment.save(update_fields=[
                    'status', 'paid_at', 'metadata', 'authorization_url',
                ])

                plan = installment.plan
                enrollment = plan.enrollment

                if plan.installments.filter(status='paid').count() == 2:
                    plan.status = 'completed'
                    plan.save(update_fields=['status'])
                    if enrollment.status == 'Pending':
                        enrollment.status = 'Under Review'
                        enrollment.save(update_fields=['status'])
                elif installment.installment_number == 1:
                    # FIX (medium): Only update if not already at a further stage
                    if enrollment.status == 'Pending':
                        enrollment.status = 'Under Review'
                        enrollment.save(update_fields=['status'])

                logger.info(
                    'Installment %s (plan %s) verified as paid via Paystack',
                    installment.installment_number, plan.id
                )

        elif ps_status in ('failed', 'abandoned'):
            installment.status = 'failed'
            installment.metadata = ps_resp.json()
            installment.save(update_fields=['status', 'metadata'])

        return Response(InstallmentPlanSerializer(installment.plan).data)


class RequestGracePeriodView(APIView):
    """
    POST /installments/<plan_id>/request-grace-period/
    Body: { "evidence": "My Paystack transaction ref ABC123 failed at 11:45 PM..." }

    FIX (v): Request is ONLY allowed before the deadline (not 48hrs after).
    Grace period expiry is anchored to deadline + 48hrs (not request time).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, plan_id):
        ser = GracePeriodRequestSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = InstallmentPlan.objects.get(
                id=plan_id,
                enrollment__student__user=request.user,
            )
        except InstallmentPlan.DoesNotExist:
            return Response({'detail': 'Plan not found.'}, status=status.HTTP_404_NOT_FOUND)

        if plan.status != 'active':
            return Response(
                {'detail': f'Grace period cannot be requested for a plan with status: {plan.status}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if plan.grace_period_requested:
            return Response(
                {'detail': 'A grace period request has already been submitted for this plan.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from django.utils import timezone as tz
        import datetime
        now = tz.now()

        # FIX (v): Only allow grace period requests BEFORE the deadline
        if plan.second_installment_deadline:
            if now > plan.second_installment_deadline:
                return Response(
                    {
                        'detail': (
                            'The payment deadline has already passed. '
                            'Grace period requests must be submitted before the deadline. '
                            'Please contact support directly at evolvngo@gmail.com.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # FIX (v): Grace expiry is anchored to deadline + 48hrs, not request time
        grace_expiry = plan.second_installment_deadline + datetime.timedelta(hours=48) \
            if plan.second_installment_deadline else now + datetime.timedelta(hours=48)

        plan.grace_period_requested = True
        plan.grace_period_requested_at = now
        plan.grace_period_expires_at = grace_expiry
        plan.grace_period_evidence = ser.validated_data['evidence']
        plan.save(update_fields=[
            'grace_period_requested', 'grace_period_requested_at',
            'grace_period_expires_at', 'grace_period_evidence',
        ])

        logger.info('Grace period requested for plan %s by user %s', plan.id, request.user.id)
        return Response({
            'detail': (
                'Grace period request submitted. EvolvLearn will review and respond before your deadline.'
            ),
            'grace_period_expires_at': grace_expiry,
        })


class AdminGracePeriodReviewView(APIView):
    """
    POST /admin/installments/<plan_id>/review-grace-period/
    Body: { "approved": true }
    """
    permission_classes = [IsAdminUser]

    def post(self, request, plan_id):
        ser = GracePeriodReviewSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = InstallmentPlan.objects.select_related(
                'enrollment__student__user', 'enrollment__course'
            ).get(id=plan_id)
        except InstallmentPlan.DoesNotExist:
            return Response({'detail': 'Plan not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not plan.grace_period_requested:
            return Response(
                {'detail': 'No grace period request found for this plan.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if plan.status != 'active':
            return Response(
                {'detail': 'This grace period request can no longer be reviewed because the plan is closed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from django.utils import timezone as tz
        plan.grace_period_approved = ser.validated_data['approved']
        plan.grace_period_reviewed_by = request.user
        plan.grace_period_reviewed_at = tz.now()
        plan.save(update_fields=[
            'grace_period_approved', 'grace_period_reviewed_by', 'grace_period_reviewed_at'
        ])

        action = 'approved' if ser.validated_data['approved'] else 'rejected'
        logger.info('Grace period %s for plan %s by admin %s', action, plan.id, request.user.id)
        return Response({
            'detail': f'Grace period {action}.',
            'plan': InstallmentPlanSerializer(plan).data,
        })


class AdminInstallmentPlanListView(generics.ListAPIView):
    """
    GET /admin/installments/
    """
    serializer_class = InstallmentPlanSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = InstallmentPlan.objects.prefetch_related(
            'installments'
        ).select_related(
            'enrollment__course', 'enrollment__student__user'
        ).order_by('-created_at')

        plan_status = self.request.query_params.get('status')
        if plan_status:
            qs = qs.filter(status=plan_status)

        grace_pending = self.request.query_params.get('grace_pending')
        if grace_pending == 'true':
            qs = qs.filter(grace_period_requested=True, grace_period_approved__isnull=True)

        return qs


class AdminInstallmentPlanDetailView(generics.RetrieveAPIView):
    """
    GET /admin/installments/<pk>/
    """
    serializer_class = InstallmentPlanSerializer
    permission_classes = [IsAdminUser]
    queryset = InstallmentPlan.objects.prefetch_related('installments').select_related(
        'enrollment__course', 'enrollment__student__user'
    )


class AdminSetInstallmentDeadlineView(APIView):
    """
    PATCH /admin/installments/<plan_id>/set-deadline/
    Body: { "deadline": "2026-12-06T22:59:00+01:00" }
    Deadline should be 11:59 PM WAT (UTC+1).
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, plan_id):
        deadline_str = request.data.get('deadline')
        if not deadline_str:
            return Response(
                {'detail': 'deadline is required (ISO 8601 format).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            plan = InstallmentPlan.objects.get(id=plan_id)
        except InstallmentPlan.DoesNotExist:
            return Response({'detail': 'Plan not found.'}, status=status.HTTP_404_NOT_FOUND)

        from dateutil.parser import parse as parse_date
        try:
            deadline = parse_date(deadline_str)
            if not deadline.tzinfo:
                import pytz
                wat = pytz.timezone('Africa/Lagos')
                deadline = wat.localize(deadline)
        except Exception:
            return Response(
                {'detail': 'Invalid date format. Use ISO 8601 (e.g. 2026-12-06T22:59:00+01:00).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        plan.second_installment_deadline = deadline
        plan.save(update_fields=['second_installment_deadline'])
        return Response(InstallmentPlanSerializer(plan).data)
