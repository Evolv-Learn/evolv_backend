'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';
import { useRequireAuth } from '@/lib/auth/useRequireAuth';

const CATEGORY_OPTIONS = [
  'Quantitative Methods',
  'Qualitative Methods',
  'Spatial Analysis',
  'Research Productivity',
];

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;
  const isAuthReady = useRequireAuth();

  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    software_tools: '',
    topics_covered: '',
    registration_deadline: '',
    selection_date: '',
    start_date: '',
    end_date: '',
    location_id: '' as string | number,
  });

  useEffect(() => {
    if (!isAuthReady) return;
    fetchData();
  }, [isAuthReady, courseId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [courseRes, locRes] = await Promise.all([
        apiClient.get(`/courses/${courseId}/`),
        apiClient.get('/locations/'),
      ]);

      const c = courseRes.data;
      setFormData({
        name:                  c.name ?? '',
        category:              c.category ?? '',
        description:           c.description ?? '',
        software_tools:        c.software_tools ?? '',
        topics_covered:        c.topics_covered ?? '',
        registration_deadline: c.registration_deadline ?? '',
        selection_date:        c.selection_date ?? '',
        start_date:            c.start_date ?? '',
        end_date:              c.end_date ?? '',
        location_id:           c.locations?.[0]?.id ?? '',
      });

      setLocations(locRes.data.results || locRes.data);
    } catch (err) {
      console.error('Failed to load course:', err);
      setError('Failed to load course data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.category || !formData.description) {
      setError('Course name, category, and description are required.');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.patch(`/courses/${courseId}/`, {
        name:                  formData.name,
        category:              formData.category,
        description:           formData.description,
        software_tools:        formData.software_tools,
        topics_covered:        formData.topics_covered,
        registration_deadline: formData.registration_deadline || null,
        selection_date:        formData.selection_date || null,
        start_date:            formData.start_date || null,
        end_date:              formData.end_date || null,
        locations:             formData.location_id ? [Number(formData.location_id)] : [],
        partners:              [],
      });

      setSuccess('Course updated successfully!');
      setTimeout(() => router.push('/admin/courses'), 1500);
    } catch (err: any) {
      console.error('Failed to update course:', err);
      setError(
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        'Failed to update course. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto mb-4" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/courses')}
            className="flex items-center gap-2"
          >
            <span>←</span> Back to Courses
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-2">
            Edit Course ✏️
          </h1>
          <p className="text-gray-500 mb-6">
            Update all course details, dates, and settings below.
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Basic Information */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <Input
                  label="Course Name *"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., R for Quantitative Research"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                    required
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                    placeholder="Describe what students will learn..."
                    required
                  />
                </div>
              </div>
            </section>

            {/* Course Content */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                Course Content
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Software &amp; Tools
                  </label>
                  <Input
                    type="text"
                    value={formData.software_tools}
                    onChange={(e) => setFormData({ ...formData, software_tools: e.target.value })}
                    placeholder="e.g., R, RStudio, ggplot2, lme4, Git, GitHub"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topics Covered
                  </label>
                  <textarea
                    value={formData.topics_covered}
                    onChange={(e) => setFormData({ ...formData, topics_covered: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                    placeholder="Enter each topic on a new line..."
                  />
                  <p className="text-xs text-gray-500 mt-1">One topic per line</p>
                </div>
              </div>
            </section>

            {/* Timeline & Location */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                Timeline &amp; Location
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Registration Deadline"
                  type="date"
                  value={formData.registration_deadline}
                  onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                />
                <Input
                  label="Selection Date"
                  type="date"
                  value={formData.selection_date}
                  onChange={(e) => setFormData({ ...formData, selection_date: e.target.value })}
                />
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </section>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : '💾 Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/courses')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
