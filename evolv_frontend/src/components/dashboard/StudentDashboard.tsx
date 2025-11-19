'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, eventsRes] = await Promise.all([
        apiClient.get('/courses/'),
        apiClient.get('/events/'),
      ]);
      setCourses(coursesRes.data.results || coursesRes.data);
      setEvents(eventsRes.data.results || eventsRes.data);
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
            Welcome back, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="text-gray-600">Your learning journey continues here</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/admission">
            <div className="bg-gradient-to-br from-primary-gold to-primary-gold-dark rounded-xl p-6 text-gray-900 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-xl font-bold mb-2">Apply for Courses</h3>
              <p className="text-sm">Submit your application to join new programs</p>
            </div>
          </Link>

          <Link href="/courses">
            <div className="bg-gradient-to-br from-secondary-blue to-secondary-blue-dark rounded-xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-xl font-bold mb-2">Browse Courses</h3>
              <p className="text-sm">Explore available courses and programs</p>
            </div>
          </Link>

          <Link href="/events">
            <div className="bg-gradient-to-br from-success to-green-700 rounded-xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-bold mb-2">Join Events</h3>
              <p className="text-sm">Register for upcoming workshops and events</p>
            </div>
          </Link>
        </div>

        {/* My Learning */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* My Courses */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
              My Courses
            </h2>
            {myCourses.length > 0 ? (
              <div className="space-y-3">
                {myCourses.map((course) => (
                  <div key={course.id} className="border-l-4 border-primary-gold pl-4 py-2">
                    <h3 className="font-bold">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.category}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📖</div>
                <p>You haven't enrolled in any courses yet</p>
                <Link href="/courses">
                  <Button variant="primary" size="sm" className="mt-4">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* My Events */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
              My Events
            </h2>
            {myEvents.length > 0 ? (
              <div className="space-y-3">
                {myEvents.map((event) => (
                  <div key={event.id} className="border-l-4 border-success pl-4 py-2">
                    <h3 className="font-bold">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎪</div>
                <p>You haven't registered for any events yet</p>
                <Link href="/events">
                  <Button variant="primary" size="sm" className="mt-4">
                    View Events
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Available Courses */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
            Available Courses
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course) => (
              <div key={course.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2">{course.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{course.category}</p>
                <Link href={`/courses/${course.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          {courses.length > 6 && (
            <div className="text-center mt-6">
              <Link href="/courses">
                <Button variant="primary">View All Courses</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
            Upcoming Events
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {events.slice(0, 4).map((event) => (
              <div key={event.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-1">📅 {event.date}</p>
                <p className="text-sm text-gray-600 mb-3">
                  {event.is_virtual ? '💻 Virtual Event' : '📍 In-Person'}
                </p>
                <Button variant="primary" size="sm" className="w-full">
                  Register Now
                </Button>
              </div>
            ))}
          </div>
          {events.length > 4 && (
            <div className="text-center mt-6">
              <Link href="/events">
                <Button variant="primary">View All Events</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
