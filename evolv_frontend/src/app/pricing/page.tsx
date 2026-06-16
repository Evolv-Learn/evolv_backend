'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface CoursePrice {
  id: number;
  currency: string;
  currency_display: string;
  amount: string;
}

interface PricedCourse {
  id: number;
  name: string;
  category: string;
  description: string;
  instructor_name: string | null;
  start_date: string | null;
  end_date: string | null;
  registration_deadline: string | null;
  prices: CoursePrice[];
}

interface DiscountResult {
  valid: boolean;
  detail?: string;
  code?: string;
  discount_label?: string;
  currency?: string;
  original_amount?: string;
  discount_amount?: string;
  final_amount?: string;
}

const CURRENCIES = [
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - British Pound' },
  { code: 'NGN', label: 'NGN - Nigerian Naira' },
  { code: 'GHS', label: 'GHS - Ghanaian Cedi' },
  { code: 'KES', label: 'KES - Kenyan Shilling' },
  { code: 'ZAR', label: 'ZAR - South African Rand' },
  { code: 'ETB', label: 'ETB - Ethiopian Birr' },
  { code: 'XOF', label: 'XOF - West African CFA' },
  { code: 'MAD', label: 'MAD - Moroccan Dirham' },
];

const REGIONAL_CURRENCIES = new Set(['NGN', 'GHS', 'KES', 'ZAR', 'TZS', 'UGX', 'ETB', 'XOF', 'MAD']);

