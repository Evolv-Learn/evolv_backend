'use client';

import { useRouter } from 'next/navigation';
import EventCalendar from '@/components/calendar/EventCalendar';

export default function AdminEventCalendarPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <span>←</span> Back to My Account
          </button>
        </div>

        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
              Event Calendar 📅
            </h1>
            <p className="text-gray-600">View and manage all scheduled events</p>
          </div>
          <button
            onClick={() => router.push('/admin/events/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            ➕ Create Event
          </button>
        </div>

        {/* Calendar Component */}
        <EventCalendar userRole="admin" />
      </div>
    </div>
  );
}
