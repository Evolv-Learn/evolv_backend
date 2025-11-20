'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const response = await apiClient.get(`/courses/${params.id}/`);
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${params.id}`);
      return;
    }
    router.push('/admission');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link href="/courses">
            <Button variant="primary">Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-16">
        <div className="container mx-auto px-4">
          <Link href="/courses" className="text-white hover:text-primary-gold mb-4 inline-block">
            ← Back to Courses
          </Link>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            {course.name}
          </h1>
          <p className="text-xl text-gray-200">
            {course.category}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
                About This Course
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {course.description}
              </p>

              {/* Course Timeline - Compact Grid */}
              {(course.registration_deadline || course.start_date) && (
                <>
                  <h3 className="text-xl font-heading font-bold text-secondary-blue mb-3">
                    Important Dates
                  </h3>
                  <div className="bg-warm-white rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      {course.registration_deadline && (
                        <div className="text-center p-3 bg-white rounded-lg border border-red-200">
                          <div className="text-2xl mb-1">📅</div>
                          <div className="text-xs text-gray-600 mb-1">Deadline</div>
                          <div className="text-sm font-bold text-red-600">
                            {new Date(course.registration_deadline).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      )}
                      {course.selection_date && (
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-2xl mb-1">✅</div>
                          <div className="text-xs text-gray-600 mb-1">Selection</div>
                          <div className="text-sm font-bold text-gray-700">
                            {new Date(course.selection_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      )}
                      {course.start_date && (
                        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                          <div className="text-2xl mb-1">🚀</div>
                          <div className="text-xs text-gray-600 mb-1">Start</div>
                          <div className="text-sm font-bold text-success">
                            {new Date(course.start_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      )}
                      {course.end_date && (
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-2xl mb-1">🎓</div>
                          <div className="text-xs text-gray-600 mb-1">End</div>
                          <div className="text-sm font-bold text-gray-700">
                            {new Date(course.end_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Topics Covered - Compact */}
              {course.topics_covered && (
                <>
                  <h3 className="text-xl font-heading font-bold text-secondary-blue mb-3">
                    What You'll Learn
                  </h3>
                  <div className="bg-warm-white rounded-lg p-4 mb-6">
                    <ul className="grid md:grid-cols-2 gap-2">
                      {course.topics_covered.split('\n').filter((topic: string) => topic.trim()).map((topic: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary-gold mt-0.5 flex-shrink-0">✓</span>
                          <span className="text-gray-700">{topic.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {course.software_tools && (
                <>
                  <h3 className="text-xl font-heading font-bold text-secondary-blue mb-3">
                    Tools & Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {course.software_tools.split(',').map((tool: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-primary-gold text-gray-900 rounded-lg font-medium"
                      >
                        {tool.trim()}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {course.instructor && (
                <>
                  <h3 className="text-xl font-heading font-bold text-secondary-blue mb-3">
                    Instructor
                  </h3>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary-gold rounded-full flex items-center justify-center">
                      <span className="text-2xl">👨‍🏫</span>
                    </div>
                    <div>
                      <p className="font-bold">{course.instructor}</p>
                      <p className="text-sm text-gray-600">Course Instructor</p>
                    </div>
                  </div>
                </>
              )}

              {course.locations && course.locations.length > 0 && (
                <>
                  <h3 className="text-xl font-heading font-bold text-secondary-blue mb-3">
                    Available Locations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {course.locations.map((location: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-warm-white text-gray-700 rounded-lg border border-gray-300"
                      >
                        📍 {location}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-heading font-bold text-secondary-blue mb-4">
                Ready to Start?
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✓</div>
                  <span className="text-gray-700">Free to apply</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✓</div>
                  <span className="text-gray-700">No experience needed</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✓</div>
                  <span className="text-gray-700">Certificate upon completion</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✓</div>
                  <span className="text-gray-700">Job placement support</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full mb-3"
                onClick={handleApply}
              >
                Apply Now
              </Button>

              <Link href="/courses">
                <Button variant="outline" className="w-full">
                  Browse More Courses
                </Button>
              </Link>

              {course.partners && course.partners.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-bold text-sm text-gray-700 mb-3">Partners</h4>
                  <div className="space-y-2">
                    {course.partners.map((partner: string, index: number) => (
                      <div key={index} className="text-sm text-gray-600">
                        🤝 {partner}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
