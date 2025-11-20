'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

export default function MyCoursesPage() {
  const { user } = useAuthStore();
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentRes, coursesRes] = await Promise.all([
        apiClient.get('/students/me/'),
        apiClient.get('/courses/'),
      ]);
      
      setStudentProfile(studentRes.data);
      
      // Get all courses
      const allCourses = coursesRes.data.results || coursesRes.data;
      
      // The backend returns course names as strings, so we need to match by name
      const enrolledCourseNames = studentRes.data.courses || [];
      
      const enrolledCourses = allCourses.filter((course: any) => 
        enrolledCourseNames.includes(course.name)
      );
      
      setCourses(enrolledCourses);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
                My Courses
              </h1>
              <p className="text-gray-600">
                {courses.length} {courses.length === 1 ? 'course' : 'courses'} enrolled
              </p>
            </div>
            <Link href="/admission">
              <Button variant="primary">
                + Add More Courses
              </Button>
            </Link>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              // Find enrollment status for this course
              const enrollment = studentProfile?.enrollments?.find(
                (e: any) => e.course_name === course.name
              );
              const status = enrollment?.status || 'Pending';
              
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'Approved': return 'bg-success text-white';
                  case 'Under Review': return 'bg-yellow-500 text-white';
                  case 'Pending': return 'bg-gray-400 text-white';
                  case 'Rejected': return 'bg-red-500 text-white';
                  default: return 'bg-gray-300 text-gray-700';
                }
              };
              
              return (
                <div 
                  key={course.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">📚</div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-secondary-blue mb-2">
                      {course.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {course.category}
                    </p>
                    
                    {course.description && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                        {course.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <Link href={`/courses/${course.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Courses Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't enrolled in any courses. Start your learning journey today!
            </p>
            <Link href="/admission">
              <Button variant="primary" size="lg">
                Apply for Courses
              </Button>
            </Link>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
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
