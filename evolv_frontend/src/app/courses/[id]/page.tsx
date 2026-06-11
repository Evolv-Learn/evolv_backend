'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { coursesApi } from '@/lib/api/courses';

interface Lesson {
  id: number;
  title: string;
  description: string;
  order: number;
}

interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
  lesson_count: number;
  lessons: Lesson[];
}

interface Schedule {
  id: number;
  start_date: string;
  end_date: string;
  location: string;
  instructor: string;
  duration: number;
  modules: Module[];
}

interface CourseDetail {
  id: number;
  name: string;
  category: string;
  description: string;
  software_tools: string;
  topics_covered: string;
  instructor: string;
  locations: string[];
  registration_deadline: string;
  selection_date: string;
  start_date: string;
  end_date: string;
  schedules: Schedule[];
}

export default function CurriculumPage() {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = rawId ? Number(rawId) : null;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    if (id && !isNaN(id)) {
      fetchCurriculum();
    } else {
      setIsLoading(false);
      setNotFound(true);
    }
  }, [id]);

  const fetchCurriculum = async () => {
    try {
      const data = await coursesApi.getCurriculum(id!);
      setCourse(data);
      if (data.schedules?.[0]?.modules?.length <= 4) {
        setOpenModules(new Set(data.schedules[0].modules.map((_: Module, i: number) => i)));
      }
    } catch (err: any) {
      console.error('[CurriculumPage] fetchCurriculum failed:', err?.response?.status, err?.response?.data ?? err?.message ?? err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = (index: number) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const totalLessons = (schedule: Schedule) =>
    schedule.modules.reduce((sum, m) => sum + m.lesson_count, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Programme not found</h2>
          <p className="text-gray-500 mb-6">This programme may no longer be available.</p>
          <Link href="/courses">
            <Button variant="primary">View all programmes</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const activeSchedule = course.schedules?.[0];

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-16 pattern-adire relative">
        <div className="kente-strip absolute top-0 left-0 right-0"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <Link href="/courses" className="text-primary-gold hover:underline text-sm mb-4 inline-block">
              ← Back to Programmes
            </Link>
            <span className="inline-block bg-primary-gold text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-4">
              {course.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">
              {course.name}
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl leading-relaxed mb-8">
              {course.description}
            </p>

            {/* Quick facts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Modules', value: activeSchedule ? `${activeSchedule.modules.length}` : '—' },
                { label: 'Lessons', value: activeSchedule ? `${totalLessons(activeSchedule)}` : '—' },
                { label: 'Duration', value: activeSchedule ? `${activeSchedule.duration} month${activeSchedule.duration !== 1 ? 's' : ''}` : '—' },
                { label: 'Format', value: 'Live on Discord' },
              ].map((fact, i) => (
                <div key={i} className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary-gold">{fact.value}</div>
                  <div className="text-sm text-gray-300 mt-1">{fact.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Left: Curriculum */}
          <div className="lg:col-span-2">
            {/* Tools */}
            {course.software_tools && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border-l-4 border-primary-gold">
                <h2 className="text-xl font-heading font-bold text-secondary-blue mb-3">
                  Tools & Software
                </h2>
                <p className="text-gray-700 leading-relaxed">{course.software_tools}</p>
              </div>
            )}

            {/* Curriculum */}
            {activeSchedule && activeSchedule.modules.length > 0 ? (
              <div>
                <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-6">
                  Course Curriculum
                  <span className="text-base font-normal text-gray-500 ml-3">
                    {activeSchedule.modules.length} modules · {totalLessons(activeSchedule)} lessons
                  </span>
                </h2>

                <div className="space-y-3">
                  {activeSchedule.modules.map((module, index) => (
                    <div key={module.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                      <button
                        onClick={() => toggleModule(index)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 bg-primary-gold text-gray-900 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {module.order}
                          </span>
                          <div>
                            <h3 className="font-heading font-bold text-secondary-blue">
                              {module.title}
                            </h3>
                            {module.description && (
                              <p className="text-sm text-gray-500 mt-0.5">{module.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                          <span className="text-sm text-gray-500 hidden sm:block">
                            {module.lesson_count} lesson{module.lesson_count !== 1 ? 's' : ''}
                          </span>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${openModules.has(index) ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {openModules.has(index) && module.lessons.length > 0 && (
                        <div className="border-t border-gray-100">
                          {module.lessons.map((lesson, li) => (
                            <div
                              key={lesson.id}
                              className={`flex items-start gap-4 px-5 py-4 ${li < module.lessons.length - 1 ? 'border-b border-gray-50' : ''}`}
                            >
                              <span className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs text-gray-400">{lesson.order}</span>
                              </span>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{lesson.title}</p>
                                {lesson.description && (
                                  <p className="text-xs text-gray-500 mt-1">{lesson.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100">
                <p className="text-gray-500 text-lg">
                  Curriculum details are being finalised. Check back soon or apply now to be notified.
                </p>
              </div>
            )}
          </div>

          {/* Right: Sticky apply card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-heading font-bold text-secondary-blue mb-5">
                  Next Cohort
                </h3>
                <div className="space-y-4 mb-6">
                  {[
                    { label: 'Apply by', value: formatDate(course.registration_deadline) },
                    { label: 'Selection', value: formatDate(course.selection_date) },
                    { label: 'Starts', value: formatDate(course.start_date) },
                    { label: 'Ends', value: formatDate(course.end_date) },
                    { label: 'Location', value: course.locations.join(', ') || 'Online' },
                    { label: 'Instructor', value: course.instructor || 'Moshood Owolabi' },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between text-sm border-b border-gray-50 pb-3 last:border-0">
                      <span className="text-gray-500 font-medium">{row.label}</span>
                      <span className="text-gray-900 font-semibold text-right ml-4">{row.value}</span>
                    </div>
                  ))}
                </div>
                <Link href="/admission">
                  <Button variant="primary" size="lg" className="w-full">
                    Apply for This Cohort
                  </Button>
                </Link>
                <Link href="/contact" className="block text-center mt-3 text-sm text-gray-500 hover:text-primary-gold transition-colors">
                  Have a question? Contact us
                </Link>
              </div>

              <div className="bg-secondary-blue text-white rounded-xl p-6">
                <h4 className="font-heading font-bold mb-4">What You Need</h4>
                <ul className="space-y-2 text-sm text-gray-200">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-primary-gold font-bold">✓</span>
                    A laptop with R and RStudio installed (free)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-primary-gold font-bold">✓</span>
                    A Discord account (free)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-primary-gold font-bold">✓</span>
                    Data from your own research or field work
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-primary-gold font-bold">✓</span>
                    No prior coding experience needed
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
