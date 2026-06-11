'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { assignmentsApi, liveSessionsApi } from '@/lib/api/courses';
import apiClient from '@/lib/api/client';

interface Assignment {
  id: number;
  module: number;
  module_title: string;
  github_url: string;
  notes: string;
  submitted_at: string;
  updated_at: string;
  status: 'Submitted' | 'Under Review' | 'Returned' | 'Passed';
  instructor_feedback: string;
}

interface Module {
  id: number;
  title: string;
  order: number;
}

const STATUS_STYLES: Record<string, string> = {
  Submitted: 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-yellow-100 text-yellow-700',
  Returned: 'bg-red-100 text-red-700',
  Passed: 'bg-green-100 text-green-700',
};

export default function AssignmentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ module: '', github_url: '', notes: '' });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [assignData, studentData] = await Promise.all([
        assignmentsApi.getAll(),
        apiClient.get('/students/me/'),
      ]);
      setAssignments(assignData);

      // Load modules from enrolled schedules
      const scheduleIds: number[] = studentData.data.schedules ?? [];
      if (scheduleIds.length > 0) {
        const modRes = await apiClient.get('/modules/', { params: { schedule: scheduleIds[0] } });
        setModules(modRes.data.results || modRes.data);
      }
    } catch {
      // student profile may not exist yet — that's fine
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.module) { setError('Please select a module.'); return; }
    if (!form.github_url) { setError('Please provide a GitHub or file link.'); return; }

    setSubmitting(true);
    try {
      await assignmentsApi.submit({
        module: Number(form.module),
        github_url: form.github_url,
        notes: form.notes,
      });
      setSuccess('Assignment submitted. Your instructor will review it shortly.');
      setForm({ module: '', github_url: '', notes: '' });
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.detail
        || err?.response?.data?.module?.[0]
        || 'Submission failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-1">
              My Assignments
            </h1>
            <p className="text-gray-600">
              Submit your exercise links here. Your instructor reviews every submission and leaves feedback.
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Cancel' : '+ Submit Assignment'}
          </Button>
        </div>

        {/* Submission form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="kente-strip mb-5"></div>
            <h2 className="text-xl font-heading font-bold text-secondary-blue mb-5">
              New Submission
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Module <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.module}
                  onChange={e => setForm(f => ({ ...f, module: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-gold text-gray-800"
                >
                  <option value="">Select a module...</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>
                      Module {m.order} — {m.title}
                    </option>
                  ))}
                </select>
                {modules.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No modules loaded yet. Make sure you are enrolled in a schedule.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GitHub / File Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={form.github_url}
                  onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))}
                  placeholder="https://github.com/yourusername/your-script.R"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-gold"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste a link to your R script on GitHub, Google Drive, or any public URL.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes to instructor <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any specific questions, things you got stuck on, or context you want to share..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-gold resize-none"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </form>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Assignment list */}
        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">No assignments submitted yet</p>
            <p className="text-gray-400 text-sm">
              Once you work through a module, submit your exercise link above and your instructor will review it.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map(a => (
              <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-heading font-bold text-secondary-blue">{a.module_title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Submitted {formatDate(a.submitted_at)}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLES[a.status]}`}>
                    {a.status}
                  </span>
                </div>

                {a.github_url && (
                  <a
                    href={a.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-gold hover:underline break-all block mb-3"
                  >
                    {a.github_url}
                  </a>
                )}

                {a.notes && (
                  <div className="bg-warm-white rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Your notes</p>
                    <p className="text-sm text-gray-700">{a.notes}</p>
                  </div>
                )}

                {a.instructor_feedback && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                    <p className="text-xs text-green-700 font-semibold mb-1">Instructor feedback</p>
                    <p className="text-sm text-gray-700">{a.instructor_feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
