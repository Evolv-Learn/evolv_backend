'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';
import EventCalendar from '@/components/calendar/EventCalendar';

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
    
    // Check for success messages
    const successType = searchParams.get('success');
    if (successType === 'application-submitted' || successType === 'courses-updated') {
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
        console.log('Student profile with enrollments:', studentRes.data);
        console.log('Enrollments:', studentRes.data.enrollments);
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
                {searchParams.get('success') === 'courses-updated' ? (
                  <>
                    <h3 className="font-bold text-success">Courses Updated Successfully!</h3>
                    <p className="text-sm text-gray-700">Your course selection has been updated.</p>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-success">Application Submitted Successfully!</h3>
                    <p className="text-sm text-gray-700">We'll review your application and get back to you within 3-5 business days.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Welcome Header with Motivation */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-4">
            Welcome back, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="text-xl text-gray-600 italic font-medium text-center max-w-3xl mx-auto">
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

        {/* For students who haven't applied - Show Application CTA */}
        {!studentProfile && (
          <div className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark rounded-xl p-6 text-white mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-2">Application Status</h2>
                <p className="text-gray-200">Ready to begin your journey?</p>
              </div>
              <div className="px-6 py-3 rounded-full font-bold text-lg bg-gray-300 text-gray-700">
                NOT STARTED
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/20">
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
          </div>
        )}

        {/* For enrolled students - Primary Actions */}
        {studentProfile && (
          <>
            {/* Primary Action Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Profile Button */}
              <Link href="/dashboard/profile">
                <div className="bg-gradient-to-br from-secondary-blue to-secondary-blue-dark rounded-xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer h-full">
                  <div className="text-4xl mb-3">👤</div>
                  <h3 className="text-xl font-bold mb-2">My Profile</h3>
                  <p className="text-sm text-gray-200">View and update your application details</p>
                </div>
              </Link>

              {/* My Courses */}
              <Link href="/dashboard/courses">
                <div className="bg-gradient-to-br from-primary-gold to-primary-gold-dark rounded-xl p-6 text-gray-900 hover:shadow-xl transition-shadow cursor-pointer h-full">
                  <div className="text-4xl mb-3">🎓</div>
                  <h3 className="text-xl font-bold mb-2">My Courses</h3>
                  <p className="text-sm">View your enrolled courses</p>
                  {studentProfile.courses && (
                    <div className="mt-2 bg-white/30 rounded-full px-3 py-1 inline-block">
                      <span className="font-bold">{studentProfile.courses.length}</span> enrolled
                    </div>
                  )}
                </div>
              </Link>

              {/* Learning Materials - Always visible */}
              {applicationStatus === 'Approved' ? (
                <Link href="/materials">
                  <div className="bg-gradient-to-br from-success to-green-700 rounded-xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer h-full">
                    <div className="text-4xl mb-3">📚</div>
                    <h3 className="text-xl font-bold mb-2">Learning Materials</h3>
                    <p className="text-sm text-gray-200">Access your course resources</p>
                  </div>
                </Link>
              ) : (
                <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl p-6 text-gray-600 h-full relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    🔒 Locked
                  </div>
                  <div className="text-4xl mb-3 opacity-50">📚</div>
                  <h3 className="text-xl font-bold mb-2">Learning Materials</h3>
                  <p className="text-sm">Available upon approval</p>
                  <div className="mt-3 text-xs bg-white/50 rounded px-2 py-1 inline-block">
                    ⏳ Pending approval
                  </div>
                </div>
              )}
            </div>

            {/* Course Application Status */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
                Course Application Status
              </h2>
              {studentProfile.enrollments && studentProfile.enrollments.length > 0 ? (
                <div className="space-y-3">
                  {studentProfile.enrollments.map((enrollment: any) => (
                    <div 
                      key={enrollment.id} 
                      className="flex items-center justify-between p-4 bg-warm-white rounded-lg border-l-4 border-secondary-blue"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-secondary-blue">{enrollment.course_name}</h3>
                        <p className="text-xs text-gray-600">{enrollment.course_category}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full font-bold text-sm ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No course applications yet</p>
                </div>
              )}
            </div>


          </>
        )}

        {/* Event Calendar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
            Event Calendar
          </h2>
          <EventCalendar userRole="student" compact={true} />
        </div>

        {/* Quick Actions - For All Students */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/admission">
              <Button variant="primary" className="w-full py-6 text-lg">
                📝 Apply for Courses
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" className="w-full py-6 text-lg">
                📚 Browse Courses
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="outline" className="w-full py-6 text-lg">
                🎉 Join Events
              </Button>
            </Link>
          </div>
        </div>

        {/* Available Courses */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
            Available Courses
          </h2>
          {courses.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                {courses.slice(0, 6).map((course: any) => (
                  <div key={course.id} className="border-l-4 border-secondary-blue rounded-lg p-4 bg-warm-white hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-lg mb-2 text-secondary-blue">{course.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{course.category}</p>
                    
                    {/* Timeline - Single Line with Words */}
                    {(course.registration_deadline || course.start_date) && (
                      <div className="mb-3 flex items-center gap-4 text-xs">
                        {course.registration_deadline && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-600">Registration Deadline:</span>
                            <span className="font-semibold text-red-600">
                              {new Date(course.registration_deadline).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}
                        {course.start_date && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-600">Starts:</span>
                            <span className="font-semibold text-success">
                              {new Date(course.start_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
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
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📚</div>
              <p>No courses available at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
