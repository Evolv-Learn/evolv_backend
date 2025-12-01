'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';
import EventCalendar from '@/components/calendar/EventCalendar';

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, schedulesRes, coursesRes] = await Promise.all([
        apiClient.get('/profile/'),
        apiClient.get('/schedules/'),
        apiClient.get('/courses/'),
      ]);
      
      setProfile(profileRes.data);
      
      // Filter schedules for current instructor
      const allSchedules = schedulesRes.data.results || schedulesRes.data || [];
      const allCourses = coursesRes.data.results || coursesRes.data || [];
      
      const mySchedules = allSchedules.filter(
        (schedule: any) => {
          return schedule.instructor === user?.id || schedule.instructor?.id === user?.id;
        }
      );
      
      // Fetch course details for each schedule to get topics_covered
      const schedulesWithModules = await Promise.all(
        mySchedules.map(async (schedule: any) => {
          try {
            const courseRes = await apiClient.get(`/courses/${schedule.course}/`);
            const course = courseRes.data;
            
            // Count modules from topics_covered (non-empty lines)
            const modulesCount = course.topics_covered 
              ? course.topics_covered.split('\n').filter((line: string) => line.trim()).length 
              : 0;
            
            return {
              ...schedule,
              modules_count: modulesCount,
            };
          } catch (error) {
            console.error(`Failed to fetch course ${schedule.course}:`, error);
            return {
              ...schedule,
              modules_count: 0,
            };
          }
        })
      );
      
      setSchedules(schedulesWithModules);
      setCourses(allCourses);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4">
        {/* Instructor Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start gap-8">
            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
              <div className="w-40 h-40 rounded-full border-4 border-secondary-blue overflow-hidden bg-gray-200">
                {profile?.profile_picture ? (
                  <img 
                    src={profile.profile_picture.startsWith('http') 
                      ? profile.profile_picture 
                      : `http://localhost:8000${profile.profile_picture}`
                    } 
                    alt={user?.first_name || user?.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Image failed to load:', profile.profile_picture);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary-blue text-white text-5xl font-bold">
                    {(user?.first_name?.[0] || user?.username?.[0] || 'I').toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 pt-2">
              <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                {user?.last_name && user?.first_name 
                  ? `${user.last_name}, ${user.first_name}`
                  : user?.first_name || user?.username}
              </h1>
              <p className="text-lg text-gray-600 mb-3">
                {profile?.title || 'Instructor'}
              </p>
              {profile?.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 max-w-2xl">
                  {profile.bio}
                </p>
              )}
              <Link href="/instructor/profile">
                <Button variant="primary" size="lg">
                  View profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-secondary-blue to-secondary-blue-dark rounded-xl p-8 text-white text-center flex flex-col items-center justify-center min-h-[140px]">
            <div className="text-5xl font-bold mb-3">{schedules.length}</div>
            <div className="text-lg font-bold">Active Schedules</div>
          </div>
          
          <div className="bg-gradient-to-br from-primary-gold to-primary-gold-dark rounded-xl p-8 text-gray-900 text-center flex flex-col items-center justify-center min-h-[140px]">
            <div className="text-5xl font-bold mb-3">
              {schedules.reduce((total, schedule) => total + (schedule.students?.length || 0), 0)}
            </div>
            <div className="text-lg font-bold">Total Students</div>
          </div>
          
          <div className="bg-gradient-to-br from-success to-green-700 rounded-xl p-8 text-white text-center flex flex-col items-center justify-center min-h-[140px]">
            <div className="text-5xl font-bold mb-3">
              {schedules.reduce((total, schedule) => total + (schedule.modules_count || 0), 0)}
            </div>
            <div className="text-lg font-bold">Total Modules</div>
          </div>
        </div>

        {/* My Schedules */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue">
              My Teaching Schedules
            </h2>
            <Link href="/instructor/schedules/create">
              <Button variant="primary">
                + Create Schedule
              </Button>
            </Link>
          </div>

          {schedules.length > 0 ? (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div 
                  key={schedule.id} 
                  className="border-l-4 border-secondary-blue rounded-lg p-4 bg-warm-white hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-secondary-blue mb-2">
                        {schedule.course_name || schedule.course}
                      </h3>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">📅 Start:</span>
                          <span className="font-semibold">
                            {new Date(schedule.start_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">🎓 End:</span>
                          <span className="font-semibold">
                            {new Date(schedule.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">📍 Location:</span>
                          <span className="font-semibold">{schedule.location_name || schedule.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="bg-primary-gold text-gray-900 px-3 py-1 rounded-full font-semibold">
                          {schedule.students?.length || 0} Students
                        </span>
                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-semibold">
                          {schedule.modules_count || 0} Modules
                        </span>
                        {schedule.duration && (
                          <span className="text-gray-600">
                            Duration: {schedule.duration} months
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link href={`/instructor/schedules/${schedule.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2">No Schedules Yet</h3>
              <p className="mb-4">You haven't been assigned any teaching schedules</p>
              <Link href="/instructor/schedules/create">
                <Button variant="primary">
                  Create Your First Schedule
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <Link href="/instructor/courses/create">
              <Button variant="primary" className="w-full py-6 text-lg">
                ➕ Create Course
              </Button>
            </Link>
            <Link href="/instructor/materials">
              <Button variant="primary" className="w-full py-6 text-lg bg-success hover:bg-green-700">
                📚 Learning Materials
              </Button>
            </Link>
            <Link href="/instructor/schedules">
              <Button variant="outline" className="w-full py-6 text-lg">
                📅 Manage Schedules
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/instructor/students">
              <Button variant="outline" className="w-full py-6 text-lg">
                👥 View Students
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" className="w-full py-6 text-lg">
                📖 Browse Courses
              </Button>
            </Link>
          </div>
        </div>

        {/* Event Calendar */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
            Event Calendar
          </h2>
          <EventCalendar userRole="instructor" compact={true} />
        </div>
      </div>
    </div>
  );
}
