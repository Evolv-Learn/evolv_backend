'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: {
    id: number;
    name: string;
    location_type: string;
  } | null;
  is_virtual: boolean;
  image: string | null;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/events/');
      setEvents(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (eventId: number, eventTitle: string) => {
    if (!confirm(`Are you sure you want to DELETE "${eventTitle}"? This action cannot be undone!`)) {
      return;
    }

    setDeletingId(eventId);
    try {
      await apiClient.delete(`/events/${eventId}/`);
      alert(`Event "${eventTitle}" deleted successfully!`);
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

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
            <span>←</span> Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
                Event Management 🎉
              </h1>
              <p className="text-gray-600">Manage all events and workshops</p>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push('/admin/events/create')}
            >
              ➕ Create New Event
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary-gold mb-2">{events.length}</div>
            <div className="text-gray-600">Total Events</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-secondary-blue mb-2">
              {events.filter(e => e.is_virtual).length}
            </div>
            <div className="text-gray-600">Virtual Events</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-success mb-2">
              {events.filter(e => !e.is_virtual).length}
            </div>
            <div className="text-gray-600">In-Person Events</div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Events
          </label>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
          />
        </div>

        {/* Events Grid */}
        <div className="grid gap-6">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Events Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Try adjusting your search criteria' : 'No events have been created yet'}
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {event.image && (
                    <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-2">
                          {event.title}
                        </h3>
                        <div className="flex gap-2 mb-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            event.is_virtual 
                              ? 'bg-secondary-blue text-white' 
                              : 'bg-success text-white'
                          }`}>
                            {event.is_virtual ? '💻 Virtual' : '📍 In-Person'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-warm-white rounded-lg p-4 mb-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{new Date(event.date).toLocaleString()}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>{event.location.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(event.id, event.title)}
                        disabled={deletingId === event.id}
                        className="text-igbo-red border-igbo-red hover:bg-igbo-red hover:text-white"
                      >
                        {deletingId === event.id ? '⏳' : '🗑️'} Delete
                      </Button>
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
