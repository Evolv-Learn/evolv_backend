'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  is_virtual: boolean;
  image?: string | null;
  location: { name: string } | string | null;
  course: { name: string } | string | null;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString('en-GB', { day: '2-digit' }),
    month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    full: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

function locationName(loc: Event['location']): string | null {
  if (!loc) return null;
  return typeof loc === 'string' ? loc : loc.name;
}

function courseName(c: Event['course']): string | null {
  if (!c) return null;
  return typeof c === 'string' ? c : c.name;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [typeFilter, setTypeFilter] = useState<'all' | 'virtual' | 'physical'>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState({ full_name: '', email: '', phone: '', organization: '', how_heard: '' });
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [registrationError, setRegistrationError] = useState('');

  useEffect(() => {
    apiClient
      .get('/events/')
      .then((r) => setEvents(r.data.results ?? r.data))
      .catch(() => setError('Could not load events. Please try again later.'))
      .finally(() => setIsLoading(false));
  }, []);

  const now = new Date();
  const filtered = events.filter((e) => {
    const d = new Date(e.date);
    const timeOk =
      filter === 'all' ||
      (filter === 'upcoming' && d >= now) ||
      (filter === 'past' && d < now);
    const typeOk =
      typeFilter === 'all' ||
      (typeFilter === 'virtual' && e.is_virtual) ||
      (typeFilter === 'physical' && !e.is_virtual);
    return timeOk && typeOk;
  });

  const openEvent = (event: Event) => {
    setSelectedEvent(event);
    setRegistration({ full_name: '', email: '', phone: '', organization: '', how_heard: '' });
    setRegistrationStatus('idle');
    setRegistrationError('');
  };

  const submitRegistration = async () => {
    if (!selectedEvent) return;
    if (!registration.full_name.trim() || !registration.email.trim()) {
      setRegistrationError('Name and email are required.');
      return;
    }

    setRegistrationStatus('saving');
    setRegistrationError('');
    try {
      await apiClient.post('/events/register/', {
        event: selectedEvent.id,
        ...registration,
        full_name: registration.full_name.trim(),
        email: registration.email.trim(),
      });
      setRegistrationStatus('success');
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        const message = Object.values(data).flat().join(' ');
        setRegistrationError(message || 'Could not complete registration.');
      } else {
        setRegistrationError('Could not complete registration. Please try again.');
      }
      setRegistrationStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero */}
      <section className="relative bg-secondary-blue text-white py-20 overflow-hidden">
        <div className="kente-strip absolute top-0 left-0 right-0"></div>
        <div className="absolute inset-0 pattern-adire opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <p className="text-primary-gold text-sm font-semibold uppercase tracking-widest mb-3">
            Evolv Events
          </p>
          <h1 className="text-5xl font-heading font-bold mb-4">Live Sessions &amp; Workshops</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join our live Discord sessions, workshops, and cohort events. All sessions are recorded for enrolled students.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {([['upcoming', 'Upcoming'], ['past', 'Past Events'], ['all', 'All Events']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                filter === val
                  ? 'bg-primary-gold text-gray-900 border-primary-gold shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-gold'
              }`}
            >
              {label}
            </button>
          ))}
          <span className="w-px h-9 bg-gray-200 self-center hidden sm:block" />
          {([['all', 'All Types'], ['virtual', 'Virtual'], ['physical', 'Physical']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTypeFilter(val)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                typeFilter === val
                  ? 'bg-secondary-blue text-white border-secondary-blue shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-secondary-blue'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="max-w-md mx-auto text-center py-20">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center max-w-lg mx-auto">
            <svg className="w-12 h-12 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 font-medium">No events found</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter === 'upcoming' ? 'No upcoming events scheduled â€” check back soon.' : 'Try adjusting your filters.'}
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event) => {
              const isPast = new Date(event.date) < now;
              const d = formatDate(event.date);
              const loc = locationName(event.location);
              const course = courseName(event.course);
              return (
                <div
                  key={event.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col ${isPast ? 'opacity-70' : ''}`}
                >
                  {/* Image / header */}
                  <div className="relative h-40 bg-secondary-blue/5 overflow-hidden">
                    {event.image ? (
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-secondary-blue/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Date badge */}
                    <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-2 text-center shadow-sm min-w-[52px]">
                      <p className="text-xs font-bold text-primary-gold leading-none">{d.month}</p>
                      <p className="text-xl font-heading font-bold text-secondary-blue leading-tight">{d.day}</p>
                    </div>
                    {/* Type badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${event.is_virtual ? 'bg-hausa-indigo text-white' : 'bg-success text-white'}`}>
                        {event.is_virtual ? 'Virtual' : 'In-person'}
                      </span>
                    </div>
                    {isPast && (
                      <div className="absolute inset-0 bg-gray-900/25 flex items-center justify-center">
                        <span className="bg-gray-800 text-gray-200 text-xs font-semibold px-3 py-1 rounded-full">Past Event</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <h3 className="font-heading font-bold text-secondary-blue text-lg leading-snug">{event.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{event.description}</p>

                    <div className="mt-auto pt-3 border-t border-gray-50 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {d.full} &middot; {d.time}
                      </div>
                      {loc && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {loc}
                        </div>
                      )}
                      {course && (
                        <span className="inline-block text-xs bg-primary-gold/10 text-primary-gold font-medium px-2 py-0.5 rounded-full">
                          {course}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEvent(event)}
                      disabled={isPast}
                      className="w-full mt-2"
                    >
                      View Details & Register
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                <p className="text-primary-gold text-xs font-bold uppercase tracking-widest mb-2">Event Registration</p>
                <h2 className="font-heading text-2xl font-bold text-secondary-blue">{selectedEvent.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{formatDate(selectedEvent.date).full} &middot; {formatDate(selectedEvent.date).time}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none" aria-label="Close">&times;</button>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{selectedEvent.description}</p>
              <div className="bg-warm-white rounded-xl p-4 text-sm text-gray-600">
                Register with your name and email. You will receive a confirmation email now, and the meeting link will be sent two days before the event.
              </div>

              {registrationStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-5">
                  <h3 className="font-heading font-bold text-lg mb-1">Registration confirmed</h3>
                  <p className="text-sm">Please check your email for the event details. We will send the meeting link two days before the session.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold" placeholder="Full name *" value={registration.full_name} onChange={(e) => setRegistration({ ...registration, full_name: e.target.value })} />
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold" type="email" placeholder="Email address *" value={registration.email} onChange={(e) => setRegistration({ ...registration, email: e.target.value })} />
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold" placeholder="Phone number" value={registration.phone} onChange={(e) => setRegistration({ ...registration, phone: e.target.value })} />
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold" placeholder="Organization or school" value={registration.organization} onChange={(e) => setRegistration({ ...registration, organization: e.target.value })} />
                  <input className="sm:col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold" placeholder="How did you hear about this event?" value={registration.how_heard} onChange={(e) => setRegistration({ ...registration, how_heard: e.target.value })} />
                </div>
              )}

              {registrationError && <p className="text-sm text-red-600">{registrationError}</p>}

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
                {registrationStatus !== 'success' && (
                  <Button variant="primary" onClick={submitRegistration} isLoading={registrationStatus === 'saving'}>
                    Register for Event
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
            Want to attend future sessions?
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
            All live sessions are included when you enrol in a programme.
          </p>
          <Link href="/admission">
            <Button variant="primary" size="md">Apply for the Next Cohort</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
