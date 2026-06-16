'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="kente-strip" />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-secondary-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-secondary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="text-2xl font-heading font-bold text-secondary-blue-dark mb-3">
              Check Your Email
            </h1>
            <p className="text-gray-500 mb-2 text-sm">
              We sent a verification link to:
            </p>
            <p className="text-base font-semibold text-primary-gold mb-7">
              {email}
            </p>

            {/* Steps */}
            <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left space-y-3">
              {[
                'Open your email inbox',
                'Find the email from Evolv',
                'Click the verification link',
                'Return here to login',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-secondary-blue text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>

            {/* Didn't receive */}
            <div className="border border-gray-100 rounded-xl p-4 mb-7 text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Didn't receive it?
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>Check your spam or junk folder</li>
                <li>Wait a few minutes for delivery</li>
                <li>Make sure you entered the correct email</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/resend-verification">
                <Button variant="outline" size="lg" className="w-full">
                  Resend Verification Email
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="primary" size="lg" className="w-full">
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-gold" /></div>}>
      <CheckEmailContent />
    </Suspense>
  );
}
