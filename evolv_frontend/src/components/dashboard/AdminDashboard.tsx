'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

interface Stats {
  students: number;
  courses: number;
  events: number;
  instructors: number;
  pendingApplications: number;
  totalEnrollments: number;
}

interface RecentActivity {
  id: number;
  type: 'enrollment' | 'application' | 'course' | 'event';
  title: string;
  description: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats>({
    students: 0,
    courses: 0,
    events: 0,
    instructors: 0,
    pendingApplications: 0,
    totalEnrollments: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, coursesRes, eventsRes, profilesRes, enrollmentsRes] = await Promise.all([
        apiClient.get('/students/'),
        apiClient.get('/courses/'),
        apiClient.get('/events/'),
        apiClient.get('/admin/profiles/'),
        apiClient.get('/enrollments/'),
      ]);
      
      const students = studentsRes.data.results || studentsRes.data;
      const courses = coursesRes.data.results || coursesRes.data;
      const events = eventsRes.data.results || eventsRes.data;
      const profiles = profilesRes.data.results || profilesRes.data;
      const enrollments = enrollmentsRes.data.results || enrollmentsRes.data;
      
      const instructorCount = profiles.filter((p: any) => p.role === 'Instructor').length;
      const pendingCount = enrollments.filter((e: any) => e.status === 'Pending').length;
      
      setStats({
        students: students.length,
        courses: courses.length,
        events: events.length,
        instructors: instructorCount,
        pendingApplications: pendingCount,
        totalEnrollments: enrollments.length,
      });
      
      // Build recent activities
      const activities: RecentActivity[] = [];
      enrollments.slice(0, 5).forEach((e: any) => {
        activities.push({
          id: e.id,
          type: 'enrollment',
          title: 'New Enrollment',
          description: `${e.student?.first_name} applied for ${e.course?.name}`,
          timestamp: e.applied_at,
        });
      });
      
      setRecentActivities(activities);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-warm-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-heading font-bold bg-gradient-to-r from-secondary-blue via-primary-gold to-igbo-red bg-clip-text text-transparent mb-2">
            Admin Control Center
          </h1>
          <p className="text-gray-600 text-lg">Welcome back, {user?.first_name || user?.username} 👋</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-primary-gold">
            <div className="text-sm text-gray-500 mb-1">Total Students</div>
            <div className="text-3xl font-bold text-primary-gold">{stats.students}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-secondary-blue">
            <div className="text-sm text-gray-500 mb-1">Instructors</div>
            <div className="text-3xl font-bold text-secondary-blue">{stats.instructors}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-success">
            <div className="text-sm text-gray-500 mb-1">Active Courses</div>
            <div className="text-3xl font-bold text-success">{stats.courses}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-hausa-indigo">
            <div className="text-sm text-gray-500 mb-1">Total Events</div>
            <div className="text-3xl font-bold text-hausa-indigo">{stats.events}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-igbo-red">
            <div className="text-sm text-gray-500 mb-1">Pending Apps</div>
            <div className="text-3xl font-bold text-igbo-red">{stats.pendingApplications}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-yoruba-green">
            <div className="text-sm text-gray-500 mb-1">Enrollments</div>
            <div className="text-3xl font-bold text-yoruba-green">{stats.totalEnrollments}</div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Link href="/admin/users">
            <div className="group relative bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 rounded-2xl p-4 text-white hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 border-2 border-amber-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
              <div className="relative z-10">
                <div className="mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h3 className="text-base font-bold mb-1 drop-shadow-md">Manage Users</h3>
                <p className="text-xs opacity-95">Promote students to instructors</p>
                <div className="mt-3 flex items-center text-xs font-semibold bg-white bg-opacity-20 rounded-lg px-2 py-1 w-fit backdrop-blur-sm">
                  <span>Manage Roles</span>
                  <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/applications">
            <div className="group relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 rounded-2xl p-4 text-white hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 border-2 border-blue-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
              <div className="relative z-10">
                <div className="mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <h3 className="text-base font-bold mb-1 drop-shadow-md">Applications</h3>
                <p className="text-xs opacity-95">Review student applications</p>
                <div className="mt-3 flex items-center text-xs font-semibold bg-white bg-opacity-20 rounded-lg px-2 py-1 w-fit backdrop-blur-sm">
                  <span>{stats.pendingApplications} Pending</span>
                  <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/courses">
            <div className="group relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-4 text-white hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 border-2 border-emerald-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
              <div className="relative z-10">
                <div className="mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="text-base font-bold mb-1 drop-shadow-md">Courses</h3>
                <p className="text-xs opacity-95">Manage all courses</p>
                <div className="mt-3 flex items-center text-xs font-semibold bg-white bg-opacity-20 rounded-lg px-2 py-1 w-fit backdrop-blur-sm">
                  <span>{stats.courses} Active</span>
                  <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/events/calendar">
            <div className="group relative bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-2xl p-4 text-white hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 border-2 border-purple-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
              <div className="relative z-10">
                <div className="mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-base font-bold mb-1 drop-shadow-md">Event Calendar</h3>
                <p className="text-xs opacity-95">View monthly schedule</p>
                <div className="mt-3 flex items-center text-xs font-semibold bg-white bg-opacity-20 rounded-lg px-2 py-1 w-fit backdrop-blur-sm">
                  <span>{stats.events} Events</span>
                  <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/discount-codes">
            <div className="group relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-4 text-white hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 border-2 border-emerald-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
              <div className="relative z-10">
                <div className="mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                </div>
                <h3 className="text-base font-bold mb-1 drop-shadow-md">Discount Codes</h3>
                <p className="text-xs opacity-95">Manage promo codes</p>
                <div className="mt-3 flex items-center text-xs font-semibold bg-white bg-opacity-20 rounded-lg px-2 py-1 w-fit backdrop-blur-sm">
                  <span>Create &amp; manage</span>
                  <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>



        {/* Management Sections */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Course Management */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-secondary-blue flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> Courses
              </h2>
              <Link href="/admin/courses">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              <Link href="/instructor/courses/create">
                <div className="group border-2 border-dashed border-gray-200 rounded-xl p-5 hover:border-primary-gold hover:bg-warm-white transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <svg className="w-9 h-9 text-gray-400 group-hover:text-primary-gold group-hover:scale-110 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Create Course</h3>
                      <p className="text-sm text-gray-600">Add new course to platform</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/courses">
                <div className="border rounded-xl p-5 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    <div>
                      <h3 className="font-bold text-lg">Manage Courses</h3>
                      <p className="text-sm text-gray-600">View, edit, and delete courses</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/courses/approvals">
                <div className="border rounded-xl p-5 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                      <h3 className="font-bold text-lg">Course Approvals</h3>
                      <p className="text-sm text-gray-600">Review instructor submissions</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/categories">
                <div className="border rounded-xl p-5 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    <div>
                      <h3 className="font-bold text-lg">Categories</h3>
                      <p className="text-sm text-gray-600">Manage course categories</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-secondary-blue flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Users
              </h2>
              <Link href="/admin/users">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              <Link href="/admin/users?filter=students">
                <div className="border rounded-xl p-5 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                      <div>
                        <h3 className="font-bold text-lg">Students</h3>
                        <p className="text-sm text-gray-600">Manage student accounts</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-primary-gold">{stats.students}</div>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/users?filter=instructors">
                <div className="border rounded-xl p-5 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <div>
                        <h3 className="font-bold text-lg">Instructors</h3>
                        <p className="text-sm text-gray-600">Manage instructor accounts</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-secondary-blue">{stats.instructors}</div>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/users/create-admin">
                <div className="border rounded-xl p-5 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    <div>
                      <h3 className="font-bold text-lg">Create Admin</h3>
                      <p className="text-sm text-gray-600">Add new admin accounts</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Event Management */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-secondary-blue flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Events
              </h2>
              <Link href="/admin/events">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              <Link href="/admin/events/create">
                <div className="group border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-hausa-indigo hover:bg-warm-white transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-gray-400 group-hover:text-hausa-indigo group-hover:scale-110 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <div>
                      <h3 className="font-bold text-gray-900">Create Event</h3>
                      <p className="text-sm text-gray-600">Schedule new event</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/events">
                <div className="border rounded-xl p-4 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    <div>
                      <h3 className="font-bold">Edit Events</h3>
                      <p className="text-sm text-gray-600">Update event details</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/events/calendar">
                <div className="border rounded-xl p-4 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <div>
                      <h3 className="font-bold">Event Calendar</h3>
                      <p className="text-sm text-gray-600">Monthly schedule view</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> Recent Activity
              </h2>
            <Link href="/admin/activity">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="border-l-4 border-primary-gold rounded-r-lg p-4 hover:bg-warm-white transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {activity.type === 'enrollment' && <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                      {activity.type === 'application' && <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                      {activity.type === 'course' && <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                      {activity.type === 'event' && <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-14 h-14 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <p className="text-lg">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
