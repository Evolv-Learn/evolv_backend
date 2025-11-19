'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { coursesApi } from '@/lib/api/courses';
import { useAuthStore } from '@/store/auth';

interface Course {
  id: number;
  name: string;
  category: string;
  description: string;
  software_tools: string;
  instructor: string;
  locations: string[];
  partners: string[];
  parent?: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCourse(Number(params.id));
    }
  }, [params.id]);

  const fetchCourse = async (id: number) => {
    try {
      const data = await coursesApi.getById(id);
      setCourse(data);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (isAuthenticated) {
      router.push('/dashboard/apply');
    } else {
      router.push('/register');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold mb-4">Course Not Found</h1>
          <Button onClick={() => router.push('/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Data & AI': return 'from-primary-gold to-primary-gold-dark';
      case 'Cybersecurity': return 'from-igbo-red to-red-700';
      case 'Microsoft Dynamics 365': return 'from-hausa-indigo to-purple-900';
      default: return 'from-success to-green-700';
    }
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${getCategoryColor(course.category)} text-white py-20 pattern-adire relative`}>
        <div className="kente-strip absolute top-0 left-0 right-0"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <span className="px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-semibold inline-block mb-4">
              {course.category}
            </span>
            <h1 className="text-5xl font-heading font-bold mb-4">
              {course.name}
            </h1>
            {course.instructor && (
              <p className="text-xl text-gray-200">
                Taught by {course.instructor}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-heading font-bold text-secondary-blue mb-4">
                About This Course
              </h2>
              <div className="kente-strip mb-6"></div>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>

            {/* Software & Tools */}
            {course.software_tools && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
                  Software & Tools
                </h2>
                <div className="kente-strip mb-6"></div>
                <div className="flex flex-wrap gap-3">
                  {course.software_tools.split(',').map((tool, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary-gold bg-opacity-10 text-primary-gold-dark rounded-lg font-semibold"
                    >
                      {tool.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* What You'll Learn */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
                What You'll Learn
              </h2>
              <div className="kente-strip mb-6"></div>
              <ul className="space-y-3">
                {[
                  'Master the fundamentals and advanced concepts',
                  'Build real-world projects',
                  'Learn industry best practices',
                  'Get hands-on experience with tools',
                  'Prepare for professional opportunities',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-success flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-2">
                  Ready to Start?
                </h3>
                <p className="text-gray-600">
                  Join hundreds of students learning this course
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mb-3"
                onClick={handleApply}
              >
                Apply Now
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/contact')}
              >
                Contact Us
              </Button>

              <div className="kente-strip my-6"></div>

              {/* Course Info */}
              <div className="space-y-4 text-sm">
                {course.locations && course.locations.length > 0 && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Locations</p>
                      <p className="text-gray-600">{course.locations.join(', ')}</p>
                    </div>
                  </div>
                )}

                {course.partners && course.partners.length > 0 && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Partners</p>
                      <p className="text-gray-600">{course.partners.join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-secondary-blue to-secondary-blue-dark text-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-heading font-bold mb-2">
                Have Questions?
              </h3>
              <p className="text-gray-200 text-sm mb-4">
                Our team is here to help you make the right choice
              </p>
              <Button
                variant="outline"
                className="w-full bg-white text-secondary-blue hover:bg-gray-100"
                onClick={() => router.push('/contact')}
              >
                Get in Touch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
