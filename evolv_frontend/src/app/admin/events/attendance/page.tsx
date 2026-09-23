'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useRequireAuth } from '@/lib/auth/useRequireAuth';

interface Event {
  id: number;
  title: string;
  date: string;
}

interface Registration {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  how_heard: string;
  created_at: string;
  event_title: string;
  event_date: string;
}

export default function EventRegistrationsPage() {
  const router = useRouter();
  const isAuthReady = useRequireAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | ''>('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthReady) return;
    fetchEvents();
  }, [isAuthReady]);

  useEffect(() => {
    if (isAuthReady && selectedEvent) {
      fetchRegistrations(selectedEvent);
    } else {
      setRegistrations([]);
    }
  }, [selectedEvent, isAuthReady]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/events/');
      setEvents(res.data.results || res.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegistrations = async (eventId: number) => {
    try {
      setIsFetching(true);
      const res = await apiClient.get(`/admin/events/${eventId}/registrations/`);
      setRegistrations(res.data.results || res.data);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const filteredRegistrations = registrations.filter(r =>
    r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEventData = events.find(e => e.id === selectedEvent);

  const handleCopyEmails = () => {
    const emails = filteredRegistrations.map(r => r.email).join(', ');
    navigator.clipboard.writeText(emails);
    alert(`${filteredRegistrations.length} email(s) copied to clipboard.`);
  };

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
          <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
            Event Registrations 📋
          </h1>
          <p className="text-gray-600">
            View everyone who registered for an event
          </p>
        </div>

        {/* Event Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Event
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
          >
            <option value="">Choose an event...</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} — {new Date(event.date).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </option>
            ))}
          </select>
        </div>

        {/* Stats + Search */}
        {selectedEvent && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-primary-gold mb-1">
                  {registrations.length}
                </div>
                <div className="text-gray-600">Total Registered</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-secondary-blue mb-1">
                  {filteredRegistrations.length}
                </div>
                <div className="text-gray-600">Showing (filtered)</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg flex items-center">
                <Button
                  variant="outline"
                  onClick={handleCopyEmails}
                  className="w-full"
                  disabled={filteredRegistrations.length === 0}
                >
                  📋 Copy All Emails
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <input
                type="text"
                placeholder="Search by name, email, or organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              />
            </div>
          </>
        )}

        {/* Registrations Table */}
        {selectedEvent ? (
          isFetching ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Loading registrations...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                {searchTerm ? 'No matches found' : 'No registrations yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search'
                  : `Nobody has registered for ${selectedEventData?.title} yet`}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b bg-gray-50">
                <h2 className="text-xl font-heading font-bold text-secondary-blue">
                  {selectedEventData?.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedEventData && new Date(selectedEventData.date).toLocaleString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary-blue text-white">
                    <tr>
                      <th className="px-5 py-4 text-left font-semibold">#</th>
                      <th className="px-5 py-4 text-left font-semibold">Full Name</th>
                      <th className="px-5 py-4 text-left font-semibold">Email</th>
                      <th className="px-5 py-4 text-left font-semibold">Phone</th>
                      <th className="px-5 py-4 text-left font-semibold">Organisation</th>
                      <th className="px-5 py-4 text-left font-semibold">How They Heard</th>
                      <th className="px-5 py-4 text-left font-semibold">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRegistrations.map((reg, index) => (
                      <tr key={reg.id} className="hover:bg-warm-white transition-colors">
                        <td className="px-5 py-4 text-gray-500">{index + 1}</td>
                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {reg.full_name}
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          <a
                            href={`mailto:${reg.email}`}
                            className="text-secondary-blue hover:underline"
                          >
                            {reg.email}
                          </a>
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {reg.phone || '—'}
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {reg.organization || '—'}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {reg.how_heard || '—'}
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {new Date(reg.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎪</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Select an Event</h3>
            <p className="text-gray-600">
              Choose an event from the dropdown above to see who registered
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
