'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';

export default function AdminEditUserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  const [formData, setFormData] = useState({
    role: 'Student',
    title: '',
    bio: '',
    email: '',
    twitter_url: '',
    linkedin_url: '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [currentPictureUrl, setCurrentPictureUrl] = useState<string>('');

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/profile/`);
      const data = response.data;
      
      setUserData({
        username: data.username || '',
        email: data.user_email || data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
      });
      
      setFormData({
        role: data.role || 'Student',
        title: data.title || '',
        bio: data.bio || '',
        email: data.email || '',
        twitter_url: data.twitter_url || '',
        linkedin_url: data.linkedin_url || '',
      });
      
      setCurrentPictureUrl(data.profile_picture || '');
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setMessage('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const data = new FormData();
      data.append('role', formData.role);
      data.append('title', formData.title);
      data.append('bio', formData.bio);
      data.append('email', formData.email);
      data.append('twitter_url', formData.twitter_url);
      data.append('linkedin_url', formData.linkedin_url);
      
      if (profilePicture) {
        data.append('profile_picture', profilePicture);
      }

      await apiClient.patch(`/admin/users/${userId}/profile/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        router.push('/admin/users');
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
        <Link href="/admin/users" className="inline-block mb-6">
          <Button variant="outline">
            ← Back to Users
          </Button>
        </Link>

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-2">
            Edit User Profile
          </h1>
          <p className="text-gray-600 mb-6">
            Editing profile for: <span className="font-semibold">{userData.username}</span> ({userData.email})
          </p>

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
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                required
              >
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>

            {/* Profile Picture Upload */}
            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Picture</h2>
              
              {/* Current Picture Preview */}
              {currentPictureUrl && !profilePicture && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Current Picture:</p>
                  <img
                    src={currentPictureUrl}
                    alt="Current profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-gold"
                  />
                </div>
              )}

              {/* New Picture Preview */}
              {profilePicture && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">New Picture Preview:</p>
                  <img
                    src={URL.createObjectURL(profilePicture)}
                    alt="New profile preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-gold"
                  />
                </div>
              )}

              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        setMessage('Image size must be less than 5MB');
                        return;
                      }
                      setProfilePicture(file);
                      setMessage('');
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: Square image, at least 400x400px, max 5MB
                </p>
              </div>

              {profilePicture && (
                <button
                  type="button"
                  onClick={() => setProfilePicture(null)}
                  className="mt-3 text-sm text-red-600 hover:text-red-800"
                >
                  Remove selected image
                </button>
              )}
            </div>

            {/* Professional Info (for Instructors) */}
            {formData.role === 'Instructor' && (
              <div className="pt-6 border-t">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Information</h2>
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
                      placeholder="Professional biography..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <Input
                  label="Contact Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@example.com"
                />

                <Input
                  label="Twitter/X URL"
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  placeholder="https://x.com/username"
                />

                <Input
                  label="LinkedIn URL"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
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
              <Link href="/admin/users" className="flex-1">
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
