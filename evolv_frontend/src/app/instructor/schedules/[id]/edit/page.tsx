'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';

export default function EditSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id;
  
  const [courses, setCourses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    course: '',
    start_date: '',
    end_date: '',
    location: '',
  });

  useEffect(() => {
    if (scheduleId) {
      fetchData();
    }
  }, [scheduleId]);

  const fetchData = async () => {
    try {
      const [scheduleRes, coursesRes, locationsRes] = await Promise.all([
        apiClient.get(`/schedules/${scheduleId}/`),
        apiClient.get('/courses/'),
        apiClient.get('/locations/'),
      ]);
      
      const schedule = scheduleRes.data;
      setFormData({
        course: schedule.course || '',
        start_date: schedule.start_date || '',
        end_date: schedule.end_date || '',
        location: schedule.location || '',
      });
      
      setCourses(coursesRes.data.results || coursesRes.data);
      setLocations(locationsRes.data.results || locationsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load schedule data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.course || !formData.start_date || !formData.end_date || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      setError('End date must be after start date');
      return;
    }

    setIsSaving(true);

    try {
      await apiClient.patch(`/schedules/${scheduleId}/`, formData);
      router.push(`/instructor/schedules/${scheduleId}`);
    } catch (err: any) {
      console.error('Failed to update schedule:', err);
      setError(err.response?.data?.detail || 'Failed to update schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/schedules/${scheduleId}/`);
      router.push('/dashboard?success=schedule-deleted');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete schedule');
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
        <Link href={`/instructor/schedules/${scheduleId}`} className="inline-block mb-6">
          <Button variant="outline">
            ← Back to Schedule
          </Button>
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-6">
            Edit Learning Schedule
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} - {course.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Start Date *"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
              <Input
                label="End Date *"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                required
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.location_type}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Changing the course will update the topics covered. Changes to dates will affect the schedule duration.
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
              <Link href={`/instructor/schedules/${scheduleId}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-600 mb-4">
              Deleting this schedule will remove it permanently. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              🗑️ Delete Schedule
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
