'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';

// Required for static export
export async function generateStaticParams() {
  return [];
}

interface Location {
  id: number;
  name: string;
  location_type: string;
}

interface Course {
  id: number;
  name: string;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    course: '',
    is_virtual: false,
    image: null as File | null,
    currentImage: '',
  });

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventRes, locationsRes, coursesRes] = await Promise.all([
        apiClient.get(`/events/${eventId}/`),
        apiClient.get('/locations/'),
        apiClient.get('/courses/'),
      ]);

      const event = eventRes.data;
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
        location: event.location?.id?.toString() || '',
        course: event.course?.id?.toString() || '',
        is_virtual: event.is_virtual || false,
        image: null,
        currentImage: event.image || '',
      });

      setLocations(locationsRes.data.results || locationsRes.data);
      setCourses(coursesRes.data.results || coursesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load event data');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('is_virtual', String(formData.is_virtual));
      
      if (formData.location) {
        formDataToSend.append('location', formData.location);
      }
      if (formData.course) {
        formDataToSend.append('course', formData.course);
      }
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await apiClient.patch(`/events/${eventId}/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Event updated successfully!');
      router.push('/admin/events');
    } catch (error) {
      console.error('Failed to update event:', error);
      alert('Failed to update event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading event...</p>
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
            onClick={() => router.push('/admin/events')}
            className="flex items-center gap-2"
          >
            <span>←</span> Back to Events
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
            Edit Event ✏️
          </h1>
          <p className="text-gray-600">Update event details</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Title */}
            <Input
              label="Event Title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Data Science Workshop"
              required
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the event..."
                rows={4}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              />
            </div>

            {/* Date and Time */}
            <Input
              label="Date and Time"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            {/* Virtual Event Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_virtual"
                checked={formData.is_virtual}
                onChange={(e) => setFormData({ ...formData, is_virtual: e.target.checked })}
                className="w-4 h-4 text-primary-gold focus:ring-primary-gold border-gray-300 rounded"
              />
              <label htmlFor="is_virtual" className="text-sm font-medium text-gray-700">
                This is a virtual event
              </label>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.location_type})
                  </option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Course (Optional)
              </label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Image */}
            {formData.currentImage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Image
                </label>
                <img
                  src={formData.currentImage}
                  alt="Current event"
                  className="w-48 h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* New Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.currentImage ? 'Replace Image (Optional)' : 'Event Image (Optional)'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={isLoading}
              >
                Update Event
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/events')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
