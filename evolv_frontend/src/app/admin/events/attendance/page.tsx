'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';

interface Event {
  id: number;
  title: string;
  date: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Attendance {
  id: number;
  event: Event;
  student: Student;
  attended: boolean;
}

export default function EventAttendancePage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchAttendance();
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const [eventsRes, studentsRes] = await Promise.all([
        apiClient.get('/events/'),
        apiClient.get('/students/'),
      ]);
      setEvents(eventsRes.data.results || eventsRes.data);
      setStudents(studentsRes.data.results || studentsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await apiClient.get(`/event-attendance/?event=${selectedEvent}`);
      setAttendances(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const handleToggleAttendance = async (studentId: number, currentStatus: boolean) => {
    if (!selectedEvent) return;

    setIsSaving(true);
    try {
      // Find existing attendance record
      const existingAttendance = attendances.find(
        a => a.student.id === studentId && a.event.id === selectedEvent
      );

      if (existingAttendance) {
        // Update existing record
        await apiClient.patch(`/event-attendance/${existingAttendance.id}/`, {
          attended: !currentStatus,
        });
      } else {
        // Create new record
        await apiClient.post('/event-attendance/', {
          event: selectedEvent,
          student: studentId,
          attended: true,
        });
      }

      // Refresh attendance data
      await fetchAttendance();
    } catch (error) {
      console.error('Failed to update attendance:', error);
      alert('Failed to update attendance. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getAttendanceStatus = (studentId: number): boolean => {
    const attendance = attendances.find(
      a => a.student.id === studentId && a.event.id === selectedEvent
    );
    return attendance?.attended || false;
  };

  const selectedEventData = events.find(e => e.id === selectedEvent);
  const attendedCount = attendances.filter(a => a.attended).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading attendance data...</p>
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
            <span>←</span> Back to My Account
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
            Event Attendance Tracking ✅
          </h1>
          <p className="text-gray-600">Track student attendance for events</p>
        </div>

        {/* Event Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Event
          </label>
          <select
            value={selectedEvent || ''}
            onChange={(e) => setSelectedEvent(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
          >
            <option value="">Choose an event...</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Attendance Stats */}
        {selectedEvent && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-primary-gold mb-2">{students.length}</div>
              <div className="text-gray-600">Total Students</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-success mb-2">{attendedCount}</div>
              <div className="text-gray-600">Attended</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-igbo-red mb-2">
                {students.length - attendedCount}
              </div>
              <div className="text-gray-600">Absent</div>
            </div>
          </div>
        )}

        {/* Attendance List */}
        {selectedEvent ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-heading font-bold text-secondary-blue">
                {selectedEventData?.title}
              </h2>
              <p className="text-gray-600">
                {selectedEventData && new Date(selectedEventData.date).toLocaleString()}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Attendance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => {
                    const attended = getAttendanceStatus(student.id);
                    return (
                      <tr key={student.id} className="hover:bg-warm-white transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{student.email}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleAttendance(student.id, attended)}
                            disabled={isSaving}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                              attended
                                ? 'bg-success text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {attended ? '✓ Present' : '✗ Absent'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Select an Event</h3>
            <p className="text-gray-600">Choose an event from the dropdown to track attendance</p>
          </div>
        )}
      </div>
    </div>
  );
}