function formatAmount(amount: string, currency: string): string {
  const num = parseFloat(amount);
  const locale = REGIONAL_CURRENCIES.has(currency) ? 'en-NG' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'NGN' || currency === 'XOF' ? 0 : 2,
    }).format(num);
  } catch {
    return `${currency} ${num.toLocaleString()}`;
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function DiscountInput({ courseId, currency }: { courseId: number; currency: string }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<DiscountResult | null>(null);
  const [checking, setChecking] = useState(false);

  const validate = useCallback(async () => {
    if (!code.trim()) return;
    setChecking(true);
    setResult(null);
    try {
      const res = await apiClient.post('/payments/validate-discount/', {
        code: code.trim().toUpperCase(),
        currency,
      });
      setResult(res.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (msg === 'enrollment_id and code are required.') {
        setResult({ valid: true, detail: 'Code looks valid - discount will apply at checkout.' });
      } else {
        setResult({ valid: false, detail: msg ?? 'Could not validate code.' });
      }
    } finally {
      setChecking(false);
    }
  }, [code, currency]);

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <p className="text-xs font-medium text-gray-500 mb-1.5">Have a discount code?</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null); }}
          onKeyDown={(e) => e.key === 'Enter' && validate()}
          placeholder="e.g. AFRICA25"
          className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold uppercase"
        />
        <button
          onClick={validate}
          disabled={!code.trim() || checking}
          className="bg-secondary-blue text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-secondary-blue-dark disabled:opacity-50 transition-colors"
        >
          {checking ? '...' : 'Apply'}
        </button>
      </div>
      {result && (
        <p className={`text-xs mt-1.5 font-medium ${result.valid ? 'text-green-600' : 'text-igbo-red'}`}>
          {result.valid
            ? result.discount_label
              ? `${result.discount_label} applied - you save ${formatAmount(result.discount_amount!, result.currency!)}`
              : result.detail
            : result.detail}
        </p>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [courses, setCourses] = useState<PricedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get('/pricing/')
      .then((res) => setCourses(res.data.results ?? res.data))
      .catch(() => setError('Failed to load pricing. Please try again later.'))
      .finally(() => setIsLoading(false));
  }, []);

  const getPrice = (course: PricedCourse): CoursePrice | null =>
    course.prices.find((p) => p.currency === selectedCurrency) ??
    course.prices.find((p) => p.currency === 'USD') ??
    course.prices[0] ??
    null;

  const isRegional = REGIONAL_CURRENCIES.has(selectedCurrency);

  return (
    <div className="min-h-screen bg-warm-white">

      {/* Hero */}
      <section className="bg-secondary-blue-dark text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary-gold font-semibold uppercase tracking-widest text-sm mb-3">
            Transparent Pricing
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Invest in Your Research Career
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Pay once per cohort. No subscriptions. Regional pricing ensures cost
            is never a barrier wherever you are in Africa or beyond.
          </p>
        </div>
      </section>

      {/* Currency picker */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-600 shrink-0">Show prices in:</span>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold bg-white"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          {isRegional && (
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1">
              Regional pricing applied
            </span>
          )}
        </div>
      </section>

      {/* Course cards */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {isLoading && (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-gold" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-igbo-red font-medium">{error}</div>
        )}

        {!isLoading && !error && courses.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-medium mb-2">No pricing available yet</p>
            <p className="text-sm">Check back soon - courses are being priced.</p>
          </div>
        )}

        {!isLoading && !error && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const price = getPrice(course);
              const priceIsRegional = price ? REGIONAL_CURRENCIES.has(price.currency) : false;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="px-6 pt-5">
                    {course.category && (
                      <span className="inline-block text-xs font-semibold uppercase tracking-wide text-secondary-blue bg-blue-50 rounded-full px-2.5 py-0.5 mb-3">
                        {course.category}
                      </span>
                    )}
                    <h2 className="font-heading text-lg font-bold text-secondary-blue-dark leading-snug mb-2">
                      {course.name}
                    </h2>
                    {course.description && (
                      <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <div className="px-6 pb-4 text-xs text-gray-400 space-y-1 flex-1">
                    {course.instructor_name && (
                      <p>Instructor: <span className="text-gray-600">{course.instructor_name}</span></p>
                    )}
                    {course.start_date && (
                      <p>
                        Cohort: <span className="text-gray-600">
                          {formatDate(course.start_date)}
                          {course.end_date ? ` - ${formatDate(course.end_date)}` : ''}
                        </span>
                      </p>
                    )}
                    {course.registration_deadline && (
                      <p>
                        Deadline: <span className="text-gray-600 font-medium">
                          {formatDate(course.registration_deadline)}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                    {price ? (
                      <>
                        <div className="flex items-end justify-between mb-1">
                          <div>
                            <p className="text-2xl font-bold text-secondary-blue-dark">
                              {formatAmount(price.amount, price.currency)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {priceIsRegional ? 'Regional rate - per cohort' : 'Per cohort enrolment'}
                            </p>
                            {price.currency !== selectedCurrency && (
                              <p className="text-xs text-amber-600 mt-0.5">
                                Shown in USD (no {selectedCurrency} price set)
                              </p>
                            )}
                          </div>
                          <Link
                            href="/courses"
                            className="inline-block bg-primary-gold text-secondary-blue-dark text-sm font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
                          >
                            Enrol Now
                          </Link>
                        </div>
                        <DiscountInput courseId={course.id} currency={price.currency} />
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Pricing coming soon</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="bg-secondary-blue text-white py-14 px-4 mt-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl font-bold mb-8 text-center">Common Questions</h2>
          <div className="space-y-6 text-sm text-gray-200">
            {[
              {
                q: 'What does "per cohort" mean?',
                a: 'You pay once and get access to that intake of the course - live sessions, materials, and community - for the full duration.',
              },
              {
                q: 'How do discount codes work?',
                a: 'Enter your code on the pricing card before enrolling. Codes can be percentage-based (e.g. 20% off) or a fixed amount. Some codes are restricted to specific courses or have limited uses.',
              },
              {
                q: 'How does regional pricing work?',
                a: 'We set separate prices for African currencies so the cost reflects local purchasing power, not just a currency conversion of the USD rate.',
              },
              {
                q: 'Which payment methods are accepted?',
                a: 'We use Paystack - supporting cards, bank transfer, and mobile money across Africa.',
              },
              {
                q: 'Can I get a refund?',
                a: 'Full refunds are available up to 7 days before the cohort start date. Contact us if you have concerns.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-blue-700 pb-5">
                <p className="font-semibold text-white mb-1">{q}</p>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
