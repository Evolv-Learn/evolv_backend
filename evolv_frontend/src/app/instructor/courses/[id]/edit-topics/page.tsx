'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';

// Required for static export
export async function generateStaticParams() {
  return [];
}

export default function EditCourseTopicsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [course, setCourse] = useState<any>(null);
  const [topicsCovered, setTopicsCovered] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/`);
      setCourse(response.data);
      setTopicsCovered(response.data.topics_covered || '');
    } catch (error: any) {
      console.error('Failed to fetch course:', error);
      setError('Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      await apiClient.patch(`/courses/${courseId}/`, {
        topics_covered: topicsCovered,
      });
      
      // Go back to the previous page or dashboard
      router.back();
    } catch (err: any) {
      console.error('Failed to update course topics:', err);
      setError(err.response?.data?.detail || 'Failed to update course topics');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-warm-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
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
      <div className="container mx-auto px-4 max-w-4xl">
        <button 
          onClick={() => router.back()} 
          className="inline-block mb-6"
        >
          <Button variant="outline">
            ← Back
          </Button>
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-2">
              Edit Course Topics
            </h1>
            <p className="text-gray-600">
              {course?.name} - {course?.category}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topics Covered *
              </label>
              <textarea
                value={topicsCovered}
                onChange={(e) => setTopicsCovered(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                placeholder="Enter the topics that will be covered in this course...

Example:
• Introduction to Python Programming
• Variables and Data Types
• Control Flow (if/else, loops)
• Functions and Modules
• Object-Oriented Programming
• File Handling
• Error Handling and Debugging
• Working with APIs
• Data Analysis with Pandas
• Final Project"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                List all topics, modules, and concepts that students will learn in this course. 
                This will be displayed on the course page and in teaching schedules.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> These topics will be visible to students and will appear in all teaching schedules for this course. 
                You can update them anytime, and changes will reflect across all schedules.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Topics'}
              </Button>
              <button 
                type="button"
                onClick={() => router.back()}
                className="flex-1"
              >
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </button>
            </div>
          </form>

          {/* Preview Section */}
          {topicsCovered && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
              <div className="bg-warm-white rounded-lg p-6">
                <p className="text-gray-700 whitespace-pre-wrap">{topicsCovered}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
