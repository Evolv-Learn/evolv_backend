'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/lib/api/client';

interface InstallmentPayment {
  id: number;
  installment_number: number;
  amount: string;
  currency: string;
  status: string;
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
  status: string;
  status_display: string;
  second_installment_deadline: string | null;
  effective_deadline: string | null;
  is_past_deadline: boolean;
  grace_period_requested: boolean;
  grace_period_approved: boolean | null;
  grace_period_evidence: string;
  grace_period_expires_at: string | null;
  reminder_sent_at: string | null;
  created_at: string;
  installments: InstallmentPayment[];
}

const STATUS_FILTERS = [
  { value: '', label: 'All Plans' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'defaulted', label: 'Defaulted' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  defaulted: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
};

export default function AdminInstalmentsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState<InstallmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [graceOnly, setGraceOnly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InstallmentPlan | null>(null);
  const [deadlineInput, setDeadlineInput] = useState('');
  const [deadlineError, setDeadlineError] = useState<string | null>(null);
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);
  const [isReviewingGrace, setIsReviewingGrace] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (!user?.is_staff && !user?.is_superuser) { router.replace('/dashboard'); return; }
    fetchPlans();
  }, [isAuthenticated, user, statusFilter, graceOnly]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (graceOnly) params.set('grace_pending', 'true');
      const res = await apiClient.get(`/admin/installments/?${params.toString()}`);
      setPlans(res.data.results ?? res.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDeadline = async (planId: number) => {
    if (!deadlineInput) { setDeadlineError('Please enter a deadline.'); return; }
    setIsSavingDeadline(true);
    setDeadlineError(null);
    try {
      // Convert local datetime-local input to ISO with WAT offset (+01:00)
      const isoDeadline = new Date(deadlineInput).toISOString();
      await apiClient.patch(`/admin/installments/${planId}/set-deadline/`, {
        deadline: isoDeadline,
      });
      setActionMessage('Deadline saved successfully.');
      setDeadlineInput('');
      await fetchPlans();
      setSelectedPlan(prev => prev?.id === planId
        ? { ...prev, second_installment_deadline: isoDeadline }
        : prev
      );
    } catch (err: any) {
      setDeadlineError(err.response?.data?.detail || 'Could not save deadline.');
    } finally {
      setIsSavingDeadline(false);
    }
  };

  const handleGraceReview = async (planId: number, approved: boolean) => {
    setIsReviewingGrace(true);
    try {
      await apiClient.post(`/admin/installments/${planId}/review-grace-period/`, { approved });
      setActionMessage(`Grace period ${approved ? 'approved' : 'rejected'}.`);
      await fetchPlans();
      setSelectedPlan(prev => prev?.id === planId
        ? { ...prev, grace_period_approved: approved }
        : prev
      );
    } catch (err: any) {
      setActionMessage(err.response?.data?.detail || 'Could not process review.');
    } finally {
      setIsReviewingGrace(false);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(amount));
    } catch { return `${currency} ${amount}`; }
  };

  const gracePendingCount = plans.filter(p => p.grace_period_requested && p.grace_period_approved === null).length;

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-secondary-blue">Instalment Plans</h1>
            <p className="text-gray-500 text-sm mt-1">Manage student payment plans, deadlines and grace periods</p>
          </div>
          {gracePendingCount > 0 && !graceOnly && (
            <button
              onClick={() => setGraceOnly(true)}
              className="bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-lg border border-amber-200 hover:bg-amber-200 transition-colors"
            >
              ⚠️ {gracePendingCount} grace period{gracePendingCount > 1 ? 's' : ''} pending review
            </button>
          )}
        </div>

        {/* Action message */}
        {actionMessage && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-3 rounded-lg text-green-700 text-sm flex justify-between">
            {actionMessage}
            <button onClick={() => setActionMessage(null)} className="text-green-500 hover:text-green-700">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setGraceOnly(false); }}
              className={`text-sm px-4 py-1.5 rounded-full font-semibold border transition-colors ${
                statusFilter === f.value && !graceOnly
                  ? 'bg-secondary-blue text-white border-secondary-blue'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-secondary-blue'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => { setGraceOnly(!graceOnly); setStatusFilter(''); }}
            className={`text-sm px-4 py-1.5 rounded-full font-semibold border transition-colors ${
              graceOnly
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-amber-600 border-amber-200 hover:border-amber-400'
            }`}
          >
            Grace Pending {gracePendingCount > 0 && `(${gracePendingCount})`}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Plans List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-gold" />
              </div>
            ) : plans.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center text-gray-400">
                <p className="text-lg">No plans found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map(plan => {
                  const first = plan.installments.find(i => i.installment_number === 1);
                  const second = plan.installments.find(i => i.installment_number === 2);
                  const isSelected = selectedPlan?.id === plan.id;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(isSelected ? null : plan)}
                      className={`bg-white rounded-xl p-5 cursor-pointer border-2 transition-all ${
                        isSelected ? 'border-secondary-blue shadow-md' : 'border-transparent shadow-sm hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-secondary-blue truncate">{plan.course_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Plan #{plan.id} · Created {formatDate(plan.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {plan.grace_period_requested && plan.grace_period_approved === null && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">Grace ⏳</span>
                          )}
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[plan.status] || 'bg-gray-100 text-gray-600'}`}>
                            {plan.status_display}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-gray-400">Total</p>
                          <p className="font-semibold">{formatCurrency(plan.total_amount, plan.currency)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">1st Instalment</p>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${first?.status === 'paid' ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <p className="font-semibold">{first?.status_display || '—'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400">2nd Instalment</p>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${second?.status === 'paid' ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <p className="font-semibold">{second?.status_display || 'Not initiated'}</p>
                          </div>
                        </div>
                      </div>

                      {plan.second_installment_deadline && (
                        <p className={`text-xs mt-2 ${plan.is_past_deadline ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                          Deadline: {formatDate(plan.second_installment_deadline)}
                          {plan.is_past_deadline && ' · OVERDUE'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {!selectedPlan ? (
              <div className="bg-white rounded-xl p-6 text-center text-gray-400 sticky top-6">
                <p className="text-sm">Select a plan to manage it</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 sticky top-6 space-y-5">
                <div>
                  <h3 className="font-bold text-secondary-blue text-lg">{selectedPlan.course_name}</h3>
                  <p className="text-xs text-gray-400">Plan #{selectedPlan.id}</p>
                </div>

                {/* Instalments */}
                <div className="space-y-2">
                  {selectedPlan.installments.map(inst => (
                    <div key={inst.id} className="flex items-center justify-between text-sm p-3 bg-warm-white rounded-lg">
                      <div>
                        <p className="font-semibold">Instalment {inst.installment_number}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(inst.amount, inst.currency)}</p>
                        {inst.paid_at && <p className="text-xs text-green-600">Paid {formatDate(inst.paid_at)}</p>}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[inst.status] || ''}`}>
                        {inst.status_display}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Set Deadline */}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-secondary-blue mb-2">Set Week 6 Deadline</p>
                  <p className="text-xs text-gray-400 mb-2">Set to 11:59 PM WAT on the Week 6 date</p>
                  {selectedPlan.second_installment_deadline && (
                    <p className="text-xs text-gray-500 mb-2">
                      Current: {formatDate(selectedPlan.second_installment_deadline)}
                    </p>
                  )}
                  <input
                    type="datetime-local"
                    value={deadlineInput}
                    onChange={e => { setDeadlineInput(e.target.value); setDeadlineError(null); }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-blue mb-2"
                  />
                  {deadlineError && <p className="text-xs text-red-500 mb-2">{deadlineError}</p>}
                  <button
                    onClick={() => handleSetDeadline(selectedPlan.id)}
                    disabled={isSavingDeadline || !deadlineInput}
                    className="w-full bg-secondary-blue text-white text-sm font-semibold py-2 rounded-lg hover:bg-secondary-blue-dark disabled:opacity-50 transition-colors"
                  >
                    {isSavingDeadline ? 'Saving…' : 'Save Deadline'}
                  </button>
                </div>

                {/* Grace Period Review */}
                {selectedPlan.grace_period_requested && selectedPlan.grace_period_approved === null && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-amber-700 mb-2">⚠️ Grace Period Request</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {selectedPlan.grace_period_evidence || 'No evidence provided.'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGraceReview(selectedPlan.id, true)}
                        disabled={isReviewingGrace}
                        className="flex-1 bg-green-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleGraceReview(selectedPlan.id, false)}
                        disabled={isReviewingGrace}
                        className="flex-1 bg-red-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Approving extends deadline to {formatDate(selectedPlan.grace_period_expires_at)}
                    </p>
                  </div>
                )}

                {selectedPlan.grace_period_approved === true && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-green-600 font-semibold">✅ Grace period approved</p>
                    <p className="text-xs text-gray-400">Expires: {formatDate(selectedPlan.grace_period_expires_at)}</p>
                  </div>
                )}

                {selectedPlan.grace_period_approved === false && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-red-600 font-semibold">❌ Grace period rejected</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
