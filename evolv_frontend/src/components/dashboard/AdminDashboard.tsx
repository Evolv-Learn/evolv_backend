'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    events: 0,
    instructors: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, coursesRes, eventsRes] = await Promise.all([
        apiClient.get('/students/'),
        apiClient.get('/courses/'),
        apiClient.get('/events/'),
      ]);
      
      const students = studentsRes.data.results || studentsRes.data;
      const courses = coursesRes.data.results || coursesRes.data;
      const events = eventsRes.data.results || eventsRes.data;
      
      setStats({
        students: students.length,
        courses: courses.length,
        events: events.length,
        instructors: 0, // Would need separate endpoint
      });
      
      setRecentApplications(students.slice(0, 5));
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
            Admin Dashboard 👨‍💼
          </h1>
          <p className="text-gray-600">Welcome back, {user?.first_name || user?.username}</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary-gold mb-2">{stats.students}</div>
            <div className="text-gray-600">Total Students</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-secondary-blue mb-2">{stats.courses}</div>
            <div className="text-gray-600">Total Courses</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-success mb-2">{stats.events}</div>
            <div className="text-gray-600">Total Events</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-igbo-red mb-2">{stats.instructors}</div>
            <div className="text-gray-600">Instructors</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/courses/create">
            <div className="bg-gradient-to-br from-primary-gold to-primary-gold-dark rounded-xl p-6 text-gray-900 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">➕</div>
              <h3 className="text-lg font-bold mb-1">Create Course</h3>
              <p className="text-sm">Add new course</p>
            </div>
          </Link>

          <Link href="/admin/events/create">
            <div className="bg-gradient-to-br from-secondary-blue to-secondary-blue-dark rounded-xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-lg font-bold mb-1">Create Event</h3>
              <p className="text-sm">Schedule event</p>
            </div>
          </Link>

          <Link href="/admin/applications">
            <div className="bg-gradient-to-br from-success to-green-700 rounded-xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-bold mb-1">Applications</h3>
              <p className="text-sm">Review students</p>
            </div>
          </Link>

          <Link href="/admin/users">
            <div className="bg-gradient-to-br from-hausa-indigo to-purple-900 rounded-xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-lg font-bold mb-1">Manage Users</h3>
              <p className="text-sm">Users & roles</p>
            </div>
          </Link>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Course Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-heading font-bold text-secondary-blue">
                Course Management
              </h2>
              <Link href="/admin/courses">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              <Link href="/admin/courses/create">
                <div className="border rounded-lg p-4 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">➕</div>
                    <div>
                      <h3 className="font-bold">Create New Course</h3>
                      <p className="text-sm text-gray-600">Add a new course to the platform</p>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/admin/courses">
                <div className="border rounded-lg p-4 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✏️</div>
                    <div>
                      <h3 className="font-bold">Update Courses</h3>
                      <p className="text-sm text-gray-600">Edit existing course details</p>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/admin/schedules">
                <div className="border rounded-lg p-4 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📅</div>
                    <div>
                      <h3 className="font-bold">Manage Schedules</h3>
                      <p className="text-sm text-gray-600">Create and update learning schedules</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Event Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-heading font-bold text-secondary-blue">
                Event Management
              </h2>
              <Link href="/admin/events">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              <Link href="/admin/events/create">
                <div className="border rounded-lg p-4 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">➕</div>
                    <div>
                      <h3 className="font-bold">Create New Event</h3>
                      <p className="text-sm text-gray-600">Schedule a new event or workshop</p>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/admin/events">
                <div className="border rounded-lg p-4 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✏️</div>
                    <div>
                      <h3 className="font-bold">Update Events</h3>
                      <p className="text-sm text-gray-600">Edit event details and settings</p>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/admin/events/attendance">
                <div className="border rounded-lg p-4 hover:bg-warm-white transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <h3 className="font-bold">Track Attendance</h3>
                      <p className="text-sm text-gray-600">Monitor event registrations</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue">
              Recent Applications
            </h2>
            <Link href="/admin/applications">
              <Button variant="primary" size="sm">
                View All Applications
              </Button>
            </Link>
          </div>
          
          {recentApplications.length > 0 ? (
            <div className="space-y-3">
              {recentApplications.map((student) => (
                <div key={student.id} className="border rounded-lg p-4 hover:bg-warm-white transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{student.first_name} {student.last_name}</h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <Link href="/admin/applications">
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No recent applications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
