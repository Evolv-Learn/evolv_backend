'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

export default function InstructorProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/profile/');
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
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
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-block mb-6">
          <Button variant="outline">
            ← Back to My Account
          </Button>
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-full border-4 border-secondary-blue overflow-hidden bg-gray-200 mx-auto md:mx-0">
                {profile?.profile_picture ? (
                  <img 
                    src={profile.profile_picture.startsWith('http') 
                      ? profile.profile_picture 
                      : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${profile.profile_picture}`
                    } 
                    alt={user?.first_name || user?.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary-blue text-white text-6xl font-bold">
                    {(user?.first_name?.[0] || user?.username?.[0] || 'I').toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-600 mb-1">Instructor Name</h2>
                <h1 className="text-3xl font-heading font-bold text-gray-900">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username}
                </h1>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-600 mb-1">Title</h2>
                <p className="text-lg text-gray-700">
                  {profile?.title || 'Data Science Instructor & Industry Expert'}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-600 mb-2">Bio</h2>
                <p className="text-gray-700 leading-relaxed">
                  {profile?.bio || `${user?.first_name || user?.username} is a seasoned instructor with extensive experience in teaching and industry. Passionate about making technology accessible to everyone and has developed several courses and training programs.`}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-600 mb-3">Contact:</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Email:</span>
                    <a 
                      href={`mailto:${profile?.email || user?.email}`}
                      className="text-secondary-blue hover:underline"
                    >
                      {profile?.email || user?.email}
                    </a>
                  </div>
                  
                  {profile?.twitter_url && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <a 
                        href={profile.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-blue hover:underline"
                      >
                        {profile.twitter_url}
                      </a>
                    </div>
                  )}
                  
                  {profile?.linkedin_url && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <a 
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-blue hover:underline"
                      >
                        {profile.linkedin_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Link href="/instructor/profile/edit">
                  <Button variant="outline">
                    ✏️ Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
