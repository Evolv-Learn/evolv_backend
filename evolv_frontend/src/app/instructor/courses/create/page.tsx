'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';

const CATEGORY_OPTIONS = [
  'Quantitative Methods',
  'Qualitative Methods',
  'Spatial Analysis',
  'Research Productivity',
];

export default function CreateCoursePage() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [modules, setModules] = useState<string[]>(['']);
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
    locations: [] as number[],
    partners: [] as number[],
    price_ngn: '',
  });

  useEffect(() => {
    apiClient.get('/locations/')
      .then((res) => setLocations(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const addModule = () => setModules([...modules, '']);
  const removeModule = (i: number) => setModules(modules.filter((_, idx) => idx !== i));
  const updateModule = (i: number, val: string) =>
    setModules(modules.map((m, idx) => (idx === i ? val : m)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.category || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      const payload: any = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        software_tools: formData.software_tools,
        topics_covered: formData.topics_covered,
        registration_deadline: formData.registration_deadline || null,
        selection_date: formData.selection_date || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        locations: formData.location_id ? [Number(formData.location_id)] : [],
        partners: [],
      };

      const courseRes = await apiClient.post('/courses/', payload);
      const courseId = courseRes.data.id;

      // Create NGN price if provided
      if (formData.price_ngn) {
        try {
          await apiClient.post('/admin/prices/', {
            course: courseId,
            currency: 'NGN',
            amount: parseFloat(formData.price_ngn),
            is_active: true,
          });
        } catch (priceErr) {
          console.warn('Price creation failed:', priceErr);
        }
      }

      // Create schedule + modules if module titles and dates are provided
      const filledModules = modules.filter((m) => m.trim());
      if (
        filledModules.length > 0 &&
        formData.start_date &&
        formData.end_date &&
        formData.location_id
      ) {
        try {
          const scheduleRes = await apiClient.post('/schedules/', {
            course: courseId,
            start_date: formData.start_date,
            end_date: formData.end_date,
            location: Number(formData.location_id),
          });
          const scheduleId = scheduleRes.data.id;
          for (let i = 0; i < filledModules.length; i++) {
            await apiClient.post('/modules/', {
              schedule: scheduleId,
              title: filledModules[i],
              order: i + 1,
            });
          }
        } catch (modErr) {
          console.warn('Module creation failed (schedule may be missing dates/location):', modErr);
        }
      }

      router.push('/dashboard?success=course-created');
    } catch (err: any) {
      console.error('Failed to create course:', err);
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to create course');
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
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Timeline &amp; Location</h2>
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
                  <option value="">Select location (optional)</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pricing</h2>
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (NGN ₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.price_ngn}
                    onChange={(e) => setFormData({ ...formData, price_ngn: e.target.value })}
                    placeholder="e.g. 20000"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave blank if not yet decided. Additional currencies can be added later.</p>
              </div>
            </div>

            {/* Modules */}
            <div className="pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Course Modules</h2>
                <button
                  type="button"
                  onClick={addModule}
                  className="text-sm font-medium text-primary-gold border border-primary-gold rounded-lg px-3 py-1.5 hover:bg-primary-gold hover:text-white transition-colors"
                >
                  + Add Module
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Requires Start Date, End Date, and Location to save modules. You can also add/edit modules later.
              </p>
              <div className="space-y-2">
                {modules.map((mod, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-400 w-6 text-right shrink-0">{i + 1}.</span>
                    <input
                      type="text"
                      value={mod}
                      onChange={(e) => updateModule(i, e.target.value)}
                      placeholder={`Module ${i + 1} title`}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold text-sm"
                    />
                    {modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeModule(i)}
                        className="text-gray-400 hover:text-igbo-red transition-colors shrink-0"
                        aria-label="Remove module"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
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
