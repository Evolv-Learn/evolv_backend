'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-12 pattern-adire">
        <div className="kente-strip absolute top-0 left-0 right-0"></div>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-heading font-bold mb-2">
            Welcome back, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="text-xl text-gray-200">
            Continue your learning journey
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-primary-gold">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Application Status</p>
                <p className="text-2xl font-bold text-secondary-blue mt-1">Pending</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-igbo-red">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Courses Enrolled</p>
                <p className="text-2xl font-bold text-secondary-blue mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Events Registered</p>
                <p className="text-2xl font-bold text-secondary-blue mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-hausa-indigo">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Progress</p>
                <p className="text-2xl font-bold text-secondary-blue mt-1">0%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Application Status Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-heading font-bold text-secondary-blue">
                  Application Status
                </h2>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                  Pending Review
                </span>
              </div>
              <div className="kente-strip mb-4"></div>
              <p className="text-gray-600 mb-6">
                Your application is currently under review. Our team will get back to you soon!
              </p>
              
              {/* Progress Steps */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white">
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Application Submitted</p>
                    <p className="text-sm text-gray-600">Your application has been received</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Under Review</p>
                    <p className="text-sm text-gray-600">Our team is reviewing your application</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-400">Approval</p>
                    <p className="text-sm text-gray-400">Waiting for approval</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/courses">
                  <Button variant="primary" className="w-full">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>

            {/* My Courses */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
                My Courses
              </h2>
              <div className="kente-strip mb-4"></div>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-600 mb-4">
                  You haven't enrolled in any courses yet
                </p>
                <Link href="/courses">
                  <Button variant="outline">Browse Courses</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-heading font-bold text-secondary-blue mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <span className="mr-2">👤</span> My Profile
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="outline" className="w-full justify-start">
                    <span className="mr-2">📚</span> Explore Courses
                  </Button>
                </Link>
                <Link href="/dashboard/materials">
                  <Button variant="outline" className="w-full justify-start">
                    <span className="mr-2">📖</span> Learning Materials
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="outline" className="w-full justify-start">
                    <span className="mr-2">🎓</span> Browse Courses
                  </Button>
                </Link>
                <Link href="/events">
                  <Button variant="outline" className="w-full justify-start">
                    <span className="mr-2">🎉</span> View Events
                  </Button>
                </Link>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-heading font-bold text-secondary-blue mb-4">
                Upcoming Events
              </h3>
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-gray-600 text-sm">
                  No upcoming events
                </p>
              </div>
            </div>

            {/* Learning Resources */}
            <div className="bg-gradient-to-br from-primary-gold to-primary-gold-dark text-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-heading font-bold mb-2">
                Need Help?
              </h3>
              <p className="text-sm mb-4 text-gray-100">
                Get support from our team
              </p>
              <Link href="/contact">
                <Button variant="outline" className="w-full bg-white text-primary-gold hover:bg-gray-100">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
