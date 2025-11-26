'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login(formData);
      
      // Store tokens
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);

      // Get user profile
      try {
        console.log('=== Login: Fetching user profile ===');
        
        const profile = await authApi.getProfile();
        console.log('Profile data:', profile);
        
        // Profile now includes is_superuser and is_staff
        const userData = {
          id: profile?.user?.id || profile?.id,
          username: profile?.username || profile?.user?.username,
          email: profile?.email || profile?.user?.email,
          first_name: profile?.first_name || profile?.user?.first_name || '',
          last_name: profile?.last_name || profile?.user?.last_name || '',
          is_superuser: profile?.is_superuser || false,
          is_staff: profile?.is_staff || false,
        };
        
        console.log('✅ Final user data to store:', userData);
        setUser(userData);
      } catch (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        // If profile fetch fails, create basic user from login
        setUser({
          id: 0,
          username: formData.username,
          email: formData.username,
          first_name: '',
          last_name: '',
          is_superuser: false,
          is_staff: false,
        });
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific error messages
      if (err.response?.status === 401) {
        setError('Invalid username/email or password. Please check your credentials and try again.');
      } else if (err.response?.status === 403) {
        setError('Your account is not active. Please contact support.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0]);
      } else if (err.message) {
        setError(`Login failed: ${err.message}`);
      } else {
        setError('Unable to connect to server. Please check your internet connection and try again.');
      }
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
            <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Login to access your learning dashboard
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <span className="text-2xl mr-3">⚠️</span>
                <div>
                  <h3 className="font-bold text-red-800 mb-1">Login Failed</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username or Email"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter your username"
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary-gold hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Login
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary-gold hover:underline font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
