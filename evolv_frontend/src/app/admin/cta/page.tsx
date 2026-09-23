'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useRequireAuth } from '@/lib/auth/useRequireAuth';

interface CTAButton {
  cta_name: string;
  count: number;
}

interface DailyEntry {
  day: string;
  cta_name: string;
  count: number;
}

interface CTAStats {
  period_days: number;
  total_clicks: number;
  by_button: CTAButton[];
  daily_breakdown: DailyEntry[];
}

const CTA_LABELS: Record<string, string> = {
  apply_hero:          'Apply — Hero Section',
  view_programmes:     'View Programmes — Hero',
  apply_final_cta:     'Apply — Final CTA Section',
  ask_question:        'Ask a Question',
  view_all_programmes: 'View All Programmes',
  register_event:      'Register for Event',
  contact_us:          'Contact Us',
  login:               'Login',
  register:            'Register / Sign Up',
  apply_course:        'Apply — Course Page',
  other:               'Other',
};

function label(name: string) {
  return CTA_LABELS[name] ?? name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function CTAAnalyticsPage() {
  const router = useRouter();
  const isAuthReady = useRequireAuth();

  const [stats, setStats] = useState<CTAStats | null>(null);
  const [days, setDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthReady) return;
    fetchStats();
  }, [isAuthReady, days]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/admin/cta/stats/?days=${days}`);
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch CTA stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group daily breakdown by date
  const dailyTotals: Record<string, number> = {};
  stats?.daily_breakdown.forEach(entry => {
    dailyTotals[entry.day] = (dailyTotals[entry.day] ?? 0) + entry.count;
  });
  const sortedDays = Object.entries(dailyTotals).sort((a, b) => a[0].localeCompare(b[0]));
  const maxDayCount = Math.max(...sortedDays.map(([, c]) => c), 1);

  // Top page per CTA
  const pageMap: Record<string, Record<string, number>> = {};
  // (not stored per-page in current backend — placeholder for future)

  const topButton = stats?.by_button[0];
  const busiest = sortedDays.reduce((best, cur) => cur[1] > best[1] ? cur : best, ['—', 0]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading CTA analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-1">
              CTA Analytics 📊
            </h1>
            <p className="text-gray-600">
              Visitor button clicks across evolvlearn.com
            </p>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show last:</span>
            {[7, 14, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  days === d
                    ? 'bg-secondary-blue text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-warm-white'
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-primary-gold">
            <div className="text-sm text-gray-500 mb-1">Total Clicks</div>
            <div className="text-3xl font-bold text-primary-gold">
              {stats?.total_clicks ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">Last {days} days</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-secondary-blue">
            <div className="text-sm text-gray-500 mb-1">Buttons Tracked</div>
            <div className="text-3xl font-bold text-secondary-blue">
              {stats?.by_button.length ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">Unique CTAs clicked</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-success">
            <div className="text-sm text-gray-500 mb-1">Top Button</div>
            <div className="text-lg font-bold text-success leading-tight mt-1">
              {topButton ? label(topButton.cta_name) : '—'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {topButton ? `${topButton.count} clicks` : 'No data yet'}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-hausa-indigo">
            <div className="text-sm text-gray-500 mb-1">Busiest Day</div>
            <div className="text-lg font-bold text-hausa-indigo leading-tight mt-1">
              {busiest[0] === '—' ? '—' : new Date(busiest[0]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {busiest[1] > 0 ? `${busiest[1]} clicks` : 'No data yet'}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* Clicks by Button */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-heading font-bold text-secondary-blue mb-6">
              Clicks by Button
            </h2>

            {!stats?.by_button.length ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-5xl mb-3">🖱️</div>
                <p>No clicks recorded yet.</p>
                <p className="text-sm mt-1">Clicks will appear as visitors interact with the website.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.by_button.map(item => {
                  const pct = stats.total_clicks > 0
                    ? Math.round((item.count / stats.total_clicks) * 100)
                    : 0;
                  return (
                    <div key={item.cta_name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-800">{label(item.cta_name)}</span>
                        <span className="text-gray-500 tabular-nums">
                          {item.count} click{item.count !== 1 ? 's' : ''} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-primary-gold h-3 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily Trend */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-heading font-bold text-secondary-blue mb-6">
              Daily Trend (Last 7 Days)
            </h2>

            {sortedDays.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-5xl mb-3">📅</div>
                <p>No daily data yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedDays.slice(-7).map(([day, count]) => {
                  const pct = Math.round((count / maxDayCount) * 100);
                  return (
                    <div key={day}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">
                          {new Date(day).toLocaleDateString('en-GB', {
                            weekday: 'short', day: 'numeric', month: 'short'
                          })}
                        </span>
                        <span className="text-gray-500 tabular-nums">{count} click{count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-secondary-blue h-3 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Full breakdown table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-heading font-bold text-secondary-blue mb-6">
            Full Breakdown
          </h2>

          {!stats?.by_button.length ? (
            <div className="text-center py-8 text-gray-400">
              <p>No data available for the selected period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-blue text-white">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold">#</th>
                    <th className="px-5 py-4 text-left font-semibold">Button</th>
                    <th className="px-5 py-4 text-right font-semibold">Clicks</th>
                    <th className="px-5 py-4 text-right font-semibold">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.by_button.map((item, idx) => {
                    const pct = stats.total_clicks > 0
                      ? Math.round((item.count / stats.total_clicks) * 100)
                      : 0;
                    return (
                      <tr key={item.cta_name} className="hover:bg-warm-white transition-colors">
                        <td className="px-5 py-4 text-gray-400">{idx + 1}</td>
                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {label(item.cta_name)}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-primary-gold tabular-nums">
                          {item.count}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-500 tabular-nums">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-5 py-4" colSpan={2}>Total</td>
                    <td className="px-5 py-4 text-right text-primary-gold tabular-nums">
                      {stats.total_clicks}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-500">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
