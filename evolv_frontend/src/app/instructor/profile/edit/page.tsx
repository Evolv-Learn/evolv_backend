'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

export default function EditInstructorProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    email: '',
    twitter_url: '',
    linkedin_url: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/profile/');
      setFormData({
        title: response.data.title || '',
        bio: response.data.bio || '',
        email: response.data.email || '',
        twitter_url: response.data.twitter_url || '',
        linkedin_url: response.data.linkedin_url || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      await apiClient.patch('/profile/', formData);
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        router.push('/instructor/profile');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setMessage(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back Button */}
        <Link href="/instructor/profile" className="inline-block mb-6">
          <Button variant="outline">
            ← Back to Profile
          </Button>
        </Link>

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-6">
            Edit Profile
          </h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('success') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <Input
                  label="Professional Title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Data Science Instructor & Industry Expert"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                    placeholder="Tell students about your experience, expertise, and teaching philosophy..."
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <Input
                  label="Contact Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                />

                <Input
                  label="Twitter/X URL"
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  placeholder="https://x.com/yourusername"
                />

                <Input
                  label="LinkedIn URL"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </div>
            </div>

            {/* Profile Picture Note */}
            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Picture</h2>
              <p className="text-sm text-gray-600 mb-4">
                To update your profile picture, please contact the administrator.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href="/instructor/profile" className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
