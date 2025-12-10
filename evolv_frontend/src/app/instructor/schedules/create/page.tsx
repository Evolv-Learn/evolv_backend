'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';

export default function CreateSchedulePage() {
  const router = useRouter();
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
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, locationsRes] = await Promise.all([
        apiClient.get('/courses/'),
        apiClient.get('/locations/'),
      ]);
      setCourses(coursesRes.data.results || coursesRes.data);
      setLocations(locationsRes.data.results || locationsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load courses and locations');
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
      await apiClient.post('/schedules/', formData);
      router.push('/dashboard?success=schedule-created');
    } catch (err: any) {
      console.error('Failed to create schedule:', err);
      setError(err.response?.data?.detail || 'Failed to create schedule');
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
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/dashboard" className="inline-block mb-6">
          <Button variant="outline">
            ← Back to My Account
          </Button>
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-6">
            Create Learning Schedule
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
                onChange={(e) => {
                  const courseId = e.target.value;
                  const course = courses.find(c => c.id === parseInt(courseId));
                  setSelectedCourse(course);
                  
                  // Auto-fill location if course has only one location
                  const locationId = course?.locations?.length === 1 ? course.locations[0].id : '';
                  
                  setFormData({ 
                    ...formData, 
                    course: courseId,
                    start_date: course?.start_date || '',
                    end_date: course?.end_date || '',
                    location: locationId,
                  });
                }}
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
              {selectedCourse && (selectedCourse.start_date || selectedCourse.end_date) && (
                <p className="mt-2 text-sm text-gray-600">
                  Course dates: {selectedCourse.start_date ? new Date(selectedCourse.start_date).toLocaleDateString() : 'Not set'} - {selectedCourse.end_date ? new Date(selectedCourse.end_date).toLocaleDateString() : 'Not set'}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Start Date *"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Auto-filled from course, you can modify if needed
                </p>
              </div>
              <div>
                <Input
                  label="End Date *"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Auto-filled from course, you can modify if needed
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Location *
                </label>
                {selectedCourse && selectedCourse.locations?.length > 0 && (
                  <div className="relative group">
                    <span className="cursor-help text-blue-600 hover:text-blue-700">
                      ℹ️
                    </span>
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-72">
                      <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
                        <p className="font-semibold mb-2">💡 Course Locations:</p>
                        <div className="space-y-1">
                          {selectedCourse.locations.map((location: any) => (
                            <div key={location.id} className="flex items-center gap-1">
                              <span className="text-green-400">✓</span>
                              <span>{location.name} - {location.location_type}</span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-gray-300 text-xs">
                          These are recommended, but you can select any location.
                        </p>
                        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                required
              >
                <option value="">Select a location</option>
                {locations.map((location) => {
                  // Check if this location is in the course's locations
                  const isInCourse = selectedCourse?.locations?.some((loc: any) => loc.id === location.id);
                  return (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.location_type} {isInCourse ? '✓' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The dates and location are automatically filled from the course information. You can modify them if needed for this specific schedule. After creating the schedule, you can add modules and lessons to organize your course content.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Creating...' : 'Create Schedule'}
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
