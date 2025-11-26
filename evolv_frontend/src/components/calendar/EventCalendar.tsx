'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  end_date?: string;
  event_type: string;
  is_virtual: boolean;
  location: string;
  course: string;
  speaker_name?: string;
  meeting_link?: string;
  capacity?: number;
  attendee_count: number;
  is_full: boolean;
}

interface EventCalendarProps {
  userRole?: 'admin' | 'instructor' | 'student';
}

export default function EventCalendar({ userRole = 'admin' }: EventCalendarProps) {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      console.log('Fetching events for:', { year, month });
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/calendar/?year=${year}&month=${month}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Events received:', data);
        setEvents(data.events || []);
      } else {
        console.error('Failed to fetch events:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDay = (day: number) => {
    const filtered = events.filter(event => {
      // Parse the event date string properly
      const eventDate = new Date(event.date);
      
      // Get UTC date components to avoid timezone issues
      const eventDay = eventDate.getUTCDate();
      const eventMonth = eventDate.getUTCMonth();
      const eventYear = eventDate.getUTCFullYear();
      
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const matches = (
        eventDay === day &&
        eventMonth === currentMonth &&
        eventYear === currentYear
      );
      
      // Debug logging
      console.log(`Checking event "${event.title}" for day ${day}:`, {
        eventDate: event.date,
        eventDay,
        eventMonth,
        eventYear,
        targetDay: day,
        targetMonth: currentMonth,
        targetYear: currentYear,
        matches
      });
      
      return matches;
    });
    return filtered;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleEventClick = (eventId: number) => {
    if (userRole === 'admin') {
      router.push(`/admin/events/${eventId}/edit`);
    } else {
      router.push(`/events/${eventId}`);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-xl">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Calendar Controls */}
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <button
          onClick={() => navigateMonth('prev')}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          ← Previous
        </button>
        
        <h2 className="text-2xl font-semibold">{monthName}</h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-100 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center font-semibold text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="border p-2 bg-gray-50 min-h-[100px]" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayEvents = getEventsForDay(day);
            const today = new Date();
            const isToday = 
              day === today.getDate() &&
              currentDate.getMonth() === today.getMonth() &&
              currentDate.getFullYear() === today.getFullYear();

            return (
              <div
                key={day}
                className={`border p-2 min-h-[100px] ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
              >
                <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      className="text-xs p-1 rounded cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-800 truncate transition-colors"
                      title={`${event.title} - ${event.event_type}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-[10px] opacity-75">
                        {new Date(event.date).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Debug Info */}
      {events.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-semibold text-yellow-800 mb-2">Debug Info:</p>
          <div className="text-xs text-yellow-700 space-y-1">
            {events.map(event => {
              const eventDate = new Date(event.date);
              return (
                <div key={event.id}>
                  <strong>{event.title}:</strong> {event.date} 
                  (Day: {eventDate.getUTCDate()}, Month: {eventDate.getUTCMonth()}, Year: {eventDate.getUTCFullYear()})
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Events List */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">
          Upcoming Events This Month ({events.length} events found)
        </h3>
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No events scheduled for this month</p>
              <p className="text-xs text-gray-400 mt-2">
                Viewing: {monthName}
              </p>
            </div>
          ) : (
            events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(event => (
                <div
                  key={event.id}
                  className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEventClick(event.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-1">{event.title}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">📅 Date:</span>{' '}
                          {new Date(event.date).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">📍 Type:</span> {event.event_type}
                        </p>
                        {event.speaker_name && (
                          <p>
                            <span className="font-medium">👤 Speaker:</span> {event.speaker_name}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">🌐 Location:</span>{' '}
                          {event.is_virtual ? 'Virtual' : event.location}
                        </p>
                        {event.capacity && (
                          <p>
                            <span className="font-medium">👥 Capacity:</span>{' '}
                            {event.attendee_count}/{event.capacity}
                            {event.is_full && <span className="text-red-600 ml-2">(Full)</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
