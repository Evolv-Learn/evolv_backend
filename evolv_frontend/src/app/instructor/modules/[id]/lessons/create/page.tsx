'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';

export default function CreateLessonPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id;
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    resources: '',
    order: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.order) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      await apiClient.post('/lessons/', {
        ...formData,
        module: moduleId,
      });
      router.push(`/instructor/modules/${moduleId}`);
    } catch (err: any) {
      console.error('Failed to create lesson:', err);
      setError(err.response?.data?.detail || err.response?.data?.order?.[0] || 'Failed to create lesson');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href={`/instructor/modules/${moduleId}`} className="inline-block mb-6">
          <Button variant="outline">
            ← Back to Module
          </Button>
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-6">
            Create New Lesson
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Lesson Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Variables and Data Types"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                placeholder="Brief description of the lesson..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold font-mono text-sm"
                placeholder="Enter the lesson content, topics to cover, exercises, etc..."
              />
              <p className="mt-1 text-xs text-gray-500">
                You can include topics, key concepts, exercises, and any other teaching materials
              </p>
            </div>

            <Input
              label="Resources URL"
              type="url"
              value={formData.resources}
              onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
              placeholder="https://example.com/resources"
              helperText="Link to additional learning resources (videos, articles, etc.)"
            />

            <Input
              label="Lesson Order *"
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              required
              helperText="The order in which this lesson appears in the module"
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Creating...' : 'Create Lesson'}
              </Button>
              <Link href={`/instructor/modules/${moduleId}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
