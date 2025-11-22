'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';

export default function ScheduleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id;
  
  const [schedule, setSchedule] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (scheduleId) {
      fetchScheduleDetails();
    }
  }, [scheduleId]);

  const fetchScheduleDetails = async () => {
    try {
      const scheduleRes = await apiClient.get(`/schedules/${scheduleId}/`);
      setSchedule(scheduleRes.data);
      
      // Fetch the course details to get topics_covered
      if (scheduleRes.data.course) {
        const courseRes = await apiClient.get(`/courses/${scheduleRes.data.course}/`);
        setCourse(courseRes.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch schedule details:', error);
      setError(error.response?.data?.detail || 'Failed to load schedule details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="min-h-screen bg-warm-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error || 'Schedule not found'}</p>
            <Link href="/dashboard" className="inline-block mt-4">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/dashboard" className="inline-block mb-6">
          <Button variant="outline">
            ← Back to Dashboard
          </Button>
        </Link>

        {/* Schedule Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-2">
                {schedule.course_name}
              </h1>
              <p className="text-gray-600">Learning Schedule Details</p>
            </div>
            <Link href={`/instructor/schedules/${scheduleId}/edit`}>
              <Button variant="primary">
                ✏️ Edit Schedule
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-warm-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Start Date</div>
              <div className="text-lg font-bold text-secondary-blue">
                {new Date(schedule.start_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            
            <div className="bg-warm-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">End Date</div>
              <div className="text-lg font-bold text-secondary-blue">
                {new Date(schedule.end_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            
            <div className="bg-warm-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Duration</div>
              <div className="text-lg font-bold text-secondary-blue">
                {schedule.duration ? `${schedule.duration} months` : 'N/A'}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-warm-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">📍 Location</div>
              <div className="text-lg font-semibold">
                {schedule.location_name}
              </div>
            </div>
            
            <div className="bg-warm-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">👨‍🏫 Instructor</div>
              <div className="text-lg font-semibold">
                {schedule.instructor_name || 'Not assigned'}
              </div>
            </div>
          </div>
        </div>

        {/* Modules Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue">
              Modules
            </h2>
            <Link href={`/instructor/courses/${course?.id}/edit-topics`}>
              <Button variant="primary">
                ✏️ Edit Modules
              </Button>
            </Link>
          </div>

          {course?.topics_covered ? (
            <div className="bg-gradient-to-br from-warm-white to-gray-50 rounded-lg p-8 border-l-4 border-primary-gold">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {course.topics_covered.split('\n').filter((line: string) => line.trim()).map((line: string, index: number) => {
                  const trimmedLine = line.trim();
                  
                  // Check if line starts with bullet point or number
                  const isBullet = trimmedLine.match(/^[•\-\*]/);
                  const isNumbered = trimmedLine.match(/^\d+[\.\)]/);
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 group hover:bg-white/50 p-3 rounded-lg transition-colors"
                    >
                      <span className="flex-shrink-0 w-7 h-7 bg-secondary-blue text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {isBullet || isNumbered ? '✓' : index + 1}
                      </span>
                      <p className="text-gray-800 leading-relaxed flex-1 pt-0.5 text-sm">
                        {trimmedLine.replace(/^[•\-\*]\s*/, '').replace(/^\d+[\.\)]\s*/, '')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2">No Modules Added Yet</h3>
              <p className="mb-4">Add modules that will be covered in this course</p>
              <Link href={`/instructor/courses/${course?.id}/edit-topics`}>
                <Button variant="primary">
                  Add Course Modules
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Students Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue">
              Enrolled Students
            </h2>
            <Button variant="outline">
              View All Students
            </Button>
          </div>

          <div className="text-center py-8 text-gray-500">
            <div className="text-5xl mb-3">👥</div>
            <p>Student enrollment management coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
