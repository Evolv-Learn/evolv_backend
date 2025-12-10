'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

export default function CourseEnrollmentPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();
  
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Form data - auto-populated from user account
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    motivation: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${courseId}/enroll`);
      return;
    }
    
    fetchCourseAndUserData();
  }, [isAuthenticated, courseId]);

  const fetchCourseAndUserData = async () => {
    try {
      // Fetch course details and user profile
      const [courseRes, profileRes] = await Promise.all([
        apiClient.get(`/courses/${courseId}/`),
        apiClient.get('/profile/').catch(() => null), // Fallback if profile doesn't exist
      ]);
      
      setCourse(courseRes.data);
      
      // Auto-populate user data from profile or user store
      const profileData = profileRes?.data;
      
      setFormData({
        first_name: user?.first_name || profileData?.user?.first_name || '',
        last_name: user?.last_name || profileData?.user?.last_name || '',
        email: user?.email || profileData?.user?.email || profileData?.email || '',
        phone: '',
        motivation: '',
      });
      
      console.log('User data populated:', {
        first_name: user?.first_name,
        last_name: user?.last_name,
        email: user?.email,
        profileEmail: profileData?.user?.email || profileData?.email
      });
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load course information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await apiClient.post(`/courses/${courseId}/enroll/`, {
        motivation: formData.motivation,
      });
      
      setMessage('Successfully enrolled! Your application is pending review.');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Enrollment error:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        'Failed to enroll in course. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Link href="/courses" className="inline-block mt-4">
            <Button variant="outline">← Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href={`/courses/${courseId}`} className="inline-block mb-6">
          <Button variant="outline">
            ← Back to Course
          </Button>
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-2">
              Enroll in Course
            </h1>
            <p className="text-gray-600">
              Course: <span className="font-semibold text-secondary-blue">{course?.name}</span>
            </p>
            {course?.category && (
              <p className="text-sm text-gray-500">Category: {course.category}</p>
            )}
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-700 font-medium">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information - Auto-populated */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Personal Information
                <span className="text-sm text-gray-500 font-normal ml-2">(Auto-populated from your account)</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  type="text"
                  value={formData.first_name}
                  disabled
                  className="bg-gray-50"
                />
                
                <Input
                  label="Last Name *"
                  type="text"
                  value={formData.last_name}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <Input
                label="Email Address *"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-50 mt-4"
              />

              <Input
                label="Phone Number *"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
                required
                className="mt-4"
              />
            </div>

            {/* Motivation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want to take this course? *
              </label>
              <textarea
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                rows={6}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                placeholder="Tell us about your goals and what you hope to achieve from this course..."
              />
              <p className="text-xs text-gray-500 mt-2">
                This helps us understand your learning objectives and provide better support.
              </p>
            </div>

            {/* Course Information */}
            {course && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Course Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {course.instructor_name && (
                    <p><span className="font-medium">Instructor:</span> {course.instructor_name}</p>
                  )}
                  {course.duration && (
                    <p><span className="font-medium">Duration:</span> {course.duration}</p>
                  )}
                  {course.level && (
                    <p><span className="font-medium">Level:</span> {course.level}</p>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Enrollment Application'}
              </Button>
              <Link href={`/courses/${courseId}`} className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>

            <p className="text-xs text-gray-500 text-center">
              By submitting this form, you agree to our terms and conditions. Your application will be reviewed by our team.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
