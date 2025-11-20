'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchStudentProfile();
    }
  }, [isAuthenticated, router]);

  const fetchStudentProfile = async () => {
    try {
      const response = await apiClient.get('/students/me/');
      setStudentProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch student profile:', error);
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

  if (!studentProfile) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Application Found</h2>
          <p className="text-gray-600 mb-6">
            You haven't submitted an application yet. Apply now to get started!
          </p>
          <Link href="/admission">
            <Button variant="primary">Apply Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
                My Profile
              </h1>
              <p className="text-gray-600">View and manage your application details</p>
            </div>
            <Link href="/admission">
              <Button variant="outline">
                ✏️ Update Application
              </Button>
            </Link>
          </div>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border-l-4 border-success p-4 rounded-lg">
            <p className="text-success font-semibold">{message}</p>
          </div>
        )}

        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
            Personal Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-3 bg-warm-white rounded">
              <span className="text-2xl">👤</span>
              <div>
                <p className="text-xs text-gray-600">Full Name</p>
                <p className="font-semibold">{studentProfile.first_name} {studentProfile.last_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warm-white rounded">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-xs text-gray-600">Email</p>
                <p className="font-semibold">{studentProfile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warm-white rounded">
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-xs text-gray-600">Phone</p>
                <p className="font-semibold">{studentProfile.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warm-white rounded">
              <span className="text-2xl">🎂</span>
              <div>
                <p className="text-xs text-gray-600">Date of Birth</p>
                <p className="font-semibold">{studentProfile.birth_date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warm-white rounded">
              <span className="text-2xl">⚧️</span>
              <div>
                <p className="text-xs text-gray-600">Gender</p>
                <p className="font-semibold">{studentProfile.gender}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warm-white rounded">
              <span className="text-2xl">🌍</span>
              <div>
                <p className="text-xs text-gray-600">Nationality</p>
                <p className="font-semibold">{studentProfile.nationality}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Education & Background */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
            Education & Background
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-3 bg-warm-white rounded">
              <span className="text-2xl">🎓</span>
              <div>
                <p className="text-xs text-gray-600">Education Level</p>
                <p className="font-semibold">{studentProfile.diploma_level}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warm-white rounded">
              <span className="text-2xl">💼</span>
              <div>
                <p className="text-xs text-gray-600">Job Status</p>
                <p className="font-semibold">{studentProfile.job_status}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warm-white rounded">
              <span className="text-2xl">🗣️</span>
              <div>
                <p className="text-xs text-gray-600">English Level</p>
                <p className="font-semibold">{studentProfile.english_level}/5</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warm-white rounded">
              <span className="text-2xl">💻</span>
              <div>
                <p className="text-xs text-gray-600">Has Laptop</p>
                <p className="font-semibold">{studentProfile.has_laptop ? '✅ Yes' : '❌ No'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
            Enrolled Courses
          </h2>
          {studentProfile.courses && studentProfile.courses.length > 0 ? (
            <div className="space-y-3">
              {studentProfile.courses.map((course: any, index: number) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-4 bg-warm-white rounded-lg border-l-4 border-primary-gold"
                >
                  <span className="text-2xl">📚</span>
                  <div className="flex-1">
                    <p className="font-semibold text-secondary-blue">
                      {typeof course === 'string' ? course : course.name}
                    </p>
                  </div>
                  <span className="bg-success text-white text-xs px-3 py-1 rounded-full font-bold">
                    Enrolled
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📖</div>
              <p>No courses enrolled yet</p>
            </div>
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Link href="/dashboard">
            <Button variant="outline">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
