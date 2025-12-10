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
  const [showPassword, setShowPassword] = useState(false);
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

      // Redirect to account page
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific error messages
      if (err.response?.status === 401) {
        setError('Incorrect username or password. Please check your credentials and try again.');
      } else if (err.response?.status === 403) {
        const errorData = err.response?.data;
        if (errorData?.email_not_verified) {
          setError(`Please verify your email (${errorData.email}) before logging in. Check your inbox for the verification link. If you didn't receive it, you can request a new one.`);
        } else {
          const errorMsg = errorData?.detail || '';
          if (errorMsg.includes('email') || errorMsg.includes('verify')) {
            setError('Please verify your email address before logging in. Check your inbox for the verification link.');
          } else {
            setError('Your account is not active. Please contact support.');
          }
        }
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0]);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
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
              Login to access your account
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 animate-shake">
              <div className="flex items-start">
                <span className="text-2xl mr-3">⚠️</span>
                <div className="flex-1">
                  <h3 className="font-bold text-red-800 mb-1">Login Failed</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                  {error.includes('username or password') && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-xs text-red-600 mb-2">💡 Troubleshooting tips:</p>
                      <ul className="text-xs text-red-600 space-y-1 ml-4 list-disc">
                        <li>Check if Caps Lock is on</li>
                        <li>Make sure you're using the correct username or email</li>
                        <li>Try resetting your password if you've forgotten it</li>
                      </ul>
                    </div>
                  )}
                  {error.includes('verify your email') && (
                    <div className="mt-3">
                      <Link 
                        href="/resend-verification" 
                        className="text-xs text-red-800 hover:text-red-900 underline font-semibold"
                      >
                        Resend verification email →
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-600 ml-2"
                  aria-label="Close error"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

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
