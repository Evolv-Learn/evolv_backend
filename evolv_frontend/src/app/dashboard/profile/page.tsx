'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
      });
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Update profile via API
      const response = await authApi.getProfile();
      setUser(response.user);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="kente-strip mb-6"></div>
          
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-heading font-bold text-secondary-blue">
              My Profile
            </h1>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('success') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Profile Picture */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-primary-gold rounded-full flex items-center justify-center text-white text-5xl font-bold">
                {user.first_name?.[0] || user.username?.[0] || 'U'}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-secondary-blue text-white p-2 rounded-full hover:bg-secondary-blue-dark">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="Last Name"
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <Input
              label="Username"
              type="text"
              value={formData.username}
              disabled={true}
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              disabled={true}
            />

            {/* Account Info */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-heading font-semibold mb-4">Account Information</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Account Type</p>
                  <p className="font-semibold">Student</p>
                </div>
                <div>
                  <p className="text-gray-600">Member Since</p>
                  <p className="font-semibold">January 2024</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                    Pending
                  </span>
                </div>
                <div>
                  <p className="text-gray-600">User ID</p>
                  <p className="font-semibold">#{user.id}</p>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>

          {/* Change Password Section */}
          <div className="border-t mt-8 pt-6">
            <h3 className="text-xl font-heading font-semibold mb-4">Security</h3>
            <Button variant="outline">
              Change Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
