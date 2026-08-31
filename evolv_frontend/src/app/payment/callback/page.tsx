'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

type PaymentStatus = 'loading' | 'paid' | 'pending' | 'failed' | 'unknown';

const PAYMENT_STATUS_MAX_TRIES = 8;

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<PaymentCallbackFallback />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}

function PaymentCallbackFallback() {
  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-primary-gold" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-secondary-blue-dark mb-2">
          Confirming your payment...
        </h1>
        <p className="text-gray-500 text-sm">
          Please wait while we confirm with Paystack.
        </p>
      </div>
    </div>
  );
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('loading');
  const [courseName, setCourseName] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const paymentId = sessionStorage.getItem('evolv_payment_id');

    if (!paymentId) {
      const status = reference ? 'pending' : 'unknown';
      const timeout = setTimeout(() => setPaymentStatus(status), 0);
      return () => clearTimeout(timeout);
    }

    let tries = 0;
    const poll = async () => {
      tries += 1;
      setAttempts(tries);
      try {
        const res = await apiClient.get(`/payments/${paymentId}/`);
        const data = res.data;
        setCourseName(data.course_name ?? null);

        if (data.status === 'paid') {
          sessionStorage.removeItem('evolv_payment_id');
          setPaymentStatus('paid');
          return;
        }
        if (data.status === 'failed') {
          sessionStorage.removeItem('evolv_payment_id');
          setPaymentStatus('failed');
          return;
        }
        if (tries < PAYMENT_STATUS_MAX_TRIES) {
          setTimeout(poll, 5000);
        } else {
          setPaymentStatus('pending');
        }
      } catch {
        if (tries < PAYMENT_STATUS_MAX_TRIES) {
          setTimeout(poll, 5000);
        } else {
          setPaymentStatus('unknown');
        }
      }
    };

    // Step 1: if we have a Paystack reference, call verify directly first
    // (handles localhost where webhooks can't reach the server)
    if (reference) {
      apiClient.post('/payments/verify/', { reference })
        .then(res => {
          const data = res.data;
          setCourseName(data.course_name ?? null);
          if (data.status === 'paid') {
            sessionStorage.removeItem('evolv_payment_id');
            setPaymentStatus('paid');
          } else if (data.status === 'failed') {
            sessionStorage.removeItem('evolv_payment_id');
            setPaymentStatus('failed');
          } else {
            // Pending — fall back to polling
            setTimeout(poll, 3000);
          }
        })
        .catch(() => {
          // Verify endpoint failed — fall back to polling
          setTimeout(poll, 3000);
        });
    } else {
      // No reference — just poll
      setTimeout(poll, 3000);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">

        {paymentStatus === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-primary-gold" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-secondary-blue-dark mb-2">
              Confirming your payment…
            </h1>
            <p className="text-gray-500 text-sm">
              Please wait while we confirm with Paystack.
              {attempts > 0 && ` (check ${attempts} of ${PAYMENT_STATUS_MAX_TRIES})`}
            </p>
          </>
        )}

        {paymentStatus === 'paid' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-secondary-blue-dark mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              {courseName
                ? `You're now enrolled in ${courseName}. Check your dashboard for next steps.`
                : "Your enrollment has been confirmed. Check your dashboard for next steps."}
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-primary-gold text-secondary-blue-dark font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
            >
              Go to My Dashboard
            </Link>
          </>
        )}

        {paymentStatus === 'pending' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-secondary-blue-dark mb-2">
              Payment Processing
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Your payment is still being processed. We'll update your dashboard automatically
              once confirmed — this usually takes a few minutes.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-secondary-blue text-white font-semibold px-6 py-3 rounded-xl hover:bg-secondary-blue-dark transition-colors"
            >
              Go to My Dashboard
            </Link>
          </>
        )}

        {paymentStatus === 'failed' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-igbo-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-secondary-blue-dark mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Your payment could not be completed. No charge was made. Please try again from your dashboard.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-primary-gold text-secondary-blue-dark font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
            >
              Try Again
            </Link>
          </>
        )}

        {paymentStatus === 'unknown' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-secondary-blue-dark mb-2">
              Status Unknown
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              We couldn't confirm your payment status. Please check your dashboard — if payment
              was taken, your enrollment will update automatically within a few minutes.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-secondary-blue text-white font-semibold px-6 py-3 rounded-xl hover:bg-secondary-blue-dark transition-colors"
            >
              Go to My Dashboard
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
