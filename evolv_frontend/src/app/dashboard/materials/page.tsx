'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/lib/api/client';

const getApiError = (error: unknown, fallback: string) => {
  if (
    typeof error === 'object'
    && error !== null
    && 'response' in error
    && typeof error.response === 'object'
    && error.response !== null
    && 'data' in error.response
    && typeof error.response.data === 'object'
    && error.response.data !== null
    && 'detail' in error.response.data
    && typeof error.response.data.detail === 'string'
  ) {
    return error.response.data.detail;
  }
  return fallback;
};

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  resources: string | null;
  completed: boolean;
}

interface Module {
  id: number;
  title: string;
  description: string | null;
  order: number;
  unlocked: boolean;
  completed: boolean;
  completed_lessons: number;
  total_lessons: number;
  lessons: Lesson[];
}

interface Schedule {
  id: number;
  course: string;
  start_date: string;
  end_date: string;
  modules: Module[];
}

export default function MaterialsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingLesson, setIsSavingLesson] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchModules = useCallback(async () => {
    try {
      const response = await apiClient.get('/students/me/learning-modules/');
      setSchedules(response.data.schedules || []);
      setError('');
    } catch (err: unknown) {
      setError(getApiError(err, 'Unable to load your learning modules.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchModules();
  }, [fetchModules, isAuthenticated, router]);

  const completeLesson = async (lessonId: number) => {
    setIsSavingLesson(lessonId);
    setError('');
    try {
      await apiClient.post('/students/me/progress/', { lesson: lessonId });
      await fetchModules();
    } catch (err: unknown) {
      setError(getApiError(err, 'Could not save lesson progress.'));
    } finally {
      setIsSavingLesson(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="kente-strip mb-6" />
          <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-3">
            Learning Materials
          </h1>
          <p className="text-gray-600 mb-6">
            Complete every lesson in a module to unlock the next module.
          </p>

          {error && (
            <div role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {schedules.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-6 text-gray-700">
              No learning modules are available yet. Your course must be approved and
              you must be enrolled in its schedule before materials can be released.
            </div>
          ) : (
            <div className="space-y-8">
              {schedules.map((schedule) => (
                <section key={schedule.id} aria-label={`${schedule.course} modules`}>
                  <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
                    {schedule.course}
                  </h2>
                  <div className="space-y-4">
                    {schedule.modules.map((module) => (
                      <article
                        key={module.id}
                        className={`rounded-lg border p-5 ${
                          module.unlocked ? 'border-primary-gold bg-white' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-secondary-blue">
                              Module {module.order}: {module.title}
                            </h3>
                            {module.description && (
                              <p className="mt-1 text-sm text-gray-600">{module.description}</p>
                            )}
                          </div>
                          <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                            {module.unlocked
                              ? `${module.completed_lessons}/${module.total_lessons} lessons`
                              : 'Locked'}
                          </span>
                        </div>

                        {module.unlocked && (
                          <div className="mt-4 space-y-4">
                            {module.lessons.map((lesson) => (
                              <div key={lesson.id} className="rounded-md border border-gray-100 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                                  {lesson.completed ? (
                                    <span className="text-sm font-medium text-green-700">Completed</span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={isSavingLesson === lesson.id}
                                      onClick={() => completeLesson(lesson.id)}
                                      className="rounded-md bg-secondary-blue px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                                    >
                                      {isSavingLesson === lesson.id ? 'Saving…' : 'Mark complete'}
                                    </button>
                                  )}
                                </div>
                                {lesson.description && (
                                  <p className="mt-2 text-sm text-gray-600">{lesson.description}</p>
                                )}
                                {lesson.content && (
                                  <div className="mt-3 whitespace-pre-wrap text-sm text-gray-800">
                                    {lesson.content}
                                  </div>
                                )}
                                {lesson.resources && (
                                  <a
                                    className="mt-3 inline-block text-sm font-medium text-blue-700 underline"
                                    href={lesson.resources}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Open lesson resource
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
