'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';

export default function EditModulePage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    schedule: '',
  });

  useEffect(() => {
    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      const response = await apiClient.get(`/modules/${moduleId}/`);
      const module = response.data;
      setFormData({
        title: module.title || '',
        description: module.description || '',
        order: module.order || 1,
        schedule: module.schedule || '',
      });
    } catch (error: any) {
      console.error('Failed to fetch module:', error);
      setError('Failed to load module');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.order) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      await apiClient.patch(`/modules/${moduleId}/`, {
        title: formData.title,
        description: formData.description,
        order: formData.order,
      });
      router.push(`/instructor/modules/${moduleId}`);
    } catch (err: any) {
      console.error('Failed to update module:', err);
      setError(err.response?.data?.detail || err.response?.data?.order?.[0] || 'Failed to update module');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this module? All lessons in this module will also be deleted.')) {
      return;
    }

    try {
      await apiClient.delete(`/modules/${moduleId}/`);
      router.push('/dashboard?success=module-deleted');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete module');
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
            Edit Module
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Module Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to Python"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                placeholder="Describe what students will learn in this module..."
              />
            </div>

            <Input
              label="Module Order *"
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              required
              helperText="The order in which this module appears in the schedule"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Changing the module order may affect how it appears in the course schedule.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href={`/instructor/modules/${moduleId}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-600 mb-4">
              Deleting this module will also delete all lessons within it. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              🗑️ Delete Module
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
