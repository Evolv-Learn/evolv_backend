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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/users">
            <div className="group relative bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 border-2 border-amber-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">👥</div>
                <h3 className="text-xl font-bold mb-2 drop-shadow-md">Manage Users</h3>
                <p className="text-sm opacity-95">Promote students to instructors</p>
                <div className="mt-4 flex items-center text-sm font-semibold bg-white bg-opacity-20 rounded-lg px-3 py-1 w-fit backdrop-blur-sm">
                  <span>Manage Roles</span>
                  <span className="ml-2 group-hover:ml-4 transition-all">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/applications">
            <div className="group relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 border-2 border-blue-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">📋</div>
                <h3 className="text-xl font-bold mb-2 drop-shadow-md">Applications</h3>
                <p className="text-sm opacity-95">Review student applications</p>
                <div className="mt-4 flex items-center text-sm font-semibold bg-white bg-opacity-20 rounded-lg px-3 py-1 w-fit backdrop-blur-sm">
                  <span>{stats.pendingApplications} Pending</span>
                  <span className="ml-2 group-hover:ml-4 transition-all">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/courses">
            <div className="group relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 border-2 border-emerald-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">📚</div>
                <h3 className="text-xl font-bold mb-2 drop-shadow-md">Courses</h3>
                <p className="text-sm opacity-95">Manage all courses</p>
                <div className="mt-4 flex items-center text-sm font-semibold bg-white bg-opacity-20 rounded-lg px-3 py-1 w-fit backdrop-blur-sm">
                  <span>{stats.courses} Active</span>
                  <span className="ml-2 group-hover:ml-4 transition-all">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/events/calendar">
            <div className="group relative bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-2xl p-6 text-white hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 border-2 border-purple-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">📅</div>
                <h3 className="text-xl font-bold mb-2 drop-shadow-md">Event Calendar</h3>
                <p className="text-sm opacity-95">View monthly schedule</p>
                <div className="mt-4 flex items-center text-sm font-semibold bg-white bg-opacity-20 rounded-lg px-3 py-1 w-fit backdrop-blur-sm">
                  <span>{stats.events} Events</span>
                  <span className="ml-2 group-hover:ml-4 transition-all">→</span>
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
                <span>📚</span> Courses
              </h2>
              <Link href="/admin/courses">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              <Link href="/instructor/courses/create">
                <div className="group border-2 border-dashed border-gray-200 rounded-xl p-5 hover:border-primary-gold hover:bg-warm-white transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl group-hover:scale-110 transition-transform">➕</div>
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
                    <div className="text-3xl">✏️</div>
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
                    <div className="text-3xl">✅</div>
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
                    <div className="text-3xl">📁</div>
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
                <span>👥</span> Users
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
                      <div className="text-3xl">🎓</div>
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
                      <div className="text-3xl">👨‍🏫</div>
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
                    <div className="text-3xl">👤</div>
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
                <span>🎉</span> Events
              </h2>
              <Link href="/admin/events">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              <Link href="/admin/events/create">
                <div className="group border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-hausa-indigo hover:bg-warm-white transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl group-hover:scale-110 transition-transform">➕</div>
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
                    <div className="text-2xl">✏️</div>
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
                    <div className="text-2xl">📅</div>
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
              <span>📊</span> Recent Activity
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
                    <span className="text-2xl">
                      {activity.type === 'enrollment' && '📝'}
                      {activity.type === 'application' && '📋'}
                      {activity.type === 'course' && '📚'}
                      {activity.type === 'event' && '🎉'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
