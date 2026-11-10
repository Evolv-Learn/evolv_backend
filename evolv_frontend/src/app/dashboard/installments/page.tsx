'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface InstallmentPayment {
  id: number;
  installment_number: number;
  amount: string;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  status_display: string;
  due_date: string | null;
  paid_at: string | null;
}

interface InstallmentPlan {
  id: number;
  enrollment_id: number;
  course_name: string;
  currency: string;
  total_amount: string;
  first_installment_amount: string;
  second_installment_amount: string;
  status: 'active' | 'completed' | 'defaulted' | 'cancelled';
  status_display: string;
  second_installment_deadline: string | null;
  effective_deadline: string | null;
  is_past_deadline: boolean;
  grace_period_requested: boolean;
  grace_period_approved: boolean | null;
  grace_period_expires_at: string | null;
  installments: InstallmentPayment[];
}

export default function InstalmentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-gold" />
      </div>
    }>
      <InstalmentsContent />
    </Suspense>
  );
}

function InstalmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get('enrollment_id');

  const [plan, setPlan] = useState<InstallmentPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [gracePending, setGracePending] = useState(false);
  const [graceEvidence, setGraceEvidence] = useState('');
  const [graceError, setGraceError] = useState<string | null>(null);
  const [graceSuccess, setGraceSuccess] = useState(false);
  const [showGraceForm, setShowGraceForm] = useState(false);

  useEffect(() => {
    if (!enrollmentId) {
      router.push('/dashboard');
      return;
    }
    fetchPlan();
  }, [enrollmentId]);

  const fetchPlan = async () => {
    try {
      const res = await apiClient.get(`/installments/my-plan/?enrollment_id=${enrollmentId}`);
      setPlan(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No installment plan found for this enrollment.');
      } else {
        setError('Could not load your payment plan. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async (installmentNumber: number) => {
    if (!plan) return;
    setIsPaying(true);
    setError(null);
    try {
      const res = await apiClient.post('/installments/initiate/', {
        enrollment_id: plan.enrollment_id,
        currency: plan.currency,
        installment_number: installmentNumber,
      });

      // Store plan context for callback page
      sessionStorage.setItem('evolv_installment_plan_id', String(plan.enrollment_id));
      sessionStorage.setItem('evolv_installment_number', String(installmentNumber));

      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        // Local dev — no Paystack configured
        await fetchPlan();
      }
    } catch {
      setError(
        'We could not start your payment. Please try again. If the problem continues, contact support for help.'
      );
    } finally {
      setIsPaying(false);
    }
  };

  const handleGraceRequest = async () => {
    if (!plan || graceEvidence.trim().length < 20) {
      setGraceError('Please provide more detail about the technical issue (at least 20 characters).');
      return;
    }
    setGracePending(true);
    setGraceError(null);
    try {
      await apiClient.post(`/installments/${plan.id}/request-grace-period/`, {
        evidence: graceEvidence,
      });
      setGraceSuccess(true);
      setShowGraceForm(false);
      await fetchPlan();
    } catch (err: any) {
      setGraceError(err.response?.data?.detail || 'Could not submit request. Please contact us directly.');
    } finally {
      setGracePending(false);
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(num);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }) + ' at 11:59 PM WAT';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'defaulted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-gold" />
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow p-10 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/dashboard" className="text-primary-gold font-semibold hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const firstInstallment = plan.installments.find(i => i.installment_number === 1);
  const secondInstallment = plan.installments.find(i => i.installment_number === 2);
  const canPaySecond = firstInstallment?.status === 'paid'
    && secondInstallment?.status !== 'paid'
    && plan.status === 'active'
    && !plan.is_past_deadline;

  return (
    <div className="min-h-screen bg-warm-white py-10">
      <div className="container mx-auto px-4 max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-secondary-blue mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-heading font-bold text-secondary-blue">
            Instalment Plan
          </h1>
          <p className="text-gray-600 mt-1">{plan.course_name}</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Grace period success */}
        {graceSuccess && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg text-green-700 text-sm">
            ✅ Grace period request submitted. EvolvLearn will review and respond before your deadline.
          </div>
        )}

        {/* Plan Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-secondary-blue">Plan Summary</h2>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(plan.status)}`}>
              {plan.status_display}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Course Fee</p>
              <p className="font-bold text-secondary-blue text-lg">
                {formatCurrency(plan.total_amount, plan.currency)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Each Instalment</p>
              <p className="font-bold text-secondary-blue text-lg">
                {formatCurrency(plan.first_installment_amount, plan.currency)}
              </p>
            </div>
          </div>
          {plan.second_installment_deadline && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-sm">Second Instalment Deadline</p>
              <p className="font-semibold text-secondary-blue text-sm mt-1">
                {formatDate(plan.effective_deadline || plan.second_installment_deadline)}
              </p>
              {plan.grace_period_approved && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ Grace period approved — deadline extended by 48 hours
                </p>
              )}
            </div>
          )}
        </div>

        {/* Instalments */}
        <div className="space-y-4 mb-6">

          {/* First Instalment */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-secondary-blue">First Instalment</h3>
                <p className="text-xs text-gray-500">50% upfront — confirms your place</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(firstInstallment?.status || 'pending')}`}>
                {firstInstallment?.status_display || 'Pending'}
              </span>
            </div>
            <p className="text-2xl font-bold text-secondary-blue mb-4">
              {formatCurrency(plan.first_installment_amount, plan.currency)}
            </p>
            {firstInstallment?.status === 'paid' ? (
              <p className="text-sm text-green-600">
                ✅ Paid on {firstInstallment.paid_at ? new Date(firstInstallment.paid_at).toLocaleDateString('en-GB') : '—'}
              </p>
            ) : (
              <button
                onClick={() => handlePay(1)}
                disabled={isPaying}
                className="w-full bg-primary-gold text-secondary-blue-dark font-semibold py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {isPaying ? 'Redirecting to Paystack…' : `Pay ${formatCurrency(plan.first_installment_amount, plan.currency)} Now`}
              </button>
            )}
          </div>

          {/* Second Instalment */}
          <div className={`bg-white rounded-2xl shadow p-6 ${firstInstallment?.status !== 'paid' ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-secondary-blue">Second Instalment</h3>
                <p className="text-xs text-gray-500">50% due at end of Week 6</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(secondInstallment?.status || 'pending')}`}>
                {secondInstallment?.status_display || 'Not yet due'}
              </span>
            </div>
            <p className="text-2xl font-bold text-secondary-blue mb-4">
              {formatCurrency(plan.second_installment_amount, plan.currency)}
            </p>

            {secondInstallment?.status === 'paid' ? (
              <p className="text-sm text-green-600">
                ✅ Paid on {secondInstallment.paid_at ? new Date(secondInstallment.paid_at).toLocaleDateString('en-GB') : '—'}
              </p>
            ) : plan.status === 'defaulted' ? (
              <p className="text-sm text-red-600">
                ❌ Deadline passed. Access has ended. Contact us at evolvngo@gmail.com to discuss a future cohort.
              </p>
            ) : canPaySecond ? (
              <button
                onClick={() => handlePay(2)}
                disabled={isPaying}
                className="w-full bg-secondary-blue text-white font-semibold py-3 rounded-xl hover:bg-secondary-blue-dark transition-colors disabled:opacity-50"
              >
                {isPaying ? 'Redirecting to Paystack…' : `Pay ${formatCurrency(plan.second_installment_amount, plan.currency)} Now`}
              </button>
            ) : plan.is_past_deadline && plan.status === 'active' ? (
              <p className="text-sm text-amber-600">
                ⏰ Deadline has passed. Contact us immediately at evolvngo@gmail.com.
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Available after first instalment is confirmed.
              </p>
            )}
          </div>
        </div>

        {/* Grace Period Section */}
        {plan.status === 'active'
          && firstInstallment?.status === 'paid'
          && secondInstallment?.status !== 'paid'
          && !plan.grace_period_requested
          && !plan.is_past_deadline && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-amber-800 mb-2">Experiencing a technical issue?</h3>
            <p className="text-amber-700 text-sm mb-4">
              If you attempted payment before the deadline but experienced a bank or card failure,
              you can report it here before the deadline passes. We will review and extend your
              deadline by 48 hours if verified.
            </p>
            {!showGraceForm ? (
              <button
                onClick={() => setShowGraceForm(true)}
                className="text-sm font-semibold text-amber-800 underline"
              >
                Report a technical failure →
              </button>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={graceEvidence}
                  onChange={e => setGraceEvidence(e.target.value)}
                  placeholder="Describe what happened — include your Paystack transaction reference if available (e.g. failed at 11:45 PM, reference: PS-ABC123)"
                  className="w-full border border-amber-300 rounded-lg p-3 text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                {graceError && (
                  <p className="text-red-600 text-xs">{graceError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleGraceRequest}
                    disabled={gracePending}
                    className="bg-amber-600 text-white font-semibold px-5 py-2 rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50"
                  >
                    {gracePending ? 'Submitting…' : 'Submit Request'}
                  </button>
                  <button
                    onClick={() => setShowGraceForm(false)}
                    className="text-gray-500 text-sm hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grace period pending */}
        {plan.grace_period_requested && plan.grace_period_approved === null && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-blue-800 mb-1">Grace period request under review</h3>
            <p className="text-blue-700 text-sm">
              Your request has been submitted. EvolvLearn will review and respond before your deadline.
              If approved, your deadline will be extended to{' '}
              {plan.grace_period_expires_at
                ? new Date(plan.grace_period_expires_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
                : '48 hours after your original deadline'}.
            </p>
          </div>
        )}

        {/* Policy reminder */}
        <div className="text-center mt-4">
          <Link
            href="/payment-policy"
            className="text-xs text-gray-400 hover:text-secondary-blue hover:underline"
          >
            View payment policy →
          </Link>
        </div>

      </div>
    </div>
  );
}
