'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [mySchedules, setMySchedules] = useState<any[]>([]);
  const [stats, setStats] = useState({ courses: 0, students: 0, schedules: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, schedulesRes] = await Promise.all([
        apiClient.get('/courses/'),
        apiClient.get('/schedules/'),
      ]);
      
      const courses = coursesRes.data.results || coursesRes.data;
      const schedules = schedulesRes.data.results || schedulesRes.data;
      
      // Filter courses taught by this instructor
      const instructorCourses = courses.filter((c: any) => c.instructor?.id === user?.id);
      const instructorSchedules = schedules.filter((s: any) => s.instructor?.id === user?.id);
      
      setMyCourses(instructorCourses);
      setMySchedules(instructorSchedules);
      setStats({
        courses: instructorCourses.length,
        students: 0, // Would need to fetch from backend
        schedules: instructorSchedules.length,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
            Instructor Dashboard 👨‍🏫
          </h1>
          <p className="text-gray-600">Welcome back, {user?.first_name || user?.username}</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary-gold mb-2">{stats.courses}</div>
            <div className="text-gray-600">My Courses</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-secondary-blue mb-2">{stats.schedules}</div>
            <div className="text-gray-600">Active Schedules</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-success mb-2">{stats.students}</div>
            <div className="text-gray-600">Total Students</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link href="/instructor/courses/create">
            <div className="bg-gradient-to-br from-primary-gold to-primary-gold-dark rounded-xl p-6 text-gray-900 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">➕</div>
              <h3 className="text-lg font-bold mb-1">Create Course</h3>
              <p className="text-sm">Add new course</p>
            </div>
          </Link>

          <Link href="/instructor/materials">
            <div className="bg-gradient-to-br from-secondary-blue to-secondary-blue-dark rounded-xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-bold mb-1">Course Materials</h3>
              <p className="text-sm">Update content</p>
            </div>
          </Link>

          <Link href="/instructor/events/create">
            <div className="bg-gradient-to-br from-success to-green-700 rounded-xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-lg font-bold mb-1">Create Event</h3>
              <p className="text-sm">Schedule workshop</p>
            </div>
          </Link>

          <Link href="/instructor/schedules">
            <div className="bg-gradient-to-br from-hausa-indigo to-purple-900 rounded-xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-lg font-bold mb-1">Schedules</h3>
              <p className="text-sm">Manage classes</p>
            </div>
          </Link>
        </div>

        {/* My Courses */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue">
              My Courses
            </h2>
            <Link href="/instructor/courses/create">
              <Button variant="primary" size="sm">
                + New Course
              </Button>
            </Link>
          </div>
          
          {myCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {myCourses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{course.name}</h3>
                      <p className="text-sm text-gray-600">{course.category}</p>
                    </div>
                    <span className="bg-primary-gold text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex gap-2">
                    <Link href={`/instructor/courses/${course.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Edit Course
                      </Button>
                    </Link>
                    <Link href={`/instructor/courses/${course.id}/materials`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full">
                        Materials
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2">No Courses Yet</h3>
              <p className="mb-4">Create your first course to get started</p>
              <Link href="/instructor/courses/create">
                <Button variant="primary">Create Course</Button>
              </Link>
            </div>
          )}
        </div>

        {/* My Schedules */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue">
              Active Schedules
            </h2>
            <Link href="/instructor/schedules/create">
              <Button variant="primary" size="sm">
                + New Schedule
              </Button>
            </Link>
          </div>
          
          {mySchedules.length > 0 ? (
            <div className="space-y-4">
              {mySchedules.map((schedule) => (
                <div key={schedule.id} className="border-l-4 border-primary-gold pl-4 py-3 bg-warm-white rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{schedule.course?.name || 'Course'}</h3>
                      <p className="text-sm text-gray-600">
                        📅 {schedule.start_date} - {schedule.end_date}
                      </p>
                      <p className="text-sm text-gray-600">
                        📍 {schedule.location?.name || 'Location TBD'}
                      </p>
                    </div>
                    <Link href={`/instructor/schedules/${schedule.id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-2">No Schedules Yet</h3>
              <p className="mb-4">Create a schedule to start teaching</p>
              <Link href="/instructor/schedules/create">
                <Button variant="primary">Create Schedule</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
