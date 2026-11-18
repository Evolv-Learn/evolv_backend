'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/lib/api/client';

interface Recipient {
  email: string;
  full_name: string;
}

type Step = 'compose' | 'preview' | 'sending' | 'done';

const DEFAULT_MESSAGE = `Hi {full_name},

Registration for our R for Quantitative Research cohort closes this Saturday, 29 November 2026. We did not want you to miss it.

This is a live, hands-on programme for researchers, Master's and PhD students who want to handle their own data with confidence.

To register: Visit evolvlearn.org → Admission → select the course → complete payment.

Payment options available:
- Full payment at checkout, or
- Instalment — pay 50% now, 50% by Week 6

Spots are limited. If you have any difficulty registering or paying, email us at evolvngo@gmail.com and we will help you.

Warm regards,
The EvolvLearn Team`;

export default function BroadcastPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState<Step>('compose');
  const [subject, setSubject] = useState('Registration closes 29 November — R for Quantitative Research');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [totalRecipients, setTotalRecipients] = useState<number | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllRecipients, setShowAllRecipients] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (!user?.is_staff && !user?.is_superuser) { router.replace('/dashboard'); return; }
  }, [isAuthenticated, user]);

  const handlePreview = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required.');
      return;
    }
    setError(null);
    setIsLoadingPreview(true);
    try {
      const res = await apiClient.get('/admin/broadcast/preview/');
      setRecipients(res.data.recipients);
      setTotalRecipients(res.data.total);
      setStep('preview');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not load recipients. Please try again.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    setStep('sending');
    setError(null);
    try {
      const res = await apiClient.post('/admin/broadcast/send/', {
        subject,
        message,
        preview_only: false,
      });
      setResult(res.data);
      setStep('done');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Send failed. Please try again.');
      setStep('preview');
    } finally {
      setIsSending(false);
    }
  };

  const previewMessage = message.replace(
    '{full_name}',
    recipients[0]?.full_name || 'John Doe'
  );

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">

        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-secondary-blue">
            Broadcast Email
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Send a personalised email to all registered users and event registrants.
            Duplicate emails are automatically removed.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step: Compose */}
        {step === 'compose' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-blue"
                placeholder="Email subject"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Message *
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Use <code className="bg-gray-100 px-1 rounded">{'{full_name}'}</code> where you want the recipient's name to appear.
              </p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={16}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-blue font-mono"
                placeholder="Write your message here..."
              />
            </div>

            <button
              onClick={handlePreview}
              disabled={isLoadingPreview || !subject.trim() || !message.trim()}
              className="bg-secondary-blue text-white font-semibold px-8 py-3 rounded-xl hover:bg-secondary-blue-dark disabled:opacity-50 transition-colors"
            >
              {isLoadingPreview ? 'Loading recipients…' : 'Preview & Review →'}
            </button>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="space-y-5">

            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-secondary-blue text-lg mb-4">Review before sending</h2>
              <div className="grid sm:grid-cols-3 gap-4 text-center mb-5">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-secondary-blue">{totalRecipients}</p>
                  <p className="text-xs text-gray-500 mt-1">Total recipients</p>
                </div>
                <div className="bg-warm-white rounded-xl p-4 sm:col-span-2">
                  <p className="text-sm font-semibold text-gray-700">Subject</p>
                  <p className="text-sm text-gray-600 mt-1">{subject}</p>
                </div>
              </div>

              {/* Message preview */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Message preview (personalised for first recipient)
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                  {previewMessage}
                </div>
              </div>
            </div>

            {/* Recipient list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-secondary-blue">
                  Recipients ({totalRecipients})
                </h2>
                <button
                  onClick={() => setShowAllRecipients(!showAllRecipients)}
                  className="text-xs text-primary-gold font-semibold hover:underline"
                >
                  {showAllRecipients ? 'Show less' : 'Show all'}
                </button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {(showAllRecipients ? recipients : recipients.slice(0, 10)).map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.full_name}</p>
                      <p className="text-xs text-gray-400">{r.email}</p>
                    </div>
                  </div>
                ))}
                {!showAllRecipients && recipients.length > 10 && (
                  <p className="text-xs text-gray-400 text-center pt-2">
                    ... and {recipients.length - 10} more
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('compose')}
                className="border border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl hover:border-gray-300 transition-colors"
              >
                ← Edit Message
              </button>
              <button
                onClick={handleSend}
                className="bg-primary-gold text-secondary-blue-dark font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors flex-1"
              >
                Send to {totalRecipients} recipients →
              </button>
            </div>
          </div>
        )}

        {/* Step: Sending */}
        {step === 'sending' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-primary-gold mx-auto mb-6" />
            <h2 className="text-xl font-heading font-bold text-secondary-blue mb-2">
              Sending emails…
            </h2>
            <p className="text-gray-500 text-sm">
              Please do not close this page. Sending {totalRecipients} emails.
            </p>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && result && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-2">
              Broadcast Complete
            </h2>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mt-6 mb-8">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-600">{result.sent}</p>
                <p className="text-xs text-gray-500 mt-1">Sent</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-red-500">{result.failed}</p>
                <p className="text-xs text-gray-500 mt-1">Failed</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-secondary-blue">{result.total}</p>
                <p className="text-xs text-gray-500 mt-1">Total</p>
              </div>
            </div>
            <button
              onClick={() => {
                setStep('compose');
                setResult(null);
                setRecipients([]);
                setTotalRecipients(null);
              }}
              className="border border-secondary-blue text-secondary-blue font-semibold px-6 py-2.5 rounded-xl hover:bg-secondary-blue hover:text-white transition-colors"
            >
              Send Another Broadcast
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
