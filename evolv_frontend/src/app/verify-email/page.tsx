'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await apiClient.post('/verify-email/', { token });
      setStatus('success');
      setMessage(response.data.message);
      setEmail(response.data.email);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white pattern-adire py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="kente-strip mb-6"></div>
          
          {status === 'verifying' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-gold mx-auto mb-6"></div>
              <h1 className="text-2xl font-heading font-bold text-secondary-blue mb-2">
                Verifying Your Email...
              </h1>
              <p className="text-gray-600">Please wait while we verify your email address.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="text-6xl mb-6">✅</div>
              <h1 className="text-3xl font-heading font-bold text-success mb-4">
                Email Verified!
              </h1>
              <p className="text-gray-700 mb-6">
                {message}
              </p>
              {email && (
                <p className="text-sm text-gray-600 mb-6">
                  Your account ({email}) is now active.
                </p>
              )}
              <Link href="/login">
                <Button variant="primary" size="lg" className="w-full">
                  Login to Your Account →
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="text-6xl mb-6">❌</div>
              <h1 className="text-3xl font-heading font-bold text-red-600 mb-4">
                Verification Failed
              </h1>
              <p className="text-gray-700 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Link href="/resend-verification">
                  <Button variant="primary" size="lg" className="w-full">
                    Resend Verification Email
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="w-full">
                    Register Again
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
