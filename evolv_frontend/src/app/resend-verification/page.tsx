'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await apiClient.post('/resend-verification/', { email });
      setStatus('success');
      setMessage(response.data.message);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white pattern-adire py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="kente-strip mb-6"></div>
          
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-2">
              Resend Verification Email
            </h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you a new verification link
            </p>
          </div>

          {status === 'success' && (
            <div className="bg-green-50 border-l-4 border-success p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <h3 className="font-bold text-success mb-1">Email Sent!</h3>
                  <p className="text-green-700 text-sm">{message}</p>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <span className="text-2xl mr-3">⚠️</span>
                <div>
                  <h3 className="font-bold text-red-800 mb-1">Error</h3>
                  <p className="text-red-700 text-sm">{message}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Resend Verification Email
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-600">
              Already verified?{' '}
              <Link href="/login" className="text-primary-gold hover:underline font-semibold">
                Login here
              </Link>
            </p>
            <p className="text-gray-600">
              Need help?{' '}
              <Link href="/contact" className="text-primary-gold hover:underline font-semibold">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
