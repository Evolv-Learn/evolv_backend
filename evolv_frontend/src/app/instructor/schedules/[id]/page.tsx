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
  const [modules, setModules] = useState<any[]>([]);
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

      const [courseRes, modulesRes] = await Promise.all([
        scheduleRes.data.course
          ? apiClient.get(`/courses/${scheduleRes.data.course}/`)
          : Promise.resolve(null),
        apiClient.get(`/modules/?schedule=${scheduleId}`),
      ]);

      if (courseRes) setCourse(courseRes.data);
      setModules(modulesRes.data.results || modulesRes.data || []);
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
              {modules.length > 0 && (
                <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {modules.length}
                </span>
              )}
            </h2>
          </div>

          {modules.length > 0 ? (
            <div className="space-y-3">
              {modules.map((mod: any) => (
                <Link
                  key={mod.id}
                  href={`/instructor/modules/${mod.id}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-gold hover:shadow-md transition-all group bg-warm-white"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-9 h-9 bg-secondary-blue text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      {mod.order}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-secondary-blue transition-colors">
                        {mod.title}
                      </p>
                      {mod.lessons_count !== undefined && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {mod.lessons_count} lesson{mod.lessons_count !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-bold mb-2">No Modules Yet</h3>
              <p className="text-sm mb-4">Modules were not added when this schedule was created.</p>
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
