'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

export default function StudentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [applicationStatus, setApplicationStatus] = useState<string>('Not Applied');
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Check for success message
    if (searchParams.get('success') === 'application-submitted') {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [coursesRes, eventsRes] = await Promise.all([
        apiClient.get('/courses/'),
        apiClient.get('/events/'),
      ]);
      setCourses(coursesRes.data.results || coursesRes.data);
      setEvents(eventsRes.data.results || eventsRes.data);
      
      // Fetch student profile
      try {
        const studentRes = await apiClient.get('/students/me/');
        setStudentProfile(studentRes.data);
        setApplicationStatus('Under Review');
      } catch (error) {
        // Student profile doesn't exist yet
        setApplicationStatus('Not Applied');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-success text-white';
      case 'Under Review': return 'bg-primary-gold text-gray-900';
      case 'Rejected': return 'bg-red-500 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  // Calculate onboarding progress
  const getOnboardingProgress = () => {
    let completed = 0;
    const steps = [
      { name: 'Create Account', done: true }, // Always true if they're logged in
      { name: 'Submit Application', done: !!studentProfile },
      { name: 'Get Approved', done: applicationStatus === 'Approved' },
    ];
    completed = steps.filter(s => s.done).length;
    return { completed, total: steps.length, percentage: (completed / steps.length) * 100, steps };
  };

  const onboarding = getOnboardingProgress();

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-success p-4 rounded-lg animate-fade-in">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <h3 className="font-bold text-success">Application Submitted Successfully!</h3>
                <p className="text-sm text-gray-700">We'll review your application and get back to you within 3-5 business days.</p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Header with Motivation */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-3">
            Welcome back, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="text-xl text-gray-600 italic">
            "Every expert started as a beginner. You're one step closer to your future."
          </p>
        </div>

        {/* Onboarding Progress Card - For New Students */}
        {!studentProfile && (
          <div className="bg-gradient-to-br from-primary-gold to-primary-gold-dark rounded-xl p-8 mb-8 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-5xl">🚀</div>
              <div className="flex-1">
                <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                  Start Strong With EvolvLearn in 3 Steps
                </h2>
                <p className="text-gray-800 text-lg">
                  Welcome to your learning journey! Complete these steps to unlock your potential.
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-900">
                  You've completed {onboarding.completed} out of {onboarding.total} onboarding steps
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {Math.round(onboarding.percentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-900/20 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-secondary-blue h-full rounded-full transition-all duration-500"
                  style={{ width: `${onboarding.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Steps Checklist */}
            <div className="space-y-3">
              {onboarding.steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-3 p-4 rounded-lg ${
                    step.done ? 'bg-white/30' : 'bg-white/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step.done ? 'bg-success text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.done ? '✓' : index + 1}
                  </div>
                  <span className={`font-semibold ${step.done ? 'text-gray-900' : 'text-gray-700'}`}>
                    {step.name}
                  </span>
                  {!step.done && index === 1 && (
                    <span className="ml-auto">
                      <Link href="/admission">
                        <Button variant="secondary" size="sm">
                          Start Now →
                        </Button>
                      </Link>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Application Status Card */}
        <div className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark rounded-xl p-6 text-white mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-heading font-bold mb-2">Application Status</h2>
              <p className="text-gray-200">
                {!studentProfile ? 'Ready to begin your journey?' : 'Track your admission progress'}
              </p>
            </div>
            <div className={`px-6 py-3 rounded-full font-bold text-lg ${getStatusColor(applicationStatus)}`}>
              {applicationStatus === 'Not Applied' ? 'NOT STARTED' : applicationStatus}
            </div>
          </div>
          
          {/* For students who haven't applied */}
          {!studentProfile && (
            <div className="mt-6 pt-6 border-t border-white/20">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">Application Progress</span>
                  <span className="text-sm font-bold">0%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div className="bg-primary-gold h-full rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                <p className="text-lg mb-2">📋 You haven't applied to any course yet.</p>
                <p className="text-sm text-gray-200">
                  Take the first step towards your tech career. Our application process is simple and free!
                </p>
              </div>

              <Link href="/admission">
                <Button variant="primary" className="bg-primary-gold hover:bg-primary-gold-dark text-gray-900 w-full md:w-auto px-8 py-4 text-lg font-bold">
                  Apply Now - It's Free! →
                </Button>
              </Link>
            </div>
          )}
          
          {/* For students who have applied */}
          {studentProfile && (
            <div className="mt-6 grid md:grid-cols-3 gap-4 pt-6 border-t border-white/20">
              <div>
                <div className="text-3xl font-bold">{studentProfile.courses?.length || 0}</div>
                <div className="text-sm text-gray-200">Courses Selected</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{studentProfile.english_level}/5</div>
                <div className="text-sm text-gray-200">English Level</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{studentProfile.has_laptop ? 'Yes' : 'No'}</div>
                <div className="text-sm text-gray-200">Has Laptop</div>
              </div>
            </div>
          )}
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-heading font-bold text-secondary-blue">
                My Courses
              </h2>
              {studentProfile?.courses && studentProfile.courses.length > 0 && (
                <span className="bg-primary-gold text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                  {studentProfile.courses.length}
                </span>
              )}
            </div>
            {studentProfile?.courses && studentProfile.courses.length > 0 ? (
              <div className="space-y-3">
                {studentProfile.courses.map((courseName: string, index: number) => (
                  <div key={index} className="border-l-4 border-primary-gold pl-4 py-3 bg-warm-white rounded">
                    <h3 className="font-bold text-secondary-blue">{courseName}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-success text-white px-2 py-1 rounded">Enrolled</span>
                      <span className="text-xs text-gray-600">• In Progress</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📖</div>
                <p className="mb-2">You haven't enrolled in any courses yet</p>
                <p className="text-sm mb-4">Apply for admission to get started</p>
                <Link href="/admission">
                  <Button variant="primary" size="sm" className="mt-2">
                    Apply Now
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Application Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
              Application Details
            </h2>
            {studentProfile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-warm-white rounded">
                  <span className="text-gray-700">📧 Email</span>
                  <span className="font-semibold text-sm">{studentProfile.email}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-warm-white rounded">
                  <span className="text-gray-700">📱 Phone</span>
                  <span className="font-semibold text-sm">{studentProfile.phone}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-warm-white rounded">
                  <span className="text-gray-700">🎓 Education</span>
                  <span className="font-semibold text-sm">{studentProfile.diploma_level}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-warm-white rounded">
                  <span className="text-gray-700">💼 Job Status</span>
                  <span className="font-semibold text-sm">{studentProfile.job_status}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-warm-white rounded">
                  <span className="text-gray-700">💻 Laptop</span>
                  <span className="font-semibold text-sm">{studentProfile.has_laptop ? '✅ Yes' : '❌ No'}</span>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/admission">
                    <Button variant="outline" size="sm" className="w-full">
                      Update Application
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p className="mb-2">No application submitted</p>
                <p className="text-sm mb-4">Submit your application to see details here</p>
                <Link href="/admission">
                  <Button variant="primary" size="sm">
                    Apply Now
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
