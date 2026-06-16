'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

const CURRENCIES = [
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'NGN', label: 'NGN — Nigerian Naira' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GHS', label: 'GHS — Ghanaian Cedi' },
  { code: 'KES', label: 'KES — Kenyan Shilling' },
  { code: 'ZAR', label: 'ZAR — South African Rand' },
];

interface Enrollment {
  id: number;
  course_id: number;
  course_name: string;
  course_category: string;
  status: string;
  payment_status: string | null;
  payment_id: number | null;
}

interface PayPanelState {
  enrollmentId: number;
  currency: string;
  discountCode: string;
  isLoading: boolean;
  error: string | null;
}

function getEnrollmentStatusStyle(status: string) {
  switch (status) {
    case 'Approved': return 'bg-green-100 text-green-800';
    case 'Under Review': return 'bg-yellow-100 text-yellow-800';
    case 'Rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function getPaymentStatusStyle(status: string | null) {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-amber-100 text-amber-700';
    case 'failed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-500';
  }
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payPanel, setPayPanel] = useState<PayPanelState | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/students/me/');
      setEnrollments(res.data.enrollments || []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openPayPanel = (enrollmentId: number) => {
    setPayPanel({ enrollmentId, currency: 'USD', discountCode: '', isLoading: false, error: null });
  };

  const closePayPanel = () => setPayPanel(null);

  const initiatePayment = async () => {
    if (!payPanel) return;
    setPayPanel((p) => p && { ...p, isLoading: true, error: null });

    try {
      const res = await apiClient.post('/payments/initiate/', {
        enrollment_id: payPanel.enrollmentId,
        currency: payPanel.currency,
        ...(payPanel.discountCode.trim() && { discount_code: payPanel.discountCode.trim().toUpperCase() }),
      });

      const data = res.data;

      // Store payment ID so the callback page can poll it
      sessionStorage.setItem('evolv_payment_id', String(data.id));

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        // No Paystack key configured (dev mode) — payment recorded as pending
        setPayPanel((p) => p && {
          ...p,
          isLoading: false,
          error: 'Payment processor not configured. Your enrollment is recorded — contact support to complete payment.',
        });
        fetchData(); // Refresh to show updated payment status
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? 'Could not initiate payment. Please try again.';
      setPayPanel((p) => p && { ...p, isLoading: false, error: msg });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto mb-4" />
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <span>←</span> Back to My Account
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-1">My Courses</h1>
            <p className="text-gray-500 text-sm">
              {enrollments.length} {enrollments.length === 1 ? 'enrolment' : 'enrolments'}
            </p>
          </div>
          <Link href="/admission">
            <Button variant="primary">+ Apply for a Course</Button>
          </Link>
        </div>

        {/* Enrolments */}
        {enrollments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-14 text-center">
            <svg className="w-14 h-14 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 className="text-xl font-heading font-bold text-gray-800 mb-2">No Enrolments Yet</h2>
            <p className="text-gray-500 mb-6">You haven't applied for any courses. Start your learning journey today.</p>
            <Link href="/admission">
              <Button variant="primary" size="lg">Apply for Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enr) => {
                  const needsPayment = enr.payment_status === 'failed' || enr.payment_status === 'pending';
              const isPaid = enr.payment_status === 'paid';
              const isActive = payPanel?.enrollmentId === enr.id;

              return (
                <div key={enr.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Course info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {enr.course_category && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-secondary-blue bg-blue-50 rounded-full px-2.5 py-0.5">
                            {enr.course_category}
                          </span>
                        )}
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getEnrollmentStatusStyle(enr.status)}`}>
                          {enr.status}
                        </span>
                        {enr.payment_status && (
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getPaymentStatusStyle(enr.payment_status)}`}>
                            {enr.payment_status === 'paid' ? 'Payment Confirmed' :
                             enr.payment_status === 'pending' ? 'Payment Pending' :
                             enr.payment_status === 'failed' ? 'Payment Failed' :
                             enr.payment_status}
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading text-lg font-bold text-secondary-blue-dark leading-snug">
                        {enr.course_name}
                      </h3>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      {enr.course_id && (
                        <Link href={`/courses/${enr.course_id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      )}
                      {needsPayment && (
                        <button
                          onClick={() => isActive ? closePayPanel() : openPayPanel(enr.id)}
                          className="bg-primary-gold text-secondary-blue-dark text-sm font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
                        >
                          {isActive ? 'Cancel' : 'Retry Payment'}
                        </button>
                      )}
                      {isPaid && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Paid
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pay Panel — inline, shown when Pay Now clicked */}
                  {isActive && payPanel && (
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
                      <p className="text-sm font-semibold text-secondary-blue-dark mb-4">
                        Complete your payment for <span className="font-bold">{enr.course_name}</span>
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        {/* Currency */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                          <select
                            value={payPanel.currency}
                            onChange={(e) => setPayPanel((p) => p && { ...p, currency: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold bg-white"
                          >
                            {CURRENCIES.map((c) => (
                              <option key={c.code} value={c.code}>{c.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Discount code */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Discount Code (optional)</label>
                          <input
                            type="text"
                            value={payPanel.discountCode}
                            onChange={(e) => setPayPanel((p) => p && { ...p, discountCode: e.target.value.toUpperCase() })}
                            placeholder="e.g. AFRICA25"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold uppercase"
                          />
                        </div>
                      </div>

                      {payPanel.error && (
                        <p className="text-sm text-igbo-red mb-3">{payPanel.error}</p>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={initiatePayment}
                          disabled={payPanel.isLoading}
                          className="bg-primary-gold text-secondary-blue-dark font-semibold px-6 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-60 text-sm"
                        >
                          {payPanel.isLoading ? 'Redirecting to Paystack…' : 'Pay with Paystack'}
                        </button>
                        <button
                          onClick={closePayPanel}
                          className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2.5"
                        >
                          Cancel
                        </button>
                      </div>

                      <p className="text-xs text-gray-400 mt-3">
                        You will be redirected to Paystack's secure payment page. Your enrolment is confirmed once payment is complete.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
