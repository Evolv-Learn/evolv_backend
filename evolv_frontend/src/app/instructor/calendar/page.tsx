'use client';

import { useRouter } from 'next/navigation';
import EventCalendar from '@/components/calendar/EventCalendar';
import { Button } from '@/components/ui/Button';

export default function InstructorCalendarPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <span>←</span> Back to My Account
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
            Event Calendar
          </h1>
          <p className="text-gray-600">View and manage your scheduled events</p>
        </div>

        {/* Calendar Component */}
        <EventCalendar userRole="instructor" />
      </div>
    </div>
  );
}
