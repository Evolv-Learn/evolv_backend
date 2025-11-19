'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { eventsApi } from '@/lib/api/courses';
import { formatDateTime } from '@/lib/utils';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  is_virtual: boolean;
  location: string;
  course: string;
  partners: string[];
  image?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [typeFilter, setTypeFilter] = useState<'all' | 'virtual' | 'physical'>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventsApi.getAll();
      setEvents(data.results || data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    const matchesTimeFilter = 
      filter === 'all' ||
      (filter === 'upcoming' && eventDate >= now) ||
      (filter === 'past' && eventDate < now);
    
    const matchesTypeFilter =
      typeFilter === 'all' ||
      (typeFilter === 'virtual' && event.is_virtual) ||
      (typeFilter === 'physical' && !event.is_virtual);
    
    return matchesTimeFilter && matchesTypeFilter;
  });

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-success to-green-700 text-white py-16 pattern-adire relative">
        <div className="kente-strip absolute top-0 left-0 right-0"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-heading font-bold mb-4">
            Events & Workshops
          </h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto">
            Join our community events, workshops, and networking sessions
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Time Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { value: 'upcoming', label: 'Upcoming', icon: '📅' },
              { value: 'past', label: 'Past Events', icon: '📚' },
              { value: 'all', label: 'All Events', icon: '🎉' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value as any)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  filter === item.value
                    ? 'bg-primary-gold text-gray-900 shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { value: 'all', label: 'All Types' },
              { value: 'virtual', label: '💻 Virtual' },
              { value: 'physical', label: '🏢 Physical' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setTypeFilter(item.value as any)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  typeFilter === item.value
                    ? 'bg-secondary-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-heading font-bold mb-2">No events found</h3>
            <p className="text-gray-600">
              {filter === 'upcoming' ? 'No upcoming events at the moment' : 'No events match your filters'}
            </p>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && filteredEvents.length > 0 && (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Showing <span className="font-bold text-secondary-blue">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => {
                const eventDate = new Date(event.date);
                const isPast = eventDate < new Date();
                
                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow ${
                      isPast ? 'opacity-75' : ''
                    }`}
                  >
                    {/* Event Image/Header */}
                    <div className="relative h-48 bg-gradient-to-br from-primary-gold to-primary-gold-dark flex items-center justify-center">
                      <div className="text-6xl">🎉</div>
                      
                      {/* Date Badge */}
                      <div className="absolute top-4 left-4 bg-white rounded-lg p-3 text-center shadow-md">
                        <div className="text-2xl font-bold text-secondary-blue">
                          {eventDate.getDate()}
                        </div>
                        <div className="text-xs text-gray-600 uppercase">
                          {eventDate.toLocaleString('default', { month: 'short' })}
                        </div>
                      </div>

                      {/* Virtual/Physical Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          event.is_virtual
                            ? 'bg-blue-500 text-white'
                            : 'bg-green-500 text-white'
                        }`}>
                          {event.is_virtual ? '💻 Virtual' : '🏢 Physical'}
                        </span>
                      </div>

                      {/* Past Event Overlay */}
                      {isPast && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="px-4 py-2 bg-white text-gray-900 rounded-full font-semibold">
                            Past Event
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-heading font-bold text-secondary-blue mb-2">
                        {event.title}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {event.description}
                      </p>

                      {/* Event Details */}
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatDateTime(event.date)}</span>
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                        )}

                        {event.course && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>{event.course}</span>
                          </div>
                        )}
                      </div>

                      <div className="kente-strip mb-4"></div>

                      <Button
                        variant={isPast ? 'outline' : 'primary'}
                        className="w-full"
                        disabled={isPast}
                      >
                        {isPast ? 'Event Ended' : 'Register Now'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
