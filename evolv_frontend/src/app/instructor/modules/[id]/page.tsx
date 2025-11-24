'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';

export default function ModuleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id;
  
  const [module, setModule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (moduleId) {
      fetchModuleDetails();
    }
  }, [moduleId]);

  const fetchModuleDetails = async () => {
    try {
      const response = await apiClient.get(`/modules/${moduleId}/`);
      setModule(response.data);
    } catch (error: any) {
      console.error('Failed to fetch module details:', error);
      setError(error.response?.data?.detail || 'Failed to load module details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      await apiClient.delete(`/lessons/${lessonId}/`);
      fetchModuleDetails(); // Refresh
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete lesson');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading module...</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-warm-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error || 'Module not found'}</p>
            <Link href="/dashboard" className="inline-block mt-4">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/dashboard" className="inline-block mb-6">
          <Button variant="outline">
            ← Back to Dashboard
          </Button>
        </Link>

        {/* Module Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-secondary-blue text-white px-4 py-2 rounded-full text-sm font-bold">
                  Module {module.order}
                </span>
                <h1 className="text-3xl font-heading font-bold text-secondary-blue">
                  {module.title}
                </h1>
              </div>
              <p className="text-gray-600 mb-2">
                📚 {module.schedule}
              </p>
            </div>
            <Link href={`/instructor/modules/${moduleId}/edit`}>
              <Button variant="primary">
                ✏️ Edit Module
              </Button>
            </Link>
          </div>

          {module.description && (
            <div className="bg-warm-white rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{module.description}</p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-4">
            <div className="bg-primary-gold text-gray-900 px-4 py-2 rounded-lg font-semibold">
              📖 {module.lessons_count || 0} Lessons
            </div>
          </div>
        </div>

        {/* Lessons Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue">
              Lessons
            </h2>
            <Link href={`/instructor/modules/${moduleId}/lessons/create`}>
              <Button variant="primary">
                + Add Lesson
              </Button>
            </Link>
          </div>

          {module.lessons && module.lessons.length > 0 ? (
            <div className="space-y-4">
              {module.lessons.map((lesson: any) => (
                <div 
                  key={lesson.id}
                  className="border-l-4 border-primary-gold rounded-lg p-6 bg-warm-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">
                          Lesson {lesson.order}
                        </span>
                        <h3 className="text-xl font-bold text-secondary-blue">
                          {lesson.title}
                        </h3>
                      </div>
                      
                      {lesson.description && (
                        <p className="text-gray-600 mb-3">
                          {lesson.description}
                        </p>
                      )}

                      {lesson.content && (
                        <div className="bg-white rounded-lg p-4 mb-3">
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Content:</h4>
                          <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-3">
                            {lesson.content}
                          </p>
                        </div>
                      )}

                      {lesson.resources && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">🔗 Resources:</span>
                          <a 
                            href={lesson.resources} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-secondary-blue hover:underline"
                          >
                            {lesson.resources}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Link href={`/instructor/lessons/${lesson.id}/edit`}>
                        <Button variant="outline" size="sm">
                          ✏️ Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-bold mb-2">No Lessons Yet</h3>
              <p className="mb-4">Start adding lessons to this module</p>
              <Link href={`/instructor/modules/${moduleId}/lessons/create`}>
                <Button variant="primary">
                  Add First Lesson
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
