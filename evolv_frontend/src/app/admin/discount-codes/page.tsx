'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { useRequireAuth } from '@/lib/auth/useRequireAuth';

interface DiscountCode {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  discount_label: string;
  max_uses: number | null;
  uses_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  courses: number[];
}

const EMPTY_FORM = {
  code: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: '',
  max_uses: '',
  valid_from: '',
  valid_until: '',
  is_active: true,
  courses: [] as number[],
};

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `EVOLVLEARN-${rand}`;
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DiscountCodesPage() {
  const router = useRouter();
  const isAuthReady = useRequireAuth();
  const { user, isAuthenticated } = useAuthStore();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
      router.replace('/dashboard');
      return;
    }
    load();
  }, [isAuthenticated, isAuthReady, user]);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/discount-codes/');
      setCodes(res.data.results ?? res.data);
    } catch {
      setError('Failed to load discount codes.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (code: DiscountCode) => {
    setEditingId(code.id);
    setForm({
      code: code.code,
      discount_type: code.discount_type,
      discount_value: code.discount_value,
      max_uses: code.max_uses != null ? String(code.max_uses) : '',
      valid_from: code.valid_from ? code.valid_from.slice(0, 16) : '',
      valid_until: code.valid_until ? code.valid_until.slice(0, 16) : '',
      is_active: code.is_active,
      courses: code.courses,
    });
    setError(null);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.discount_value) {
      setError('Discount value is required.');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      is_active: form.is_active,
      courses: form.courses,
    };
    try {
      if (editingId) {
        await apiClient.patch(`/admin/discount-codes/${editingId}/`, payload);
      } else {
        await apiClient.post('/admin/discount-codes/', payload);
      }
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      setError(
        data
          ? Object.values(data).flat().join(' ')
          : 'Failed to save. Please check the fields and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (code: DiscountCode) => {
    try {
      await apiClient.patch(`/admin/discount-codes/${code.id}/`, { is_active: !code.is_active });
      setCodes((prev) => prev.map((c) => c.id === code.id ? { ...c, is_active: !c.is_active } : c));
    } catch {
      setError('Failed to update status.');
    }
  };

  const deleteCode = async (id: number) => {
    try {
      await apiClient.delete(`/admin/discount-codes/${id}/`);
      setCodes((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch {
      setError('Failed to delete code.');
    }
  };

  return (
    <div className="min-h-screen bg-warm-white p-6">
      <div className="max-w-5xl mx-auto">

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-secondary-blue-dark">Discount Codes</h1>
            <p className="text-gray-500 text-sm mt-1">Create and manage promotional codes for course enrolments.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-primary-gold text-secondary-blue-dark font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Code
            </button>
          </div>
        </div>

        {error && !showForm && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-gold" />
          </div>
        ) : codes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 text-center py-16 text-gray-400">
            <p className="text-lg font-medium mb-1">No discount codes yet</p>
            <p className="text-sm">Click "New Code" to create your first one.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Code</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Discount</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Uses</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Expires</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-secondary-blue tracking-wider">
                        {code.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{code.discount_label}</td>
                    <td className="px-5 py-4 text-gray-500">
                      {code.uses_count}
                      {code.max_uses != null && (
                        <span className="text-gray-400"> / {code.max_uses}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{formatDate(code.valid_until)}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive(code)}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                          code.is_active
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${code.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {code.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(code)}
                          className="text-xs text-secondary-blue hover:underline font-medium"
                        >
                          Edit
                        </button>
                        {deleteConfirm === code.id ? (
                          <span className="flex items-center gap-1.5">
                            <button
                              onClick={() => deleteCode(code.id)}
                              className="text-xs text-red-600 font-semibold hover:underline"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs text-gray-400 hover:underline"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(code.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-heading text-xl font-bold text-secondary-blue-dark mb-5">
              {editingId ? 'Edit Discount Code' : 'New Discount Code'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Code <span className="font-normal text-gray-400">(leave blank to auto-generate)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="Auto-generated"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, code: generateCode() })}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 transition-colors whitespace-nowrap"
                    title="Generate a random code"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Generate
                  </button>
                </div>
                {!form.code && (
                  <p className="text-xs text-gray-400 mt-1">A code like <span className="font-mono">EVOLVLEARN-X8K2MN</span> will be created automatically.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Type *</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Value * {form.discount_type === 'percentage' ? '(0–100)' : '(USD equiv.)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={form.discount_type === 'percentage' ? 100 : undefined}
                    step="0.01"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Max Uses <span className="font-normal text-gray-400">(leave blank for unlimited)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  placeholder="Unlimited"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Valid From</label>
                  <input
                    type="datetime-local"
                    value={form.valid_from}
                    onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Expires</label>
                  <input
                    type="datetime-local"
                    value={form.valid_until}
                    onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 accent-primary-gold"
                />
                <span className="text-sm text-gray-700 font-medium">Active (students can use this code)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 bg-primary-gold text-secondary-blue-dark font-semibold py-2.5 rounded-lg hover:bg-yellow-400 disabled:opacity-60 transition-colors"
              >
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Code'}
              </button>
              <button
                onClick={() => { setShowForm(false); setError(null); }}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
