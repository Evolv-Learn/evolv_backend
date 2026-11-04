'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

type Status = 'loading' | 'paid' | 'pending' | 'failed' | 'unknown';
const MAX_TRIES = 8;

export default function InstallmentCallbackPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <InstallmentCallbackContent />
    </Suspense>
  );
}

function LoadingCard() {
  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-primary-gold" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-secondary-blue-dark mb-2">
          Confirming your payment...
        </h1>
      </div>
    </div>
  );
}

function InstallmentCallbackContent() {
  const searchParams = useSearchParams();
  const [pageStatus, setPageStatus] = useState<Status>('loading');
  const [installmentNumber, setInstallmentNumber] = useState<number | null>(null);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const storedPlanId = sessionStorage.getItem('evolv_installment_plan_id');
    const storedInstallmentNumber = sessionStorage.getItem('evolv_installment_number');

    if (storedInstallmentNumber) {
      setInstallmentNumber(Number(storedInstallmentNumber));
    }

    if (!reference) {
      setPageStatus('unknown');
      return;
    }

    // Call verify endpoint directly
    apiClient.post('/installments/verify/', { reference })
      .then(res => {
        const plan = res.data;
        const installments = plan.installments || [];
        const paid = installments.find((i: any) => i.processor_reference === reference);
        setCourseName(plan.course_name ?? null);
        if (paid?.status === 'paid') {
          sessionStorage.removeItem('evolv_installment_plan_id');
          sessionStorage.removeItem('evolv_installment_number');
          setPageStatus('paid');
        } else if (paid?.status === 'failed') {
          setPageStatus('failed');
        } else {
          setPageStatus('pending');
        }
      })
      .catch(() => {
        // Fall back to polling the plan
        if (!storedPlanId) {
          setPageStatus('unknown');
          return;
        }
        let tries = 0;
        const poll = async () => {
          tries += 1;
          setAttempts(tries);
          try {
            const res = await apiClient.get(`/installments/my-plan/?enrollment_id=${storedPlanId}`);
            const plan = res.data;
            setCourseName(plan.course_name ?? null);
            const installments = plan.installments || [];
            const targetNum = storedInstallmentNumber ? Number(storedInstallmentNumber) : null;
            const target = targetNum
              ? installments.find((i: any) => i.installment_number === targetNum)
              : null;

            if (target?.status === 'paid' || plan.status === 'completed') {
              sessionStorage.removeItem('evolv_installment_plan_id');
              sessionStorage.removeItem('evolv_installment_number');
              setPageStatus('paid');
            } else if (tries < MAX_TRIES) {
              setTimeout(poll, 5000);
            } else {
              setPageStatus('pending');
            }
          } catch {
            if (tries < MAX_TRIES) setTimeout(poll, 5000);
            else setPageStatus('unknown');
          }
        };
        setTimeout(poll, 3000);
      });
  }, [searchParams]);

  const isFirstInstallment = installmentNumber === 1;

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">

        {pageStatus === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-primary-gold" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-secondary-blue-dark mb-2">
              Confirming your payment…
            </h1>
            <p className="text-gray-500 text-sm">
              Please wait.
              {attempts > 0 && ` (check ${attempts} of ${MAX_TRIES})`}
            </p>
          </>
        )}

        {pageStatus === 'paid' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-secondary-blue-dark mb-2">
              Payment Confirmed!
            </h1>
            <p className="text-gray-600 text-sm mb-2">
              {isFirstInstallment
                ? `Your first instalment for ${courseName ?? 'your course'} has been received. Your place is confirmed.`
                : `Your final instalment for ${courseName ?? 'your course'} has been received. Your enrolment is now complete.`}
            </p>
            {isFirstInstallment && (
              <p className="text-gray-500 text-xs mb-6">
                Your second instalment will be due at the end of Week 6. We will remind you at Week 5.
              </p>
            )}
            <Link
              href="/dashboard"
              className="inline-block bg-primary-gold text-secondary-blue-dark font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
            >
              Go to My Dashboard
            </Link>
          </>
        )}

        {pageStatus === 'pending' && (
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
              Your payment is still being processed. Your dashboard will update automatically within a few minutes.
            </p>
            <Link href="/dashboard" className="inline-block bg-secondary-blue text-white font-semibold px-6 py-3 rounded-xl hover:bg-secondary-blue-dark transition-colors">
              Go to My Dashboard
            </Link>
          </>
        )}

        {pageStatus === 'failed' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <Link href="/dashboard" className="inline-block bg-primary-gold text-secondary-blue-dark font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors">
              Try Again
            </Link>
          </>
        )}

        {pageStatus === 'unknown' && (
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
              We couldn't confirm your payment status. Check your dashboard — if payment was taken, your enrolment will update automatically.
            </p>
            <Link href="/dashboard" className="inline-block bg-secondary-blue text-white font-semibold px-6 py-3 rounded-xl hover:bg-secondary-blue-dark transition-colors">
              Go to My Dashboard
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
