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
        
        console.log('âœ… Final user data to store:', userData);
        setUser(userData);
      } catch (profileError) {
        console.error('âŒ Profile fetch error:', profileError);
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
    <div className="min-h-screen flex bg-warm-white">

      {/* Left brand panel â€” hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] bg-secondary-blue relative flex-col justify-between overflow-hidden p-12">
        <div className="absolute inset-0 pattern-adire opacity-10" />
        <div className="kente-strip absolute top-0 left-0 right-0" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center">
            <span className="text-white font-heading font-bold text-lg">E</span>
          </div>
          <span className="text-white font-heading font-bold text-2xl">Evolv</span>
        </div>

        {/* Centre message */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-heading font-bold text-white leading-snug">
            Good to have you back.
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Your cohort is waiting. Pick up right where you left off.
          </p>

          {/* Mini testimonial */}
          <div className="border-l-2 border-primary-gold pl-5 mt-8">
            <p className="text-gray-200 italic text-sm leading-relaxed">
              "The live sessions on Discord made all the difference. It felt like sitting beside a mentor."
            </p>
            <p className="text-primary-gold text-xs font-semibold mt-2">Ibrahim Bello Â· PhD Candidate, ABU Zaria</p>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-gray-500 text-xs">
          Practical research training for African scientists.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center py-12 px-6 lg:px-16">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 bg-primary-gold rounded-full flex items-center justify-center">
              <span className="text-white font-heading font-bold">E</span>
            </div>
            <span className="font-heading font-bold text-secondary-blue text-xl">Evolv</span>
          </div>

          <div className="kente-strip rounded-full mb-8" />

          <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-1">Welcome Back</h1>
          <p className="text-gray-500 text-sm mb-8">Login to access your account</p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-red-800 text-sm mb-0.5">Login Failed</p>
                  <p className="text-red-700 text-sm">{error}</p>
                  {error.includes('username or password') && (
                    <ul className="text-xs text-red-600 mt-2 space-y-0.5 ml-3 list-disc">
                      <li>Check Caps Lock</li>
                      <li>Use your username or email</li>
                      <li><Link href="/forgot-password" className="underline">Reset your password</Link></li>
                    </ul>
                  )}
                  {error.includes('verify your email') && (
                    <Link href="/resend-verification" className="text-xs text-red-800 underline font-semibold mt-1 block">
                      Resend verification email â†’
                    </Link>
                  )}
                </div>
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username or Email"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter your username or email"
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-primary-gold" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary-gold hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary-gold hover:underline font-semibold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
