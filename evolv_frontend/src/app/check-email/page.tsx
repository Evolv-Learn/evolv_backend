'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white pattern-adire py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="kente-strip mb-6"></div>
          
          <div className="text-center">
            <div className="text-6xl mb-6">📧</div>
            <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-4">
              Check Your Email
            </h1>
            <p className="text-gray-700 mb-6 leading-relaxed">
              We've sent a verification link to:
            </p>
            <p className="text-lg font-bold text-primary-gold mb-6">
              {email}
            </p>
            <div className="bg-blue-50 border-l-4 border-secondary-blue p-4 rounded-lg mb-6 text-left">
              <h3 className="font-bold text-secondary-blue mb-2">📋 Next Steps:</h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Open your email inbox</li>
                <li>Find the email from EvolvLearn</li>
                <li>Click the verification link</li>
                <li>Return here to login</li>
              </ol>
            </div>

            <div className="bg-warm-white p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2">
                ⏰ Didn't receive the email?
              </p>
              <ul className="text-xs text-gray-600 space-y-1 text-left">
                <li>• Check your spam/junk folder</li>
                <li>• Wait a few minutes for delivery</li>
                <li>• Make sure you entered the correct email</li>
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
    <Suspense fallback={<div>Loading...</div>}>
      <CheckEmailContent />
    </Suspense>
  );
}
