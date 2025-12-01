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
  compact?: boolean;
}

export default function EventCalendar({ userRole = 'admin', compact = false }: EventCalendarProps) {
  const router = useRouter();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAllEvents, setShowAllEvents] = useState(false);
  
  // Filters
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('current');
  
  // Unique values for filters
  const [locations, setLocations] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  useEffect(() => {
    applyFilters();
  }, [allEvents, selectedLocation, selectedCourse, selectedMonth]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
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
        const eventsList = data.events || [];
        setAllEvents(eventsList);
        
        // Extract unique locations and courses for filters
        const uniqueLocations = [...new Set(eventsList.map((e: Event) => e.location).filter(Boolean))];
        const uniqueCourses = [...new Set(eventsList.map((e: Event) => e.course).filter(Boolean))];
        setLocations(uniqueLocations);
        setCourses(uniqueCourses);
      } else {
        console.error('Failed to fetch events:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allEvents];
    
    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(event => event.location === selectedLocation);
    }
    
    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(event => event.course === selectedCourse);
    }
    
    setEvents(filtered);
  };

  const clearFilters = () => {
    setSelectedLocation('all');
    setSelectedCourse('all');
    setSelectedMonth('current');
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

  // Compact mode for dashboards
  if (compact) {
    return (
      <div>
        {/* Compact Header */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateMonth('prev')}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-sm"
            >
              ←
            </button>
            <h3 className="text-lg font-semibold">{monthName}</h3>
            <button
              onClick={() => navigateMonth('next')}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-sm"
            >
              →
            </button>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        {/* Compact Event List - Show only next 3 events */}
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">No events this month</p>
            </div>
          ) : (
            events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 3)
              .map(event => (
                <div
                  key={event.id}
                  className="bg-white border-l-4 border-blue-500 rounded p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEventClick(event.id)}
                >
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">{event.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>📅 {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>🕐 {new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    <span>{event.is_virtual ? '💻 Virtual' : `📍 ${event.location}`}</span>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* View All Link */}
        {events.length > 3 && (
          <div className="mt-3 text-center">
            <button
              onClick={() => router.push('/admin/events/calendar')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all {events.length} events →
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full mode for dedicated calendar page
  return (
    <div>
      {/* Event Count Summary */}
      <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold mb-1">{allEvents.length}</h3>
            <p className="text-blue-100">Total Events in {monthName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100 mb-1">After Filters:</p>
            <p className="text-2xl font-bold">{events.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Locations ({allEvents.length})</option>
              {locations.map(location => (
                <option key={location} value={location}>
                  {location} ({allEvents.filter(e => e.location === location).length})
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📚 Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Courses ({allEvents.length})</option>
              {courses.map(course => (
                <option key={course} value={course}>
                  {course} ({allEvents.filter(e => e.course === course).length})
                </option>
              ))}
            </select>
          </div>

          {/* Month Navigation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Month
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="flex-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                ← Prev
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="flex-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-semibold">{monthName}</h2>
        
        <button
          onClick={() => setShowAllEvents(!showAllEvents)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {showAllEvents ? '📅 Show Calendar' : '📋 Show All Events'}
        </button>
      </div>

      {/* Calendar Grid or List View */}
      {!showAllEvents ? (
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
      ) : null}

      {/* All Events List View */}
      {showAllEvents && (
      <div className={showAllEvents ? '' : 'mt-8'}>
        <h3 className="text-xl font-bold mb-4">
          {showAllEvents ? 'All Events' : 'Upcoming Events'} ({events.length} {events.length === 1 ? 'event' : 'events'})
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
                  className="bg-white border-l-4 border-blue-500 rounded-lg p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleEventClick(event.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-3xl">
                          {event.is_virtual ? '💻' : '📍'}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="space-y-2">
                          <p className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">📅 Date:</span>
                            <span className="text-gray-900 font-semibold">
                              {new Date(event.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">🕐 Time:</span>
                            <span className="text-gray-900 font-semibold">
                              {new Date(event.date).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          </p>
                          {event.course && (
                            <p className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">📚 Course:</span>
                              <span className="text-blue-600 font-semibold">{event.course}</span>
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">🌐 Location:</span>
                            <span className="text-gray-900 font-semibold">
                              {event.is_virtual ? 'Virtual Event' : event.location}
                            </span>
                          </p>
                          {event.speaker_name && (
                            <p className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">👤 Speaker:</span>
                              <span className="text-gray-900 font-semibold">{event.speaker_name}</span>
                            </p>
                          )}
                          {event.capacity && (
                            <p className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">👥 Capacity:</span>
                              <span className={`font-semibold ${event.is_full ? 'text-red-600' : 'text-green-600'}`}>
                                {event.attendee_count}/{event.capacity}
                                {event.is_full && ' (Full)'}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      )}
    </div>
  );
}
