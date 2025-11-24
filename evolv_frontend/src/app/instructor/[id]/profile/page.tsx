'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';

export default function PublicInstructorProfilePage() {
  const params = useParams();
  const instructorId = params.id;
  
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (instructorId) {
      fetchProfile();
    }
  }, [instructorId]);

  const fetchProfile = async () => {
    try {
      const [profileRes, coursesRes] = await Promise.all([
        apiClient.get(`/instructors/${instructorId}/profile/`),
        apiClient.get('/courses/'),
      ]);
      
      setProfile(profileRes.data);
      
      // Filter courses taught by this instructor
      const allCourses = coursesRes.data.results || coursesRes.data || [];
      const instructorCourses = allCourses.filter(
        (course: any) => course.instructor_id === parseInt(instructorId as string)
      );
      setCourses(instructorCourses);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load instructor profile');
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-warm-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error || 'Instructor profile not found'}</p>
            <Link href="/courses" className="inline-block mt-4">
              <Button variant="outline">← Back to Courses</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/courses" className="inline-block mb-6">
          <Button variant="outline">
            ← Back to Courses
          </Button>
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-40 h-40 rounded-full border-4 border-secondary-blue overflow-hidden bg-gray-200">
                {profile.profile_picture ? (
                  <img 
                    src={profile.profile_picture.startsWith('http') 
                      ? profile.profile_picture 
                      : `http://localhost:8000${profile.profile_picture}`
                    } 
                    alt={profile.user?.first_name || 'Instructor'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary-blue text-white text-5xl font-bold">
                    {(profile.user?.first_name?.[0] || profile.user?.username?.[0] || 'I').toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
                {profile.user?.first_name && profile.user?.last_name
                  ? `${profile.user.first_name} ${profile.user.last_name}`
                  : profile.user?.username}
              </h1>
              
              {profile.title && (
                <p className="text-xl text-gray-600 mb-4">
                  {profile.title}
                </p>
              )}

              {profile.bio && (
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Contact & Social */}
              <div className="flex items-center gap-6">
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-2 text-secondary-blue hover:underline"
                  >
                    <span className="text-2xl">📧</span>
                    <span>Email</span>
                  </a>
                )}
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-secondary-blue hover:underline"
                  >
                    <span className="text-2xl">🐦</span>
                    <span>Twitter</span>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-secondary-blue hover:underline"
                  >
                    <span className="text-2xl">💼</span>
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Courses Taught */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-6">
            Courses Taught ({courses.length})
          </h2>

          {courses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="border-l-4 border-primary-gold rounded-lg p-6 bg-warm-white hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-secondary-blue flex-1">
                      {course.name}
                    </h3>
                    <span className="bg-secondary-blue text-white px-3 py-1 rounded-full text-xs font-bold ml-3">
                      {course.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {course.start_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📅</span>
                      <span>
                        Starts: {new Date(course.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📚</div>
              <p>No courses currently assigned</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
