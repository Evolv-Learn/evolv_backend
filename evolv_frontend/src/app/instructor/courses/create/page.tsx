'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';

export default function CreateCoursePage() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
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
    locations: [] as number[],
    partners: [] as number[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [locationsRes, partnersRes, categoriesRes] = await Promise.all([
        apiClient.get('/locations/'),
        apiClient.get('/partners/'),
        apiClient.get('/categories/?is_active=true'),
      ]);
      setLocations(locationsRes.data.results || locationsRes.data);
      setPartners(partnersRes.data.results || partnersRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.category || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      await apiClient.post('/courses/', formData);
      router.push('/dashboard?success=course-created');
    } catch (err: any) {
      console.error('Failed to create course:', err);
      setError(err.response?.data?.detail || 'Failed to create course');
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

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/dashboard" className="inline-block mb-6">
          <Button variant="outline">
            ← Back to My Account
          </Button>
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-6">
            Create New Course
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <Input
                  label="Course Name *"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Introduction to Data Science"
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
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
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
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                    placeholder="Describe what students will learn in this course..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Content</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Software & Tools
                  </label>
                  <Input
                    type="text"
                    value={formData.software_tools}
                    onChange={(e) => setFormData({ ...formData, software_tools: e.target.value })}
                    placeholder="e.g., Python, Pandas, Jupyter, SQL (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topics Covered
                  </label>
                  <textarea
                    value={formData.topics_covered}
                    onChange={(e) => setFormData({ ...formData, topics_covered: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                    placeholder="Enter topics, one per line..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter each topic on a new line</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Timeline</h2>
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
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Creating...' : 'Create Course'}
              </Button>
              <Link href="/dashboard" className="flex-1">
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
