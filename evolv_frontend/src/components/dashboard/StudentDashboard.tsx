'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';
import EventCalendar from '@/components/calendar/EventCalendar';

export default function StudentDashboard() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [applicationStatus, setApplicationStatus] = useState<string>('Not Applied');
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [payingEnrollmentId, setPayingEnrollmentId] = useState<number | null>(null);

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
        apiClient.get('/courses/?public=true'),
        apiClient.get('/events/'),
      ]);
      setCourses(coursesRes.data.results || coursesRes.data);
      setEvents(eventsRes.data.results || eventsRes.data);
      
      // Fetch student profile
      try {
        const studentRes = await apiClient.get('/students/me/');
        setStudentProfile(studentRes.data);
        
        // Check if any enrollment is approved
        const hasApprovedEnrollment = studentRes.data.enrollments?.some(
          (enrollment: any) => enrollment.status === 'Approved'
        );
        
        if (hasApprovedEnrollment) {
          setApplicationStatus('Approved');
        } else {
          setApplicationStatus('Under Review');
        }
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

  const firstName = user?.first_name || user?.username || 'there';
  const initials = firstName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-warm-white py-6">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-4 bg-green-50 border-l-4 border-success p-3 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-success shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <div>
              <p className="font-semibold text-success text-sm">
                {searchParams.get('success') === 'courses-updated' ? 'Courses updated!' : 'Application submitted!'}
              </p>
              <p className="text-xs text-gray-600">
                {searchParams.get('success') === 'courses-updated'
                  ? 'Your course selection has been updated.'
                  : "We'll review your application within 3–5 business days."}
              </p>
            </div>
          </div>
        )}

        {/* Welcome Row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-secondary-blue flex items-center justify-center text-white font-bold text-lg shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-secondary-blue leading-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="ml-auto hidden md:block">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(applicationStatus)}`}>
              {applicationStatus}
            </span>
          </div>
        </div>

        {/* New Student — compact onboarding + CTA combined */}
        {!studentProfile && (
          <div className="rounded-2xl overflow-hidden shadow-lg mb-6 border border-gray-100">
            {/* Top strip */}
            <div className="bg-secondary-blue px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-white font-heading font-bold text-lg">Your journey starts here</h2>
                <p className="text-gray-300 text-xs mt-0.5">3 steps to get started — you've already completed step 1</p>
              </div>
              <span className="text-xs font-bold text-secondary-blue bg-primary-gold px-3 py-1 rounded-full">
                {Math.round(onboarding.percentage)}% done
              </span>
            </div>

            {/* Progress bar */}
            <div className="bg-secondary-blue-dark px-6 pb-4">
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="bg-primary-gold h-full rounded-full transition-all duration-700"
                  style={{ width: `${onboarding.percentage}%` }}
                />
              </div>
            </div>

            {/* Steps — horizontal compact */}
            <div className="bg-white px-6 py-5">
              <div className="flex items-start gap-3">
                {onboarding.steps.map((step, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center text-center relative">
                    {/* Connector line */}
                    {index < onboarding.steps.length - 1 && (
                      <div className={`absolute top-4 left-1/2 w-full h-0.5 ${step.done ? 'bg-primary-gold' : 'bg-gray-200'}`} />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 relative ${
                      step.done ? 'bg-success text-white' : index === 1 ? 'bg-secondary-blue text-white ring-2 ring-secondary-blue ring-offset-2' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.done
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                        : index + 1}
                    </div>
                    <p className={`text-xs mt-2 font-medium ${step.done ? 'text-gray-500' : index === 1 ? 'text-secondary-blue' : 'text-gray-400'}`}>
                      {step.name}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Ready to apply?</p>
                  <p className="text-xs text-gray-500">The application takes less than 5 minutes. It's free.</p>
                </div>
                <Link href="/admission">
                  <button className="bg-primary-gold hover:bg-yellow-500 text-secondary-blue-dark font-bold text-sm px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap">
                    Submit Application →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* For enrolled students - Primary Actions */}
        {studentProfile && (
          <>
            {/* Primary Action Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Link href="/dashboard/profile">
                <div className="bg-secondary-blue rounded-xl p-4 text-white hover:opacity-90 transition-opacity cursor-pointer group">
                  <svg className="w-6 h-6 mb-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  <p className="font-bold text-sm">My Profile</p>
                  <p className="text-xs text-gray-300 mt-0.5">View & update details</p>
                </div>
              </Link>

              <Link href="/dashboard/courses">
                <div className="bg-primary-gold rounded-xl p-4 text-gray-900 hover:opacity-90 transition-opacity cursor-pointer">
                  <svg className="w-6 h-6 mb-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  <p className="font-bold text-sm">My Courses</p>
                  {studentProfile.courses?.length > 0 && (
                    <p className="text-xs mt-0.5 font-semibold">{studentProfile.courses.length} enrolled</p>
                  )}
                </div>
              </Link>

              <Link href="/dashboard/assignments">
                <div className="bg-hausa-indigo rounded-xl p-4 text-white hover:opacity-90 transition-opacity cursor-pointer">
                  <svg className="w-6 h-6 mb-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  <p className="font-bold text-sm">Assignments</p>
                  <p className="text-xs text-gray-300 mt-0.5">Submit & view feedback</p>
                </div>
              </Link>

              {applicationStatus === 'Approved' ? (
                <Link href="/materials">
                  <div className="bg-success rounded-xl p-4 text-white hover:opacity-90 transition-opacity cursor-pointer">
                    <svg className="w-6 h-6 mb-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                    <p className="font-bold text-sm">Materials</p>
                    <p className="text-xs text-gray-200 mt-0.5">Access resources</p>
                  </div>
                </Link>
              ) : (
                <div className="bg-gray-100 rounded-xl p-4 text-gray-400 relative overflow-hidden">
                  <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Soon</span>
                  <svg className="w-6 h-6 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  <p className="font-bold text-sm">Materials</p>
                  <p className="text-xs mt-0.5">Unlocks on approval</p>
                </div>
              )}
            </div>

            {/* Course Application Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
              <h2 className="text-base font-heading font-bold text-secondary-blue mb-3">
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
                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-full font-bold text-sm ${getStatusColor(enrollment.status)}`}>
                          {enrollment.status}
                        </div>
                        {enrollment.status === 'Approved' && !enrollment.payment_status && (
                          <button
                            disabled={payingEnrollmentId === enrollment.id}
                            onClick={async () => {
                              setPayingEnrollmentId(enrollment.id);
                              try {
                                const res = await apiClient.post('/payments/initiate/', {
                                  enrollment_id: enrollment.id,
                                  currency: 'NGN',
                                });
                                if (res.data.authorization_url) {
                                  sessionStorage.setItem('evolv_payment_id', String(res.data.id));
                                  window.location.href = res.data.authorization_url;
                                }
                              } catch {
                                setPayingEnrollmentId(null);
                              }
                            }}
                            className="bg-primary-gold text-secondary-blue-dark text-xs font-semibold px-3 py-2 rounded-lg hover:bg-yellow-400 disabled:opacity-60 transition-colors whitespace-nowrap"
                          >
                            {payingEnrollmentId === enrollment.id ? 'Redirecting…' : 'Pay Now'}
                          </button>
                        )}
                        {enrollment.payment_status === 'paid' && (
                          <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                            Paid
                          </span>
                        )}
                        {enrollment.payment_status === 'pending' && (
                          <button
                            disabled={payingEnrollmentId === enrollment.id}
                            onClick={async () => {
                              setPayingEnrollmentId(enrollment.id);
                              try {
                                const res = await apiClient.post('/payments/initiate/', {
                                  enrollment_id: enrollment.id,
                                  currency: 'NGN',
                                });
                                if (res.data.authorization_url) {
                                  sessionStorage.setItem('evolv_payment_id', String(res.data.id));
                                  window.location.href = res.data.authorization_url;
                                }
                              } catch {
                                setPayingEnrollmentId(null);
                              }
                            }}
                            className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg hover:bg-amber-100 disabled:opacity-60 transition-colors whitespace-nowrap"
                          >
                            {payingEnrollmentId === enrollment.id ? 'Redirecting…' : 'Complete Payment'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-sm">No course applications yet</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Event Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="text-base font-heading font-bold text-secondary-blue mb-3">
            Event Calendar
          </h2>
          <EventCalendar userRole="student" compact={true} />
        </div>

        {/* Quick Actions + Available Courses — side by side on desktop */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-heading font-bold text-secondary-blue mb-3">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Link href="/admission">
                <button className="w-full bg-secondary-blue hover:bg-secondary-blue-dark text-white font-semibold text-sm py-2.5 rounded-lg transition-colors">
                  Apply for Courses
                </button>
              </Link>
              <Link href="/courses">
                <button className="w-full border border-secondary-blue text-secondary-blue hover:bg-secondary-blue hover:text-white font-semibold text-sm py-2.5 rounded-lg transition-colors">
                  Browse Courses
                </button>
              </Link>
              <Link href="/events">
                <button className="w-full border border-gray-200 text-gray-600 hover:border-secondary-blue hover:text-secondary-blue font-semibold text-sm py-2.5 rounded-lg transition-colors">
                  Join Events
                </button>
              </Link>
            </div>
          </div>

          {/* Available Courses */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-heading font-bold text-secondary-blue">Available Courses</h2>
              {courses.length > 3 && (
                <Link href="/courses" className="text-xs text-primary-gold font-semibold hover:underline">
                  View all →
                </Link>
              )}
            </div>

            {courses.length > 0 ? (
              <div className="space-y-3">
                {courses.slice(0, 3).map((course: any) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 border-l-4 border-secondary-blue rounded-lg bg-warm-white hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-secondary-blue truncate">{course.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{course.category}</p>
                      {(course.registration_deadline || course.start_date) && (
                        <div className="flex gap-3 mt-1 text-xs">
                          {course.registration_deadline && (
                            <span className="text-red-500 font-medium">
                              Deadline: {new Date(course.registration_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          {course.start_date && (
                            <span className="text-success font-medium">
                              Starts: {new Date(course.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Link href={`/courses/${course.id}`} className="ml-3 shrink-0">
                      <button className="text-xs border border-secondary-blue text-secondary-blue hover:bg-secondary-blue hover:text-white px-3 py-1.5 rounded-lg transition-colors font-semibold">
                        View
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">No courses available at the moment</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
